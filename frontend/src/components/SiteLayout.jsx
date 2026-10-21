import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Facebook, Instagram, Menu, MessageCircle, Phone, Wrench, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { languages } from "@/i18n";
import { loadBusinessNumber, openWhatsApp } from "@/business";
import { useBooking } from "@/components/BookingContext";
import "@/pages/pages.css";

export { openWhatsApp } from "@/business";

export default function SiteLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { openBooking, openTrack } = useBooking();
  const L = t.layout;
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => { loadBusinessNumber(); }, []);

  const brandMark = <span>Dolmen<span className="brand-accent">care</span><small>REPAIR. RELAX. REPEAT.</small></span>;

  return (
    <div className="site-shell">
      <div className="announcement"><span><span className="live-dot" /> {L.announcement}</span><a href="tel:+919506636245" data-testid="top-call-link">{L.callUs} <ArrowRight size={14} /></a></div>
      <header className="nav-wrap"><nav className="nav container" data-testid="main-navigation">
        <Link to="/" className="brand" data-testid="brand-link" onClick={closeMenu}><span className="brand-mark"><Wrench size={18} /></span>{brandMark}</Link>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" data-testid="mobile-menu-button">{menuOpen ? <X /> : <Menu />}</button>
        <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          <Link to="/services" data-testid="nav-services-link" onClick={closeMenu}>{L.nav.services}</Link>
          <a href="/#how-it-works" data-testid="nav-process-link" onClick={closeMenu}>{L.nav.how}</a>
          <a href="/#sell-phone" data-testid="nav-sell-link" onClick={closeMenu}>{L.nav.sell}</a>
          <Link to="/contact" data-testid="nav-contact-page-link" onClick={closeMenu}>{L.nav.contact}</Link>
          <a href="#track" data-testid="nav-track-link" onClick={(e) => { e.preventDefault(); openTrack(); closeMenu(); }}>{L.nav.track}</a>
          <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language" data-testid="language-select">
            {languages.map((l) => <option key={l.code} value={l.code} data-testid={`lang-option-${l.code}`}>{l.label}</option>)}
          </select>
          <button className="button button-small whatsapp-btn" onClick={() => { openWhatsApp(t.bookMessage); }} data-testid="nav-whatsapp-chat"><MessageCircle size={15} /> {L.nav.chat}</button>
          <button className="button button-small" onClick={() => { openBooking(); closeMenu(); }} data-testid="nav-book-pickup-button">{L.nav.book} <ArrowRight size={15} /></button>
        </div>
      </nav></header>

      {children}

      <footer className="footer"><div className="container footer-top">
        <div><Link to="/" className="brand brand-footer"><span className="brand-mark"><Wrench size={18} /></span>{brandMark}</Link><p>{L.footerTag}</p><div className="socials"><a href="https://instagram.com" aria-label="Instagram" data-testid="instagram-link"><Instagram size={17} /></a><a href="https://facebook.com" aria-label="Facebook" data-testid="facebook-link"><Facebook size={17} /></a></div></div>
        <div className="footer-links">
          <div><b>{L.explore}</b><Link to="/services" data-testid="footer-services-link">{L.links.services}</Link><a href="/#how-it-works">{L.links.how}</a><a href="/#sell-phone" data-testid="footer-sell-link">{L.links.sell}</a><a href="#track" data-testid="footer-track-link" onClick={(e) => { e.preventDefault(); openTrack(); }}>{L.nav.track}</a><a href="/#faq" data-testid="footer-faq-link">{L.links.faq}</a></div>
          <div><b>{L.company}</b><Link to="/contact" data-testid="footer-contact-link">{L.links.contact}</Link><Link to="/privacy" data-testid="footer-privacy-link">{L.links.privacy}</Link><Link to="/delete-account" data-testid="footer-delete-account-link">{L.links.delete}</Link><Link to="/admin" data-testid="footer-admin-link">{L.links.admin}</Link></div>
          <div><b>{L.reachUs}</b><a href="tel:+919506636245"><Phone size={13} /> +91 9506636245</a><a href="mailto:dolmenrepairing@gmail.com">dolmenrepairing@gmail.com</a><span>{L.region}</span><span>{L.hours}</span></div>
        </div>
      </div><div className="container footer-bottom"><span>{L.rights}</span><span>{L.madeFor} <span className="heart">♥</span></span></div></footer>
    </div>
  );
}
