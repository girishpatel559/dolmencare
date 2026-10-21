import { useMemo, useState } from "react";
import { ArrowRight, Check, MessageCircle, X } from "lucide-react";
import { openWhatsApp } from "@/business";
import { useLanguage } from "@/i18n/LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BookingModal({ onClose }) {
  const { t } = useLanguage();
  const B = t.booking;
  const clientToken = useMemo(() => crypto.randomUUID(), []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);
  const [view, setView] = useState("form");

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, client_token: clientToken }),
      });
      if (!res.ok) throw new Error(`booking failed ${res.status}`);
      setBooking(await res.json());
      setView("success");
    } catch (err) {
      console.error(err);
      setError(B.error);
    } finally {
      setSubmitting(false);
    }
  };

  const chatMessage = booking
    ? `Hi Dolmencare! I just booked a repair.\nBooking ID: ${booking.booking_id}\nName: ${booking.name}\nPhone: ${booking.brand} ${booking.model}\nProblem: ${booking.problem}`
    : "";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} data-testid="booking-modal-close"><X /></button>

        {view === "form" && (
          <>
            <div className="eyebrow"><span className="eyebrow-line" /> {B.eyebrow}</div>
            <h2>{B.title}</h2>
            <p className="modal-intro">{B.intro}</p>
            {error && <p className="form-error" data-testid="booking-form-error">{error}</p>}
            <form onSubmit={submit}>
              <label>{B.brand}<select name="brand" required data-testid="booking-brand-select"><option value="">{B.chooseBrand}</option>{B.brands.map((b) => <option key={b}>{b}</option>)}</select></label>
              <label>{B.model}<input name="model" required placeholder={B.modelPh} data-testid="booking-model-input" /></label>
              <label>{B.problem}<select name="problem" required data-testid="booking-problem-select"><option value="">{B.chooseProblem}</option>{B.problems.map((p) => <option key={p}>{p}</option>)}</select></label>
              <label>{B.desc} <small style={{ fontWeight: 400, color: "#64748b" }}>({B.descOpt})</small><textarea name="description" rows="3" placeholder={B.descPh} data-testid="booking-description-input" /></label>
              <label>{B.name}<input name="name" required placeholder={B.namePh} data-testid="booking-name-input" /></label>
              <label>{B.phone}<input name="phone" required type="tel" placeholder={B.phonePh} data-testid="booking-phone-input" /></label>
              <label>{B.address}<textarea name="address" required rows="2" placeholder={B.addressPh} data-testid="booking-address-input" /></label>
              <button className="button full-button" type="submit" disabled={submitting} data-testid="booking-submit-button">{submitting ? B.submitting : B.submit} <ArrowRight size={17} /></button>
            </form>
          </>
        )}

        {view === "success" && booking && (
          <div className="success-state">
            <span><Check /></span>
            <h2>{B.successT}</h2>
            <p>{B.successP}</p>
            <div className="booking-id-chip" data-testid="booking-id">{B.bookingId}: <b>{booking.booking_id}</b></div>
            <div className="booking-success-actions">
              <button className="button" onClick={() => setView("details")} data-testid="booking-view-details">{B.viewDetails}</button>
              <button className="button whatsapp-btn" onClick={() => openWhatsApp(chatMessage)} data-testid="booking-whatsapp-chat"><MessageCircle size={16} /> {B.chat}</button>
            </div>
          </div>
        )}

        {view === "details" && booking && (
          <div data-testid="booking-details">
            <div className="eyebrow"><span className="eyebrow-line" /> {B.bookingId}: {booking.booking_id}</div>
            <h2>{B.viewDetails}</h2>
            <ul className="booking-detail-list">
              <li><b>{B.name}</b>{booking.name}</li>
              <li><b>{B.brand}</b>{booking.brand}</li>
              <li><b>{B.model}</b>{booking.model}</li>
              <li><b>{B.problem}</b>{booking.problem}</li>
              {booking.description && <li><b>{B.desc}</b>{booking.description}</li>}
              <li><b>{B.phone}</b>{booking.phone}</li>
              <li><b>{B.address}</b>{booking.address}</li>
              <li><b>{B.statusLabel}</b><span className="lead-status pending">{booking.status}</span></li>
            </ul>
            <div className="booking-success-actions">
              <button className="button whatsapp-btn" onClick={() => openWhatsApp(chatMessage)} data-testid="booking-details-whatsapp"><MessageCircle size={16} /> {B.chat}</button>
              <button className="text-button" onClick={onClose} data-testid="booking-details-done">{B.done} <ArrowRight size={17} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
