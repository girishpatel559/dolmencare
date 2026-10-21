import { useEffect } from "react";
import { Mail, Phone, Smartphone, Trash2 } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import "./pages.css";

const optIcons = [Smartphone, Mail, Phone];

export default function DeleteAccountPage() {
  const { t } = useLanguage();
  const D = t.deletePage;
  useEffect(() => { document.title = "Delete Account — Dolmencare"; }, []);
  return (
    <SiteLayout>
      <main className="page-main container" data-testid="delete-account-page">
        <div className="page-hero">
          <div className="eyebrow"><span className="eyebrow-line" /> {D.eyebrow}</div>
          <h1>{D.t1} <span>{D.t2}</span></h1>
          <p>{D.sub}</p>
        </div>

        <div className="page-grid">
          {D.opts.map((opt, index) => {
            const Icon = optIcons[index];
            return (
              <div className="info-card" key={opt.title} data-testid={`delete-option-${["app", "email", "phone"][index]}`}>
                <span className="info-icon"><Icon size={20} /></span>
                <h3>{opt.title}</h3>
                <p>{opt.text}</p>
                {index === 1 && <a className="card-link" href="mailto:dolmenrepairing@gmail.com?subject=Delete%20my%20account" data-testid="delete-email-link">dolmenrepairing@gmail.com</a>}
                {index === 2 && <a className="card-link" href="tel:+919506636245" data-testid="delete-phone-link">+91 9506636245</a>}
              </div>
            );
          })}
        </div>

        <div className="page-band" data-testid="delete-what-happens">
          <h2><Trash2 size={18} style={{ verticalAlign: "-3px" }} /> {D.whatTitle}</h2>
          <ul>
            {D.what.map((item) => <li key={item.slice(0, 24)}>{item}</li>)}
          </ul>
        </div>
      </main>
    </SiteLayout>
  );
}
