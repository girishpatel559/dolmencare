import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Facebook, Instagram, Menu, Phone, Wrench, X } from "lucide-react";

const WHATSAPP_NUMBER = "919506636245";
export const bookMessage = "Hi Dolmencare! I'd like to book a doorstep pickup for my phone. Please share the next steps.";

export function openWhatsApp(message = bookMessage) {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

export default function SiteLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const brandMark = <span>Dolmen<span className="brand-accent">care</span><small>REPAIR. RELAX. REPEAT.</small></span>;

  return (
    <div className="site-shell">
      <div className="announcement"><span><span className="live-dot" /> Doorstep repairs across Silvassa & nearby areas</span><a href="tel:+919506636245" data-testid="top-call-link">Call us: +91 9506636245 <ArrowRight size={14} /></a></div>
      <header className="nav-wrap"><nav className="nav container" data-testid="main-navigation">
        <Link to="/" className="brand" data-testid="brand-link" onClick={closeMenu}><span className="brand-mark"><Wrench size={18} /></span>{brandMark}</Link>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" data-testid="mobile-menu-button">{menuOpen ? <X /> : <Menu />}</button>
        <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          <Link to="/services" data-testid="nav-services-link" onClick={closeMenu}>Services</Link>
          <a href="/#how-it-works" data-testid="nav-process-link" onClick={closeMenu}>How it works</a>
          <a href="/#sell-phone" data-testid="nav-sell-link" onClick={closeMenu}>Sell your phone</a>
          <Link to="/contact" data-testid="nav-contact-page-link" onClick={closeMenu}>Contact</Link>
          <a className="nav-contact" href="tel:+919506636245" data-testid="nav-contact-link"><Phone size={15} /> Talk to us</a>
          <button className="button button-small" onClick={() => openWhatsApp()} data-testid="nav-book-pickup-button">Book a pickup <ArrowRight size={15} /></button>
        </div>
      </nav></header>

      {children}

      <footer className="footer"><div className="container footer-top">
        <div><Link to="/" className="brand brand-footer"><span className="brand-mark"><Wrench size={18} /></span>{brandMark}</Link><p>Fast, reliable, secure mobile repair<br />pickup & delivery.</p><div className="socials"><a href="https://instagram.com" aria-label="Instagram" data-testid="instagram-link"><Instagram size={17} /></a><a href="https://facebook.com" aria-label="Facebook" data-testid="facebook-link"><Facebook size={17} /></a></div></div>
        <div className="footer-links">
          <div><b>Explore</b><Link to="/services" data-testid="footer-services-link">Services</Link><a href="/#how-it-works">How it works</a><a href="/#sell-phone" data-testid="footer-sell-link">Sell your phone</a><a href="/#faq" data-testid="footer-faq-link">FAQ</a></div>
          <div><b>Company</b><Link to="/contact" data-testid="footer-contact-link">Contact Us</Link><Link to="/privacy" data-testid="footer-privacy-link">Privacy Policy</Link><Link to="/delete-account" data-testid="footer-delete-account-link">Delete Account</Link></div>
          <div><b>Reach us</b><a href="tel:+919506636245"><Phone size={13} /> +91 9506636245</a><a href="mailto:dolmenrepairing@gmail.com">dolmenrepairing@gmail.com</a><span>Silvassa, Dadra & Nagar Haveli</span><span>Mon–Sun · 9:00–21:00</span></div>
        </div>
      </div><div className="container footer-bottom"><span>© 2026 Dolmencare · Operated by Vishashree Corporation</span><span>Made for better phone days <span className="heart">♥</span></span></div></footer>
    </div>
  );
}
