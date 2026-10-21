import { useCallback, useEffect, useRef, useState } from "react";
import { Check, FileDown, LogOut, MessageCircle, RefreshCw, Save, Smartphone, UploadCloud, Wrench, X } from "lucide-react";
import "./admin.css";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STATUS_TABS = ["all", "pending", "accepted", "rejected"];
const TYPE_TABS = ["all", "quote", "sell"];
const BOOKING_STATUSES = [
  ["pending", "Pending"], ["accepted", "Accepted"], ["pickup_scheduled", "Pickup Scheduled"],
  ["device_received", "Device Received"], ["repair_in_progress", "Repair in Progress"],
  ["repair_completed", "Repair Completed"], ["out_for_delivery", "Out for Delivery"],
  ["delivered", "Delivered"], ["cancelled", "Cancelled"],
];
const BOOKING_FILTERS = ["all", "pending", "active", "delivered", "cancelled"];
const ACTIVE_SET = ["accepted", "pickup_scheduled", "device_received", "repair_in_progress", "repair_completed", "out_for_delivery"];

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return value;
  }
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function statusLabel(status) {
  const found = BOOKING_STATUSES.find(([value]) => value === status);
  return found ? found[1] : status;
}

function statusClass(status) {
  if (status === "cancelled") return "rejected";
  if (["accepted", "repair_completed", "delivered"].includes(status)) return "accepted";
  return "pending";
}

