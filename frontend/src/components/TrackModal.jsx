import { useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PIPELINE = ["pending", "accepted", "pickup_scheduled", "device_received", "repair_in_progress", "repair_completed", "out_for_delivery", "delivered"];

function pretty(status) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function badgeClass(status) {
  if (status === "cancelled") return "rejected";
  if (["accepted", "repair_completed", "delivered"].includes(status)) return "accepted";
  return "pending";
}

export default function TrackModal({ onClose }) {
  const { t } = useLanguage();
  const T = t.track;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setResults(null);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const res = await fetch(`${API}/bookings/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: data.booking_id || null, phone: data.phone }),
      });
      if (res.status === 404) {
        setError(T.notFound);
        return;
      }
      if (!res.ok) throw new Error(`lookup failed ${res.status}`);
      const body = await res.json();
      setResults(body.bookings || []);
    } catch (err) {
      console.error(err);
      setError(T.error);
    } finally {
      setBusy(false);
    }
  };

  const latest = results?.[0];
  const currentIndex = latest ? PIPELINE.indexOf(latest.status) : -1;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" data-lenis-prevent onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} data-testid="track-modal-close"><X /></button>
        <div className="eyebrow"><span className="eyebrow-line" /> {T.yourBooking}</div>
        <h2>{T.title}</h2>
        <p className="modal-intro">{T.intro}</p>
        <form onSubmit={submit}>
          <label>{T.idLabel} <small style={{ fontWeight: 400, color: "#64748b" }}>({T.idOptional})</small><input name="booking_id" placeholder={T.idPh} data-testid="track-id-input" /></label>
          <label>{T.phoneLabel}<input name="phone" required type="tel" placeholder={T.phonePh} data-testid="track-phone-input" /></label>
          <button className="button full-button" type="submit" disabled={busy} data-testid="track-submit-button">{busy ? T.checking : T.submit} <Search size={16} /></button>
        </form>
        {error && <p className="form-error" data-testid="track-error">{error}</p>}
        {results && (
          <div className="track-result" data-testid="track-result">
            {results.map((booking, index) => (
              <div className="track-booking-card" key={booking.booking_id} data-testid={`track-booking-${booking.booking_id}`}>
                <div className="track-result-head">
                  <span className="booking-id-chip">{booking.booking_id}</span>
                  <span className={`lead-status ${badgeClass(booking.status)}`} data-testid={index === 0 ? "track-status" : `track-status-${booking.booking_id}`}>{pretty(booking.status)}</span>
                </div>
                <ul className="booking-detail-list">
                  <li><b>{t.booking.name}</b>{booking.name}</li>
                  <li><b>{t.booking.brand}</b>{booking.brand} {booking.model}</li>
                  <li><b>{t.booking.problem}</b>{booking.problem}</li>
                </ul>
                {index === 0 && booking.status !== "cancelled" && (
                  <div className="track-pipeline" data-testid="track-pipeline">
                    {PIPELINE.map((step, sIndex) => (
                      <div key={step} className={`track-step ${sIndex <= currentIndex ? "done" : ""} ${sIndex === currentIndex ? "current" : ""}`}>
                        <span className="track-dot" />
                        <small>{pretty(step)}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <button className="text-button" onClick={onClose} data-testid="track-close-button">{t.booking.done} <ArrowRight size={17} /></button>
      </div>
    </div>
  );
}
