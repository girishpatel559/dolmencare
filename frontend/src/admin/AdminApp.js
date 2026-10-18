import { useCallback, useEffect, useRef, useState } from "react";
import { Check, FileDown, LogOut, RefreshCw, Smartphone, UploadCloud, Wrench, X } from "lucide-react";
import "./admin.css";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STATUS_TABS = ["all", "pending", "accepted", "rejected"];
const TYPE_TABS = ["all", "quote", "sell"];

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

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [actionError, setActionError] = useState("");
  const [apk, setApk] = useState(null);
  const [apkBusy, setApkBusy] = useState(false);
  const [apkMsg, setApkMsg] = useState("");
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

  const loadApk = useCallback(async () => {
    try {
      const res = await fetch(`${API}/app/apk-info`);
      setApk(await res.json());
    } catch {
      setApk({ available: false });
    }
  }, []);

  useEffect(() => {
    if (user) { loadLeads(); loadApk(); }
  }, [user, loadLeads, loadApk]);

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
      setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, status } : item)));
    } catch {
      setActionError("Could not update that enquiry. Please try again.");
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
          <p>Sign in to manage repair and sell-phone enquiries.</p>
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

  return (
    <div className="admin-root" data-testid="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-topbar-brand"><span className="admin-brand-mark"><Wrench size={18} /></span><span>Dolmencare <b>Admin</b></span></div>
        <div className="admin-topbar-actions">
          <span className="admin-user" data-testid="admin-user-email">{user.email}</span>
          <button className="admin-icon-button" onClick={loadLeads} title="Refresh" data-testid="admin-refresh-button"><RefreshCw size={16} /></button>
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

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Enquiries</h2>
            <div className="admin-type-filter">
              {TYPE_TABS.map((tab) => (
                <button key={tab} className={typeFilter === tab ? "active" : ""} onClick={() => setTypeFilter(tab)} data-testid={`type-filter-${tab}`}>
                  {tab === "all" ? "All types" : tab === "quote" ? "Repair quotes" : "Sell phone"}
                </button>
              ))}
            </div>
          </div>
          {actionError && <p className="admin-error" data-testid="admin-action-error">{actionError}</p>}
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
