import { useEffect } from "react";
import { ArrowRight, BatteryCharging, MessageCircle, Phone, Smartphone, Wrench, Zap } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { useBooking } from "@/components/BookingContext";
import { useLanguage } from "@/i18n/LanguageContext";
import "./pages.css";

const cardIcons = [Smartphone, BatteryCharging, Zap, Wrench, MessageCircle];

export default function ServicesPage() {
  const { t } = useLanguage();
  const { openBooking } = useBooking();
  const S = t.servicesPage;
  useEffect(() => { document.title = "Services — Dolmencare Mobile Repair"; }, []);
  return (
    <SiteLayout>
      <main className="page-main container" data-testid="services-page">
        <div className="page-hero">
          <div className="eyebrow"><span className="eyebrow-line" /> {S.eyebrow}</div>
          <h1>{S.t1} <span>{S.t2}</span></h1>
          <p>{S.sub}</p>
          <div className="page-cta-row">
            <button className="button" onClick={openBooking} data-testid="services-book-button">{S.book} <ArrowRight size={17} /></button>
            <a className="button button-ghost" href="tel:+919506636245" data-testid="services-call-button"><Phone size={16} /> {S.call}</a>
          </div>
        </div>

        <div className="page-grid">
          {S.cards.map((card, index) => {
            const Icon = cardIcons[index];
            return (
              <div className="info-card" key={card.title} data-testid={`services-card-${index}`}>
                <span className="info-icon"><Icon size={20} /></span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            );
          })}
        </div>

        <div className="page-band" data-testid="services-booking-info">
          <h2>{S.bookingTitle}</h2>
          <p>{S.bookingText}</p>
          <p><b>{S.availability}</b></p>
        </div>

        <div className="page-band" data-testid="services-assistance">
          <h2>{S.helpTitle}</h2>
          <p>{S.helpText}</p>
        </div>
      </main>
    </SiteLayout>
  );
}
