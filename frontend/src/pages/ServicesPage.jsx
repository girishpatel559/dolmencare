import { useEffect } from "react";
import { ArrowRight, BatteryCharging, MessageCircle, Phone, Smartphone, Wrench, Zap } from "lucide-react";
import SiteLayout, { openWhatsApp } from "@/components/SiteLayout";
import "./pages.css";

const serviceCards = [
  { icon: Smartphone, title: "Screen Repair", text: "For cracked, broken, or malfunctioning screens. Repair options and pricing depend on your phone model and parts availability." },
  { icon: BatteryCharging, title: "Battery Replacement", text: "For batteries that drain quickly, fail to charge properly, or require replacement after inspection." },
  { icon: Zap, title: "Charging & Audio Problems", text: "Assistance with charging ports, speakers, microphones, and related faults." },
  { icon: Wrench, title: "Software Support", text: "Troubleshooting for supported software issues, device settings, and operating problems." },
  { icon: MessageCircle, title: "Other Mobile Repairs", text: "Many other repairs are available, subject to inspection and parts availability. Just ask us about your device." },
];

export default function ServicesPage() {
  useEffect(() => { document.title = "Services — Dolmencare Mobile Repair"; }, []);
  return (
    <SiteLayout>
      <main className="page-main container" data-testid="services-page">
        <div className="page-hero">
          <div className="eyebrow"><span className="eyebrow-line" /> OUR MOBILE REPAIR SERVICES</div>
          <h1>Repairs that come <span>to your doorstep.</span></h1>
          <p>Dolmencare helps you request mobile repair services conveniently — book in the app or on WhatsApp, and we handle the rest across Silvassa and selected surrounding areas.</p>
          <div className="page-cta-row">
            <button className="button" onClick={() => openWhatsApp()} data-testid="services-book-button">Book a repair <ArrowRight size={17} /></button>
            <a className="button button-ghost" href="tel:+919506636245" data-testid="services-call-button"><Phone size={16} /> +91 9506636245</a>
          </div>
        </div>

        <div className="page-grid">
          {serviceCards.map(({ icon: Icon, title, text }, index) => (
            <div className="info-card" key={title} data-testid={`services-card-${index}`}>
              <span className="info-icon"><Icon size={20} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <div className="page-band" data-testid="services-booking-info">
          <h2>Booking and payment</h2>
          <p>Submit your repair request using the Dolmencare app. We will confirm the service details and any applicable charges before proceeding. Payment instructions will be provided after the service is completed and the device is delivered, according to the confirmed booking terms — you pay after delivery.</p>
          <p><b>Service availability:</b> Silvassa and selected surrounding areas of Dadra & Nagar Haveli, subject to availability.</p>
        </div>

        <div className="page-band" data-testid="services-assistance">
          <h2>Need help choosing?</h2>
          <p>For assistance, call us at <a href="tel:+919506636245">+91 9506636245</a> or email <a href="mailto:dolmenrepairing@gmail.com">dolmenrepairing@gmail.com</a>. Tell us your phone model and the problem, and we will guide you.</p>
        </div>
      </main>
    </SiteLayout>
  );
}
