import { useEffect } from "react";
import { ArrowRight, Clock3, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import SiteLayout, { openWhatsApp } from "@/components/SiteLayout";
import "./pages.css";

export default function ContactPage() {
  useEffect(() => { document.title = "Contact Us — Dolmencare"; }, []);
  return (
    <SiteLayout>
      <main className="page-main container" data-testid="contact-page">
        <div className="page-hero">
          <div className="eyebrow"><span className="eyebrow-line" /> CONTACT DOLMENCARE</div>
          <h1>We're here to help with <span>your repair.</span></h1>
          <p>Questions, bookings, or support — reach us on whichever channel suits you best. We aim to respond to enquiries as soon as reasonably possible.</p>
          <div className="page-cta-row">
            <button className="button" onClick={() => openWhatsApp()} data-testid="contact-whatsapp-button">Chat on WhatsApp <ArrowRight size={17} /></button>
            <a className="button button-ghost" href="tel:+919506636245" data-testid="contact-call-button"><Phone size={16} /> Call now</a>
          </div>
        </div>

        <div className="page-grid">
          <div className="info-card" data-testid="contact-card-phone">
            <span className="info-icon"><Phone size={20} /></span>
            <h3>Phone</h3>
            <p>Mon–Sun, 9:00–21:00</p>
            <a className="card-link" href="tel:+919506636245" data-testid="contact-phone-link">+91 9506636245</a>
          </div>
          <div className="info-card" data-testid="contact-card-email">
            <span className="info-icon"><Mail size={20} /></span>
            <h3>Email</h3>
            <p>For bookings, quotes, and support</p>
            <a className="card-link" href="mailto:dolmenrepairing@gmail.com" data-testid="contact-email-link">dolmenrepairing@gmail.com</a>
          </div>
          <div className="info-card" data-testid="contact-card-address">
            <span className="info-icon"><MapPin size={20} /></span>
            <h3>Visit us</h3>
            <p>Shop No. 11, Asha Complex, Near Main Char Rasta, Silvassa, Dadra & Nagar Haveli</p>
          </div>
          <div className="info-card" data-testid="contact-card-area">
            <span className="info-icon"><Clock3 size={20} /></span>
            <h3>Service area</h3>
            <p>Silvassa and surrounding areas of Dadra & Nagar Haveli, subject to service availability.</p>
          </div>
        </div>

        <div className="page-band" data-testid="contact-business-info">
          <h2>Business details</h2>
          <ul>
            <li><b>Business name:</b> Dolmen Care (Dolmencare)</li>
            <li><b>Business operator:</b> Yashashree Corporation</li>
            <li><b>Service area:</b> Silvassa and surrounding areas of Dadra & Nagar Haveli</li>
          </ul>
        </div>

        <div className="page-band" data-testid="contact-support-tips">
          <h2><ShieldCheck size={18} style={{ verticalAlign: "-3px" }} /> Customer support tips</h2>
          <ul>
            <li>Please include your booking reference, mobile phone model, and a brief description of the problem when contacting us.</li>
            <li>For your privacy and security, never send your phone password, banking PIN, OTP, or other confidential credentials through any form or message.</li>
          </ul>
        </div>
      </main>
    </SiteLayout>
  );
}
