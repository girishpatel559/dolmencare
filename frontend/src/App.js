import { useEffect, useState } from "react";
import "@/App.css";
import "@/motion.css";
import { motion } from "framer-motion";
import Lenis from "lenis";
import { ArrowRight, ArrowUpRight, BatteryCharging, Check, ChevronDown, Clock3, Cpu, Download, Laptop, MapPin, MessageCircle, ShieldCheck, Smartphone, Sparkles, Star, Wrench, X, Zap } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { useBooking } from "@/components/BookingContext";
import { useLanguage } from "@/i18n/LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const brands = ["Apple iPhone", "Samsung", "OnePlus", "Xiaomi", "Vivo", "Oppo", "Realme", "Google Pixel", "Motorola", "Nothing Phone"];
const serviceIcons = [Smartphone, BatteryCharging, Zap, Laptop, MessageCircle, Sparkles, Cpu, Wrench, ShieldCheck, Smartphone];
const trustMeta = [[ShieldCheck, "green"], [Clock3, "blue"], [Zap, "yellow"], [Star, "coral"]];

function Reveal({ children, className, delay = 0 }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function App() {
  const { t } = useLanguage();
  const { openBooking, openTrack } = useBooking();
  const H = t.home;
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [sellSent, setSellSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [openFaq, setOpenFaq] = useState(-1);
  const [apk, setApk] = useState(null);

  useEffect(() => { document.title = "Dolmencare — Mobile Repair at Your Doorstep"; }, []);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let frame;
    const raf = (time) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(frame); lenis.destroy(); };
  }, []);

  useEffect(() => {
    fetch(`${API}/app/apk-info`)
      .then((res) => (res.ok ? res.json() : { available: false }))
      .then(setApk)
      .catch(() => setApk({ available: false }));
  }, []);

  const submitLead = async (event, type) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch(`${API}/leads`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, ...data }) });
      if (!response.ok) throw new Error(`Lead request failed with ${response.status}`);
    } catch (error) {
      setFormError(H.formError);
      console.error(error);
      return;
    }
    setFormError("");
    type === "quote" ? setQuoteSent(true) : setSellSent(true);
  };

  return <SiteLayout>
    <main id="top">
      <section className="hero container"><div className="hero-copy reveal"><div className="eyebrow"><span className="eyebrow-line" /> {H.hero.eyebrow}</div><h1><span className="hero-line-mask"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>{H.hero.t1}</motion.span></span><span className="hero-line-mask"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}><em>{H.hero.t2}</em></motion.span></span></h1><p>{H.hero.sub}</p><div className="hero-actions"><button className="button" onClick={openBooking} data-testid="hero-book-pickup-button">{H.hero.book} <ArrowRight size={17} /></button><button className="button button-ghost" onClick={() => setQuoteOpen(true)} data-testid="hero-quote-button">{H.hero.quote} <span className="button-icon"><Sparkles size={15} /></span></button></div><div className="hero-proof"><div className="avatar-stack"><span>AK</span><span>RS</span><span>NP</span><span>+</span></div><div><strong>4.9/5</strong><span>{H.hero.rating}</span></div></div></div><div className="hero-visual reveal delay-1"><div className="hero-photo"><img src="https://customer-assets-4nw71qhi.emergentagent.net/job_dolmen-care-1/artifacts/bdd78d68d6147579_IMG-20261021-WA0002.jpg" alt="Dolmencare mobile repair specialist at work" /><div className="photo-shade" /><div className="floating-card repair-card"><span className="status-check"><Check size={15} /></span><span><b>{H.hero.cardRepair}</b><small>iPhone 13 Pro · #DC2841</small></span><span className="signal-bars"><i /><i /><i /></span></div><div className="floating-card pickup-card"><MapPin size={16} /><span><b>{H.hero.cardPickup}</b><small>{H.hero.cardPickupSub}</small></span></div></div><div className="hero-caption"><span><ShieldCheck size={16} /> {H.hero.privacy}</span><span>{H.hero.region}</span></div></div></section>

      <section className="trust-strip"><div className="container trust-grid">{H.trust.map((item, index) => { const [Icon, color] = trustMeta[index]; return <div key={item.t}><span className={`trust-icon ${color}`}><Icon /></span><span><b>{item.t}</b><small>{item.s}</small></span></div>; })}</div></section>

      <section className="section container" id="services"><Reveal className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> {H.services.eyebrow}</div><h2>{H.services.t1}<br /><span>{H.services.t2}</span></h2></div><p>{H.services.sub}</p></Reveal><Reveal className="service-grid" delay={0.1}>{H.services.items.map((item, index) => { const Icon = serviceIcons[index]; return <div className="service-card" key={item.name} data-testid={`service-card-${index}`}><span className="service-number">0{index + 1}</span><span className="service-icon"><Icon size={22} /></span><h3>{item.name}</h3><span className="service-price">{item.price}</span><button onClick={() => setQuoteOpen(true)} data-testid={`service-quote-button-${index}`}>{H.services.getQuote} <ArrowUpRight /></button></div>; })}</Reveal></section>

      <section className="blue-section" id="how-it-works"><div className="container"><Reveal className="section-heading light"><div><div className="eyebrow"><span className="eyebrow-line light-line" /> {H.steps.eyebrow}</div><h2>{H.steps.t1}<br /><span>{H.steps.t2}</span></h2></div><p>{H.steps.sub}</p></Reveal><Reveal className="steps-grid" delay={0.1}>{H.steps.items.map((item, index) => <div className="step" key={item.title} data-testid={`process-step-0${index + 1}`}><span className="step-number">0{index + 1}</span><div className="step-line" /><h3>{item.title}</h3><p>{item.text}</p></div>)}</Reveal></div></section>

      <section className="feature-split container"><Reveal className="feature-image"><img src="https://customer-assets-4nw71qhi.emergentagent.net/job_dolmen-care-1/artifacts/df252a39a18cf86a_IMG-20261021-WA0003.jpg" alt="Dolmencare certified technician services collage" /><div className="image-label"><Wrench size={15} /> {H.diff.label}</div></Reveal><Reveal className="feature-copy" delay={0.12}><div className="eyebrow"><span className="eyebrow-line" /> {H.diff.eyebrow}</div><h2>{H.diff.t1}<br /><span>{H.diff.t2}</span></h2><p>{H.diff.sub}</p><ul>{H.diff.points.map(item => <li key={item}><span><Check size={14} /></span>{item}</li>)}</ul><button className="text-button" onClick={openBooking} data-testid="difference-book-button">{H.diff.cta} <ArrowRight size={17} /></button></Reveal></section>

      <section className="quote-banner" id="sell-phone"><Reveal className="container banner-inner"><div><div className="eyebrow light"><span className="eyebrow-line light-line" /> {H.sellBanner.eyebrow}</div><h2>{H.sellBanner.t1}<br /><em>{H.sellBanner.t2}</em></h2><p>{H.sellBanner.sub}</p></div><button className="button button-white" onClick={() => setSellOpen(true)} data-testid="sell-phone-cta">{H.sellBanner.cta} <ArrowRight size={17} /></button></Reveal></section>

      <section className="brands-section container"><Reveal className="center-heading"><div className="eyebrow centered"><span className="eyebrow-line" /> {H.brands.eyebrow}</div><h2>{H.brands.t1}<br /><span>{H.brands.t2}</span></h2><p>{H.brands.sub}</p></Reveal><div className="brand-marquee" data-testid="brand-marquee"><div className="brand-marquee-track">{[...brands, ...brands].map((brand, index) => <span className="brand-pill" key={`${brand}-${index}`} data-testid={`brand-${brand.toLowerCase().replaceAll(" ", "-")}${index >= brands.length ? "-clone" : ""}`}>{brand}</span>)}</div></div></section>

      <section className="app-banner container" id="app-download"><Reveal className="app-phone-art"><Smartphone size={90} strokeWidth={1.2} /><span className="app-spark spark-1">✦</span><span className="app-spark spark-2">✦</span></Reveal><Reveal className="app-copy" delay={0.12}><div className="eyebrow"><span className="eyebrow-line" /> {H.app.eyebrow}</div><h2>{H.app.t1}<br /><span>{H.app.t2}</span></h2><p>{H.app.sub}</p>{apk?.available ? <a className="button" href={`${API}/app/download`} data-testid="android-apk-download"><Download size={17} /> {H.app.download}</a> : <span className="button button-disabled" data-testid="android-apk-download" aria-disabled="true"><Download size={17} /> {H.app.comingSoon}</span>}<small>{apk?.available ? `${apk.filename} · ${(apk.size / 1048576).toFixed(1)} MB` : H.app.onWay}</small><button className="text-button" onClick={openTrack} data-testid="app-track-button">{H.app.trackBtn} <ArrowRight size={16} /></button></Reveal></section>

      <section className="reviews-section"><div className="container"><Reveal className="center-heading"><div className="eyebrow centered"><span className="eyebrow-line" /> {H.reviews.eyebrow}</div><h2>{H.reviews.t1}<br /><span>{H.reviews.t2}</span></h2></Reveal><Reveal className="reviews-grid" delay={0.1}>{H.reviews.items.map((item) => <article className="review-card" key={item.name} data-testid={`review-${item.name.split(" ")[0].toLowerCase()}`}><div className="stars">★★★★★</div><p>“{item.text}</p><footer><span className="review-avatar">{item.name[0]}</span><span><b>{item.name}</b><small>{item.device}</small></span></footer></article>)}</Reveal></div></section>

      <section className="faq-section container" id="faq"><Reveal className="faq-intro"><div className="eyebrow"><span className="eyebrow-line" /> {H.faq.eyebrow}</div><h2>{H.faq.title}</h2><p>{H.faq.sub}</p></Reveal><Reveal className="faq-list" delay={0.1}>{H.faq.items.map((item, index) => <div className={`faq-item ${openFaq === index ? "open" : ""}`} key={item.q}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} data-testid={`faq-question-${index}`}><span>{item.q}</span><ChevronDown size={19} /></button>{openFaq === index && <p data-testid={`faq-answer-${index}`}>{item.a}</p>}</div>)}</Reveal></section>
    </main>

    {quoteOpen && <div className="modal-backdrop" onClick={() => setQuoteOpen(false)}><div className="modal" data-lenis-prevent onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setQuoteOpen(false)} data-testid="quote-modal-close"><X /></button>{quoteSent ? <Success title={H.quote.successT} text={H.quote.successP} done={H.done} onClose={() => setQuoteOpen(false)} /> : <><div className="eyebrow"><span className="eyebrow-line" /> {H.quote.eyebrow}</div><h2>{H.quote.title}</h2><p className="modal-intro">{H.quote.intro}</p>{formError && <p className="form-error" data-testid="lead-form-error">{formError}</p>}<form onSubmit={event => submitLead(event, "quote")}><label>{H.quote.brand}<select name="brand" required data-testid="quote-brand-select"><option value="">{H.quote.chooseBrand}</option>{brands.map(brand => <option key={brand}>{brand}</option>)}</select></label><label>{H.quote.issue}<select name="issue" required data-testid="quote-issue-select"><option value="">{H.quote.chooseIssue}</option>{H.services.items.map((item) => <option key={item.name}>{item.name} · {item.price}</option>)}</select></label><label>{H.quote.phone}<input name="phone" required type="tel" placeholder={H.quote.phonePh} data-testid="quote-phone-input" /></label><label>{H.quote.email} <small style={{ fontWeight: 400, color: "#64748b" }}>({H.quote.emailHint})</small><input name="email" type="email" placeholder={H.quote.emailPh} data-testid="quote-email-input" /></label><button className="button full-button" type="submit" data-testid="quote-submit-button">{H.quote.submit} <ArrowRight size={17} /></button></form></>}</div></div>}
    {sellOpen && <div className="modal-backdrop" onClick={() => setSellOpen(false)}><div className="modal" data-lenis-prevent onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setSellOpen(false)} data-testid="sell-modal-close"><X /></button>{sellSent ? <Success title={H.sell.successT} text={H.sell.successP} done={H.done} onClose={() => setSellOpen(false)} /> : <><div className="eyebrow"><span className="eyebrow-line" /> {H.sell.eyebrow}</div><h2>{H.sell.title}</h2><p className="modal-intro">{H.sell.intro}</p>{formError && <p className="form-error" data-testid="lead-form-error">{formError}</p>}<form onSubmit={event => submitLead(event, "sell")}><label>{H.sell.model}<input name="model" required placeholder={H.sell.modelPh} data-testid="sell-model-input" /></label><label>{H.sell.condition}<select name="condition" required data-testid="sell-condition-select"><option value="">{H.sell.chooseCondition}</option>{H.sell.conditions.map((c) => <option key={c}>{c}</option>)}</select></label><label>{H.sell.phone}<input name="phone" required type="tel" placeholder={H.sell.phonePh} data-testid="sell-phone-input" /></label><label>{H.sell.email} <small style={{ fontWeight: 400, color: "#64748b" }}>({H.sell.emailHint})</small><input name="email" type="email" placeholder={H.sell.emailPh} data-testid="sell-email-input" /></label><button className="button full-button" type="submit" data-testid="sell-submit-button">{H.sell.submit} <ArrowRight size={17} /></button></form></>}</div></div>}
  </SiteLayout>;
}

function Success({ title, text, done, onClose }) { return <div className="success-state"><span><Check /></span><h2>{title}</h2><p>{text}</p><button className="text-button" onClick={onClose} data-testid="success-close-button">{done} <ArrowRight size={17} /></button></div>; }
export default App;
