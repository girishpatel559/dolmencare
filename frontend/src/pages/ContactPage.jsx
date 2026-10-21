import { useEffect } from "react";
import { ArrowRight, Clock3, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import SiteLayout, { openWhatsApp } from "@/components/SiteLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import "./pages.css";

export default function ContactPage() {
  const { t } = useLanguage();
  const C = t.contactPage;
  useEffect(() => { document.title = "Contact Us — Dolmencare"; }, []);
  return (
    <SiteLayout>
      <main className="page-main container" data-testid="contact-page">
        <div className="page-hero">
          <div className="eyebrow"><span className="eyebrow-line" /> {C.eyebrow}</div>
          <h1>{C.t1} <span>{C.t2}</span></h1>
          <p>{C.sub}</p>
          <div className="page-cta-row">
            <button className="button" onClick={() => openWhatsApp(t.bookMessage)} data-testid="contact-whatsapp-button">{C.whatsapp} <ArrowRight size={17} /></button>
            <a className="button button-ghost" href="tel:+919506636245" data-testid="contact-call-button"><Phone size={16} /> {C.callNow}</a>
          </div>
        </div>

        <div className="page-grid">
          <div className="info-card" data-testid="contact-card-phone">
            <span className="info-icon"><Phone size={20} /></span>
            <h3>{C.phoneT}</h3>
            <p>{C.phoneS}</p>
            <a className="card-link" href="tel:+919506636245" data-testid="contact-phone-link">+91 9506636245</a>
          </div>
          <div className="info-card" data-testid="contact-card-email">
            <span className="info-icon"><Mail size={20} /></span>
            <h3>{C.emailT}</h3>
            <p>{C.emailS}</p>
            <a className="card-link" href="mailto:dolmenrepairing@gmail.com" data-testid="contact-email-link">dolmenrepairing@gmail.com</a>
          </div>
          <div className="info-card" data-testid="contact-card-address">
            <span className="info-icon"><MapPin size={20} /></span>
            <h3>{C.visitT}</h3>
            <p>{C.address}</p>
          </div>
          <div className="info-card" data-testid="contact-card-area">
            <span className="info-icon"><Clock3 size={20} /></span>
            <h3>{C.areaT}</h3>
            <p>{C.areaS}</p>
          </div>
        </div>

        <div className="page-band" data-testid="contact-business-info">
          <h2>{C.bizTitle}</h2>
          <ul>
            <li>{C.bizName}</li>
            <li>{C.bizOp}</li>
            <li>{C.bizArea}</li>
          </ul>
        </div>

        <div className="page-band" data-testid="contact-support-tips">
          <h2><ShieldCheck size={18} style={{ verticalAlign: "-3px" }} /> {C.tipsTitle}</h2>
          <ul>
            {C.tips.map((tip) => <li key={tip.slice(0, 24)}>{tip}</li>)}
          </ul>
        </div>
      </main>
    </SiteLayout>
  );
}
