import { useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PIPELINE = ["pending", "accepted", "pickup_scheduled", "device_received", "repair_in_progress", "repair_completed", "out_for_delivery", "delivered"];

function pretty(status) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TrackModal({ onClose }) {
  const { t } = useLanguage();
  const T = t.track;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const res = await fetch(`${API}/bookings/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: data.booking_id, phone: data.phone }),
      });
      if (res.status === 404) {
        setError(T.notFound);
        return;
      }
      if (!res.ok) throw new Error(`lookup failed ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      console.error(err);
      setError(T.error);
    } finally {
      setBusy(false);
    }
  };

  const currentIndex = result ? PIPELINE.indexOf(result.status) : -1;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} data-testid="track-modal-close"><X /></button>
        <div className="eyebrow"><span className="eyebrow-line" /> {T.yourBooking}</div>
        <h2>{T.title}</h2>
        <p className="modal-intro">{T.intro}</p>
        <form onSubmit={submit}>
          <label>{T.idLabel}<input name="booking_id" required placeholder={T.idPh} data-testid="track-id-input" /></label>
          <label>{T.phoneLabel}<input name="phone" required type="tel" placeholder={T.phonePh} data-testid="track-phone-input" /></label>
          <button className="button full-button" type="submit" disabled={busy} data-testid="track-submit-button">{busy ? T.checking : T.submit} <Search size={16} /></button>
        </form>
        {error && <p className="form-error" data-testid="track-error">{error}</p>}
        {result && (
          <div className="track-result" data-testid="track-result">
            <div className="track-result-head">
              <span className="booking-id-chip">{result.booking_id}</span>
              <span className={`lead-status ${result.status === "cancelled" ? "rejected" : result.status === "delivered" ? "accepted" : "pending"}`} data-testid="track-status">{pretty(result.status)}</span>
            </div>
            <ul className="booking-detail-list">
              <li><b>{t.booking.name}</b>{result.name}</li>
              <li><b>{t.booking.brand}</b>{result.brand} {result.model}</li>
              <li><b>{t.booking.problem}</b>{result.problem}</li>
            </ul>
            {result.status !== "cancelled" ? (
              <div className="track-pipeline" data-testid="track-pipeline">
                {PIPELINE.map((step, index) => (
                  <div key={step} className={`track-step ${index <= currentIndex ? "done" : ""} ${index === currentIndex ? "current" : ""}`}>
                    <span className="track-dot" />
                    <small>{pretty(step)}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="form-error" data-testid="track-cancelled">{pretty(result.status)}</p>
            )}
          </div>
        )}
        <button className="text-button" onClick={onClose} data-testid="track-close-button">{t.booking.done} <ArrowRight size={17} /></button>
      </div>
    </div>
  );
}