function customerWaLink(booking) {
  const digits = (booking.phone || "").replace(/\D/g, "");
  const number = digits.length === 10 ? `91${digits}` : digits;
  const message = `Hi ${booking.name}, regarding your Dolmencare repair booking ${booking.booking_id} (${booking.brand} ${booking.model} — ${booking.problem}).`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [apk, setApk] = useState(null);
  const [apkBusy, setApkBusy] = useState(false);
  const [apkMsg, setApkMsg] = useState("");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState("all");
  const [bookingDrafts, setBookingDrafts] = useState({});
  const [waNumber, setWaNumber] = useState("");
  const [waMsg, setWaMsg] = useState("");
  const [waBusy, setWaBusy] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : false))
      .then(setUser)
      .catch(() => setUser(false));
  }, []);

  const loadLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const res = await fetch(`${API}/admin/leads`, { credentials: "include" });
      if (res.status === 401) { setUser(false); return; }
      const data = await res.json();
      setLeads(data.leads || []);
    } catch {
      setActionError("Could not load enquiries. Please refresh.");
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch(`${API}/admin/bookings`, { credentials: "include" });
      if (res.status === 401) { setUser(false); return; }
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      setActionError("Could not load bookings. Please refresh.");
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  const loadWa = useCallback(async () => {
    try {
      const res = await fetch(`${API}/settings/whatsapp`);
      const data = await res.json();
      if (data?.number) setWaNumber(data.number);
    } catch { /* keep empty */ }
  }, []);

  const loadApk = useCallback(async () => {
    try {
      const res = await fetch(`${API}/app/apk-info`);
      setApk(await res.json());
    } catch {
      setApk({ available: false });
    }
  }, []);

  const loadAll = useCallback(() => { loadLeads(); loadBookings(); loadApk(); }, [loadLeads, loadBookings, loadApk]);

  useEffect(() => {
    if (user) { loadAll(); loadWa(); }
  }, [user, loadAll, loadWa]);

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 5000);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = body.detail;
        setLoginError(typeof detail === "string" ? detail : "Login failed. Please try again.");
        return;
      }
      setUser(body);
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    setUser(false);
  };

  const updateStatus = async (lead, status) => {
    setActionError("");
    try {
      const res = await fetch(`${API}/admin/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) { setUser(false); return; }
      if (!res.ok) throw new Error();
      const body = await res.json();
      setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, status } : item)));
      flash(body.email_sent ? `Enquiry ${status} — customer notified by email.` : `Enquiry marked as ${status}.`);
    } catch {
      setActionError("Could not update that enquiry. Please try again.");
    }
  };

  const setDraft = (bookingId, patch) => {
    setBookingDrafts((current) => ({ ...current, [bookingId]: { ...(current[bookingId] || {}), ...patch } }));
  };

  const saveBooking = async (booking) => {
    const draft = bookingDrafts[booking.booking_id] || {};
    const payload = {};
    if (draft.status && draft.status !== booking.status) payload.status = draft.status;
    if (draft.reason !== undefined && draft.reason !== "") payload.reason = draft.reason;
    if (draft.note !== undefined && draft.note !== (booking.admin_notes || "")) payload.note = draft.note;
    if (Object.keys(payload).length === 0) { flash("Nothing to update."); return; }
    setActionError("");
    try {
      const res = await fetch(`${API}/admin/bookings/${booking.booking_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { setUser(false); return; }
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setBookings((current) => current.map((item) => (item.booking_id === booking.booking_id ? updated : item)));
      setBookingDrafts((current) => ({ ...current, [booking.booking_id]: {} }));
      flash(`Booking ${booking.booking_id} updated.`);
    } catch {
      setActionError("Could not update that booking. Please try again.");
    }
  };

  const saveWa = async () => {
    setWaBusy(true);
    setWaMsg("");
    try {
      const res = await fetch(`${API}/admin/settings/whatsapp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ number: waNumber }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 401) { setUser(false); return; }
      if (!res.ok) {
        setWaMsg(typeof body.detail === "string" ? body.detail : "Could not save the number.");
        return;
      }
      setWaNumber(body.number);
      setWaMsg(`Saved. All website WhatsApp buttons now use +${body.number}.`);
    } catch {
      setWaMsg("Network error. Please try again.");
    } finally {
      setWaBusy(false);
    }
  };

  const uploadApk = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) { setApkMsg("Choose an .apk file first."); return; }
    setApkBusy(true);
    setApkMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API}/admin/apk`, { method: "POST", credentials: "include", body: formData });
      if (res.status === 401) { setUser(false); return; }
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setApkMsg(typeof body.detail === "string" ? body.detail : "Upload failed. Please try again.");
        return;
      }
      setApkMsg(`Uploaded ${body.filename} (${formatSize(body.size)}). The download button is now live.`);
      fileInputRef.current.value = "";
      loadApk();
    } catch {
      setApkMsg("Upload failed. Please try again.");
    } finally {
      setApkBusy(false);
    }
  };

  if (user === null) {
    return <div className="admin-root admin-center" data-testid="admin-loading"><span className="admin-spinner" />Checking your session…</div>;
  }

  if (!user) {
    return (
      <div className="admin-root admin-login-wrap">
        <form className="admin-login-card" onSubmit={handleLogin} data-testid="admin-login-form">
          <span className="admin-brand-mark"><Wrench size={20} /></span>
          <h1>Dolmencare Admin</h1>
          <p>Sign in to manage bookings and enquiries.</p>
          {loginError && <p className="admin-error" data-testid="admin-login-error">{loginError}</p>}
          <label>Email<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" data-testid="admin-email-input" /></label>
          <label>Password<input name="password" type="password" required autoComplete="current-password" placeholder="Your password" data-testid="admin-password-input" /></label>
          <button className="admin-button" type="submit" disabled={loginBusy} data-testid="admin-login-button">{loginBusy ? "Signing in…" : "Sign in"}</button>
          <a className="admin-back-link" href="/" data-testid="admin-back-to-site">← Back to website</a>
        </form>
      </div>
    );
  }

  const counts = {
    all: leads.length,
    pending: leads.filter((l) => (l.status || "pending") === "pending").length,
    accepted: leads.filter((l) => l.status === "accepted").length,
    rejected: leads.filter((l) => l.status === "rejected").length,
  };
  const visible = leads.filter((lead) => {
    const statusOk = statusFilter === "all" || (lead.status || "pending") === statusFilter;
    const typeOk = typeFilter === "all" || lead.type === typeFilter;
    return statusOk && typeOk;
  });
  const visibleBookings = bookings.filter((b) => {
    if (bookingFilter === "all") return true;
    if (bookingFilter === "active") return ACTIVE_SET.includes(b.status);
    return b.status === bookingFilter;
  });
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="admin-root" data-testid="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-topbar-brand"><span className="admin-brand-mark"><Wrench size={18} /></span><span>Dolmencare <b>Admin</b></span></div>
        <div className="admin-topbar-actions">
          <span className="admin-user" data-testid="admin-user-email">{user.email}</span>
          <button className="admin-icon-button" onClick={loadAll} title="Refresh" data-testid="admin-refresh-button"><RefreshCw size={16} /></button>
          <button className="admin-icon-button" onClick={handleLogout} title="Log out" data-testid="admin-logout-button"><LogOut size={16} /></button>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-stats" data-testid="admin-stats">
          {STATUS_TABS.map((tab) => (
            <button key={tab} className={`admin-stat ${statusFilter === tab ? "active" : ""}`} onClick={() => setStatusFilter(tab)} data-testid={`filter-tab-${tab}`}>
              <b>{counts[tab]}</b><span>{tab === "all" ? "All enquiries" : tab}</span>
            </button>
          ))}
        </section>

        <section className="admin-panel" data-testid="bookings-panel">
          <div className="admin-panel-head">
            <h2>Repair Bookings {pendingBookings > 0 && <span className="lead-status pending">{pendingBookings} new</span>}</h2>
            <div className="admin-type-filter">
              {BOOKING_FILTERS.map((filter) => (
                <button key={filter} className={bookingFilter === filter ? "active" : ""} onClick={() => setBookingFilter(filter)} data-testid={`booking-filter-${filter}`}>
                  {filter === "all" ? "All" : filter === "active" ? "Active" : filter[0].toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {bookingsLoading ? (
            <p className="admin-empty" data-testid="bookings-loading">Loading bookings…</p>
          ) : visibleBookings.length === 0 ? (
            <p className="admin-empty" data-testid="empty-bookings-state">No bookings here yet. New repair bookings from the website will appear automatically.</p>
          ) : (
            <div className="admin-leads" data-testid="admin-bookings-list">
              {visibleBookings.map((booking) => {
                const draft = bookingDrafts[booking.booking_id] || {};
                const selectedStatus = draft.status ?? booking.status;
                return (
                  <article className="admin-lead" key={booking.booking_id} data-testid={`booking-card-${booking.booking_id}`}>
                    <div className="admin-lead-top">
                      <span className="booking-id-tag">{booking.booking_id}</span>
                      <span className={`lead-status ${statusClass(booking.status)}`} data-testid={`booking-status-${booking.booking_id}`}>{statusLabel(booking.status)}</span>
                    </div>
                    <div className="admin-lead-body">
                      <span className="lead-phone">{booking.name} · <a href={`tel:${booking.phone}`} data-testid={`booking-phone-${booking.booking_id}`}>{booking.phone}</a></span>
                      <ul>
                        <li><b>Device</b>{booking.brand} {booking.model}</li>
                        <li><b>Problem</b>{booking.problem}</li>
                        {booking.description && <li><b>Details</b>{booking.description}</li>}
                        <li><b>Pickup</b>{booking.address}</li>
                        <li><b>Booked</b>{formatDate(booking.created_at)}</li>
                        {booking.cancellation_reason && <li><b>Cancel reason</b>{booking.cancellation_reason}</li>}
                      </ul>
                    </div>
                    <div className="booking-controls">
                      <div className="booking-controls-row">
                        <select className="status-select" value={selectedStatus} onChange={(e) => setDraft(booking.booking_id, { status: e.target.value })} data-testid={`booking-status-select-${booking.booking_id}`}>
                          {BOOKING_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        <a className="wa-mini" href={customerWaLink(booking)} target="_blank" rel="noreferrer" data-testid={`booking-whatsapp-${booking.booking_id}`}><MessageCircle size={14} /> WhatsApp</a>
                      </div>
                      {selectedStatus === "cancelled" && (
                        <input className="admin-input" placeholder="Reason for rejection (optional)" value={draft.reason ?? booking.cancellation_reason ?? ""} onChange={(e) => setDraft(booking.booking_id, { reason: e.target.value })} data-testid={`booking-reason-${booking.booking_id}`} />
                      )}
                      <input className="admin-input" placeholder="Internal note (only you see this)" value={draft.note ?? booking.admin_notes ?? ""} onChange={(e) => setDraft(booking.booking_id, { note: e.target.value })} data-testid={`booking-note-${booking.booking_id}`} />
                      <button className="admin-save" onClick={() => saveBooking(booking)} data-testid={`booking-save-${booking.booking_id}`}><Save size={14} /> Save update</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Quote & Sell-Phone Enquiries</h2>
            <div className="admin-type-filter">
              {TYPE_TABS.map((tab) => (
                <button key={tab} className={typeFilter === tab ? "active" : ""} onClick={() => setTypeFilter(tab)} data-testid={`type-filter-${tab}`}>
                  {tab === "all" ? "All types" : tab === "quote" ? "Repair quotes" : "Sell phone"}
                </button>
              ))}
            </div>
          </div>
          {actionError && <p className="admin-error" data-testid="admin-action-error">{actionError}</p>}
          {notice && <p className="admin-notice" data-testid="admin-action-notice">{notice}</p>}
          {leadsLoading ? (
            <p className="admin-empty" data-testid="leads-loading">Loading enquiries…</p>
          ) : visible.length === 0 ? (
            <p className="admin-empty" data-testid="empty-leads-state">No enquiries here yet. New quote and sell-phone requests will appear automatically.</p>
          ) : (
            <div className="admin-leads" data-testid="admin-leads-list">
              {visible.map((lead) => {
                const status = lead.status || "pending";
                return (
                  <article className="admin-lead" key={lead.id} data-testid={`lead-card-${lead.id}`}>
                    <div className="admin-lead-top">
                      <span className={`lead-type ${lead.type}`} data-testid={`lead-type-${lead.id}`}>{lead.type === "quote" ? "Repair quote" : "Sell phone"}</span>
                      <span className={`lead-status ${status}`} data-testid={`lead-status-${lead.id}`}>{status}</span>
                    </div>
                    <div className="admin-lead-body">
                      <a className="lead-phone" href={`tel:${lead.phone}`} data-testid={`lead-phone-${lead.id}`}>{lead.phone}</a>
                      <ul>
                        {lead.brand && <li><b>Brand</b>{lead.brand}</li>}
                        {lead.issue && <li><b>Issue</b>{lead.issue}</li>}
                        {lead.model && <li><b>Model</b>{lead.model}</li>}
                        {lead.condition && <li><b>Condition</b>{lead.condition}</li>}
                        {lead.email && <li><b>Email</b>{lead.email}</li>}
                        <li><b>Received</b>{formatDate(lead.created_at)}</li>
                      </ul>
                    </div>
                    <div className="admin-lead-actions">
                      <button className="admin-accept" disabled={status === "accepted"} onClick={() => updateStatus(lead, "accepted")} data-testid={`lead-accept-${lead.id}`}><Check size={15} /> Accept</button>
                      <button className="admin-reject" disabled={status === "rejected"} onClick={() => updateStatus(lead, "rejected")} data-testid={`lead-reject-${lead.id}`}><X size={15} /> Reject</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="admin-panel" data-testid="wa-settings">
          <div className="admin-panel-head"><h2><MessageCircle size={18} /> Business Contact Settings</h2></div>
          <p className="admin-note" style={{ margin: "0 0 12px" }}>This WhatsApp number is used by every chat and booking button on the website. Use international format with country code, e.g. +919506636245.</p>
          <div className="settings-row">
            <input className="admin-input" value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="+919506636245" data-testid="wa-settings-input" />
            <button className="admin-button" onClick={saveWa} disabled={waBusy} data-testid="wa-settings-save">{waBusy ? "Saving…" : "Save number"}</button>
          </div>
          {waMsg && <p className="admin-note" data-testid="wa-settings-status">{waMsg}</p>}
        </section>

        <section className="admin-panel" data-testid="apk-manager">
          <div className="admin-panel-head"><h2><Smartphone size={18} /> Android app (APK)</h2></div>
          <div className="apk-current" data-testid="apk-current-info">
            {apk?.available ? (
              <><FileDown size={18} /><span><b>{apk.filename}</b><small>{formatSize(apk.size)} · uploaded {formatDate(apk.uploaded_at)} · live on the website</small></span></>
            ) : (
              <><Smartphone size={18} /><span><b>No app uploaded yet</b><small>Upload an .apk and the website download button goes live instantly.</small></span></>
            )}
          </div>
          <div className="apk-upload-row">
            <input ref={fileInputRef} type="file" accept=".apk,application/vnd.android.package-archive" data-testid="apk-file-input" />
            <button className="admin-button" onClick={uploadApk} disabled={apkBusy} data-testid="apk-upload-button"><UploadCloud size={16} /> {apkBusy ? "Uploading…" : apk?.available ? "Replace APK" : "Upload APK"}</button>
          </div>
          {apkMsg && <p className="admin-note" data-testid="apk-upload-status">{apkMsg}</p>}
        </section>
      </main>
    </div>
  );
}
