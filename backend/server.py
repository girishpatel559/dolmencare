from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import uuid
import logging
import ipaddress
from datetime import datetime, timezone, timedelta
from html import escape
from html.parser import HTMLParser
from typing import List, Literal, Optional
from urllib.parse import urlparse

import bcrypt
import httpx
import jwt
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "dolmencare"
APK_PATH = f"{APP_NAME}/app/dolmencare.apk"
storage_key = None

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Dolmencare")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str) -> Optional[str]:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if EMAIL_REPLY_TO:
        payload["contact_email"] = EMAIL_REPLY_TO
    async with httpx.AsyncClient(timeout=30) as http:
        resp = await http.post(
            f"{EMAIL_BASE_URL}/api/v1/email/send",
            headers={"X-Email-Key": EMAIL_KEY},
            json=payload,
        )
    resp.raise_for_status()
    return resp.json().get("id")


def lead_status_email(lead: dict, status: str):
    detail = escape(lead.get("issue") or lead.get("model") or "your device")
    if status == "accepted":
        headline = "Good news — your enquiry has been accepted."
        body = "Our team has accepted your request and will call you shortly to confirm the details and next steps."
    else:
        headline = "An update on your enquiry."
        body = "Unfortunately we are unable to take up this request right now. You are welcome to call us to discuss alternatives."
    subject = f"Dolmencare: your enquiry has been {status}"
    html = (
        '<table role="presentation" width="100%"><tr><td style="padding:24px;font-family:Arial,sans-serif;color:#0f172a">'
        f'<h2 style="margin:0 0 12px">{escape(EMAIL_FROM_NAME)}</h2>'
        f'<p style="font-size:16px"><strong>{headline}</strong></p>'
        f'<p>{body}</p>'
        f'<p style="color:#475569">Your request: <strong>{detail}</strong></p>'
        '<p>Questions? Call us at <a href="tel:+919506636245">+91 9506636245</a> — we are happy to help.</p>'
        f'<p style="font-size:12px;color:#888">Sent by {escape(EMAIL_FROM_NAME)} (Yashashree Corporation), Silvassa. '
        'We never ask for your password, PIN or OTP by email.</p></td></tr></table>'
    )
    return subject, html


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=180,
    )
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=180,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=120)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, user_id: str, email: str):
    response.set_cookie(key="access_token", value=create_access_token(user_id, email), httponly=True, secure=True, samesite="none", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=create_refresh_token(user_id), httponly=True, secure=True, samesite="none", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


async def seed_admin():
    admin_email = os.environ["ADMIN_EMAIL"].strip().lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Dolmencare Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin account seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated from env")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class LeadCreate(BaseModel):
    type: Literal["quote", "sell"]
    phone: str = Field(min_length=10, max_length=15, pattern=r"^\+?[0-9\s-]{10,15}$")
    email: Optional[EmailStr] = None
    brand: Optional[str] = None
    issue: Optional[str] = None
    model: Optional[str] = None
    condition: Optional[str] = None


class LeadResponse(BaseModel):
    id: str
    type: str
    phone: str
    created_at: datetime


class LoginInput(BaseModel):
    email: str
    password: str


class StatusUpdate(BaseModel):
    status: Literal["pending", "accepted", "rejected"]


BOOKING_STATUSES = ["pending", "accepted", "pickup_scheduled", "device_received", "repair_in_progress", "repair_completed", "out_for_delivery", "delivered", "cancelled"]
DEFAULT_WHATSAPP = "919506636245"


class BookingCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=10, max_length=15, pattern=r"^\+?[0-9\s-]{10,15}$")
    brand: str = Field(min_length=2, max_length=40)
    model: str = Field(min_length=2, max_length=80)
    problem: str = Field(min_length=2, max_length=80)
    description: Optional[str] = Field(default=None, max_length=600)
    address: str = Field(min_length=5, max_length=300)
    lat: Optional[float] = None
    lng: Optional[float] = None
    client_token: str = Field(min_length=8, max_length=64)


class BookingAdminUpdate(BaseModel):
    status: Optional[Literal["pending", "accepted", "pickup_scheduled", "device_received", "repair_in_progress", "repair_completed", "out_for_delivery", "delivered", "cancelled"]] = None
    reason: Optional[str] = Field(default=None, max_length=300)
    note: Optional[str] = Field(default=None, max_length=500)


class WhatsAppSetting(BaseModel):
    number: str = Field(min_length=10, max_length=16)


def booking_summary(doc: dict) -> dict:
    return {key: doc.get(key) for key in ("booking_id", "name", "phone", "brand", "model", "problem", "description", "address", "status", "created_at", "updated_at")}


@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check["timestamp"], str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])
    return status_checks


