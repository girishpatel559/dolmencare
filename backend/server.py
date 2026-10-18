from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Literal, Optional

import bcrypt
import jwt
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict

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
    return {"id": lead_id, "status": input.status}


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
    await seed_admin()
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as exc:
        logger.error(f"Storage init failed: {exc}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