@api_router.post("/leads", response_model=LeadResponse)
async def create_lead(input: LeadCreate):
    now = datetime.now(timezone.utc).isoformat()
    lead = {
        "id": str(uuid.uuid4()),
        "type": input.type,
        "phone": input.phone,
        "email": str(input.email) if input.email else None,
        "brand": input.brand,
        "issue": input.issue,
        "model": input.model,
        "condition": input.condition,
        "status": "pending",
        "created_at": now,
        "updated_at": now,
    }
    await db.leads.insert_one(lead)
    return LeadResponse(id=lead["id"], type=lead["type"], phone=lead["phone"], created_at=datetime.fromisoformat(now))


@api_router.post("/auth/login")
async def login(input: LoginInput, request: Request, response: Response):
    email = input.email.strip().lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    now = datetime.now(timezone.utc)
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("locked_until"):
        locked_until = datetime.fromisoformat(attempt["locked_until"])
        if locked_until > now:
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        count = (attempt.get("count", 0) if attempt else 0) + 1
        update = {"identifier": identifier, "count": count, "last_attempt": now.isoformat()}
        if count >= 5:
            update["count"] = 0
            update["locked_until"] = (now + timedelta(minutes=15)).isoformat()
        await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    set_auth_cookies(response, user["id"], user["email"])
    return {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    response.set_cookie(key="access_token", value=create_access_token(user["id"], user["email"]), httponly=True, secure=True, samesite="none", max_age=900, path="/")
    return user


@api_router.get("/admin/leads")
async def list_leads(admin: dict = Depends(require_admin)):
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for lead in leads:
        lead.setdefault("status", "pending")
    return {"leads": leads}


@api_router.patch("/admin/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, input: StatusUpdate, admin: dict = Depends(require_admin)):
    result = await db.leads.update_one(
        {"id": lead_id},
        {"$set": {"status": input.status, "updated_at": datetime.now(timezone.utc).isoformat(), "handled_by": admin["email"]}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    email_sent = False
    if input.status in ("accepted", "rejected"):
        lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
        if lead and lead.get("email"):
            try:
                subject, html = lead_status_email(lead, input.status)
                await send_email(to=lead["email"], subject=subject, html=html)
                email_sent = True
            except Exception as exc:
                logger.warning(f"Status email not sent for lead {lead_id}: {exc}")
    return {"id": lead_id, "status": input.status, "email_sent": email_sent}


@api_router.post("/admin/apk")
async def upload_apk(file: UploadFile = File(...), admin: dict = Depends(require_admin)):
    if not file.filename or not file.filename.lower().endswith(".apk"):
        raise HTTPException(status_code=400, detail="Only .apk files are allowed")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    try:
        result = put_object(APK_PATH, data, "application/vnd.android.package-archive")
    except Exception as exc:
        logger.error(f"APK upload failed: {exc}")
        raise HTTPException(status_code=502, detail="Upload to storage failed. Please try again.")
    now = datetime.now(timezone.utc).isoformat()
    await db.app_files.update_many({"kind": "apk", "is_deleted": False}, {"$set": {"is_deleted": True}})
    await db.app_files.insert_one({
        "id": str(uuid.uuid4()),
        "kind": "apk",
        "storage_path": result["path"],
        "original_filename": file.filename,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": now,
        "uploaded_by": admin["email"],
    })
    return {"available": True, "filename": file.filename, "size": result.get("size", len(data)), "uploaded_at": now}


@api_router.get("/app/apk-info")
async def apk_info():
    record = await db.app_files.find_one({"kind": "apk", "is_deleted": False}, {"_id": 0}, sort=[("created_at", -1)])
    if not record:
        return {"available": False}
    return {"available": True, "filename": record["original_filename"], "size": record["size"], "uploaded_at": record["created_at"]}


@api_router.get("/app/download")
async def download_apk():
    record = await db.app_files.find_one({"kind": "apk", "is_deleted": False}, {"_id": 0}, sort=[("created_at", -1)])
    if not record:
        raise HTTPException(status_code=404, detail="No app available yet")
    try:
        data, _ = get_object(record["storage_path"])
    except Exception as exc:
        logger.error(f"APK download failed: {exc}")
        raise HTTPException(status_code=404, detail="File not found")
    return Response(
        content=data,
        media_type="application/vnd.android.package-archive",
        headers={"Content-Disposition": f'attachment; filename="{record["original_filename"]}"'},
    )


class BookingLookup(BaseModel):  # redefined here so phone-only tracking works (booking ID optional)
    booking_id: Optional[str] = Field(default=None, max_length=20)
    phone: str = Field(min_length=10, max_length=15)


def booking_public(doc: dict, verified: bool) -> dict:
    name = doc["name"] if verified else " ".join(part[0] + "*" * (len(part) - 1) for part in doc["name"].split())
    return {
        "booking_id": doc["booking_id"],
        "name": name,
        "brand": doc["brand"],
        "model": doc["model"],
        "problem": doc["problem"],
        "status": doc["status"],
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
    }


@api_router.post("/bookings")
async def create_booking(input: BookingCreate):
    existing = await db.bookings.find_one({"client_token": input.client_token}, {"_id": 0, "client_token": 0})
    if existing:
        return booking_summary(existing)
    now = datetime.now(timezone.utc).isoformat()
    booking_id = None
    for _ in range(5):
        candidate = "DC-" + uuid.uuid4().hex[:6].upper()
        if not await db.bookings.find_one({"booking_id": candidate}):
            booking_id = candidate
            break
    doc = {
        "id": str(uuid.uuid4()),
        "booking_id": booking_id,
        "name": input.name.strip(),
        "phone": input.phone.strip(),
        "brand": input.brand,
        "model": input.model.strip(),
        "problem": input.problem,
        "description": input.description,
        "address": input.address.strip(),
        "lat": input.lat,
        "lng": input.lng,
        "status": "pending",
        "status_history": [{"status": "pending", "at": now, "by": "customer"}],
        "admin_notes": "",
        "cancellation_reason": None,
        "client_token": input.client_token,
        "created_at": now,
        "updated_at": now,
    }
    try:
        await db.bookings.insert_one(doc)
    except Exception:
        existing = await db.bookings.find_one({"client_token": input.client_token}, {"_id": 0, "client_token": 0})
        if existing:
            return booking_summary(existing)
        raise
    return booking_summary(doc)


@api_router.post("/bookings/lookup")
async def lookup_booking(input: BookingLookup):
    digits = re.sub(r"\D", "", input.phone)
    if len(digits) < 10:
        raise HTTPException(status_code=404, detail="No booking found for that mobile number.")
    last10 = digits[-10:]
    if input.booking_id:
        booking = await db.bookings.find_one({"booking_id": input.booking_id.strip().upper()}, {"_id": 0, "client_token": 0})
        stored = re.sub(r"\D", "", booking["phone"]) if booking else ""
        if not booking or last10 != stored[-10:]:
            raise HTTPException(status_code=404, detail="No booking found for that ID and mobile number.")
        return {"bookings": [booking_public(booking, verified=True)]}
    bookings = await db.bookings.find({"phone": {"$regex": re.escape(last10) + "$"}}, {"_id": 0, "client_token": 0}).sort("created_at", -1).to_list(10)
    if not bookings:
        raise HTTPException(status_code=404, detail="No booking found for that mobile number.")
    return {"bookings": [booking_public(b, verified=False) for b in bookings]}


@api_router.get("/settings/whatsapp")
async def get_whatsapp_setting():
    doc = await db.settings.find_one({"key": "whatsapp_number"}, {"_id": 0})
    return {"number": doc["value"] if doc else DEFAULT_WHATSAPP}


@api_router.get("/admin/bookings")
async def list_bookings(admin: dict = Depends(require_admin)):
    bookings = await db.bookings.find({}, {"_id": 0, "client_token": 0}).sort("created_at", -1).to_list(1000)
    return {"bookings": bookings}


@api_router.patch("/admin/bookings/{booking_id}")
async def update_booking(booking_id: str, input: BookingAdminUpdate, admin: dict = Depends(require_admin)):
    booking = await db.bookings.find_one({"booking_id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    now = datetime.now(timezone.utc).isoformat()
    update = {"updated_at": now}
    push = None
    if input.status and input.status != booking.get("status"):
        update["status"] = input.status
        push = {"status": input.status, "at": now, "by": admin["email"]}
        if input.status == "cancelled":
            update["cancellation_reason"] = input.reason or None
    elif input.status == "cancelled" and input.reason is not None:
        update["cancellation_reason"] = input.reason or None
    if input.note is not None:
        update["admin_notes"] = input.note
    update_op = {"$set": update}
    if push:
        update_op["$push"] = {"status_history": push}
    await db.bookings.update_one({"booking_id": booking_id}, update_op)
    return await db.bookings.find_one({"booking_id": booking_id}, {"_id": 0, "client_token": 0})


@api_router.put("/admin/settings/whatsapp")
async def set_whatsapp_setting(input: WhatsAppSetting, admin: dict = Depends(require_admin)):
    number = re.sub(r"[\s-]", "", input.number)
    if not re.fullmatch(r"\+?[0-9]{10,15}", number):
        raise HTTPException(status_code=400, detail="Enter the number in international format, e.g. +919506636245")
    value = number.lstrip("+")
    await db.settings.update_one(
        {"key": "whatsapp_number"},
        {"$set": {"key": "whatsapp_number", "value": value, "updated_at": datetime.now(timezone.utc).isoformat(), "updated_by": admin["email"]}},
        upsert=True,
    )
    return {"number": value}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.bookings.create_index("booking_id", unique=True)
    await db.bookings.create_index("client_token", unique=True)
    await seed_admin()
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as exc:
        logger.error(f"Storage init failed: {exc}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
