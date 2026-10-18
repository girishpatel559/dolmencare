import { useEffect, useState } from "react";
import "@/App.css";
import "@/motion.css";
import { motion } from "framer-motion";
import Lenis from "lenis";
import { ArrowRight, ArrowUpRight, BatteryCharging, Check, ChevronDown, Clock3, Cpu, Download, Laptop, MapPin, MessageCircle, ShieldCheck, Smartphone, Sparkles, Star, Wrench, X, Zap } from "lucide-react";
import SiteLayout, { openWhatsApp, bookMessage } from "@/components/SiteLayout";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const services = [
  ["Screen Replacement", Smartphone, "From ₹999"], ["Battery Replacement", BatteryCharging, "From ₹699"], ["Charging Port Repair", Zap, "From ₹499"],
  ["Camera Repair", Laptop, "From ₹799"], ["Speaker & Microphone", MessageCircle, "From ₹499"], ["Water Damage Repair", Sparkles, "From ₹1,499"],
  ["Motherboard Repair", Cpu, "From ₹1,999"], ["Software Issues", Wrench, "From ₹299"], ["Data Recovery", ShieldCheck, "From ₹1,299"], ["Back Glass Replacement", Smartphone, "From ₹899"]
];
const brands = ["Apple iPhone", "Samsung", "OnePlus", "Xiaomi", "Vivo", "Oppo", "Realme", "Google Pixel", "Motorola", "Nothing Phone"];
const faqs = [["How long does repair take?", "Most repairs are completed within 2–24 hours, depending on the issue and parts availability."], ["Is pickup free?", "Yes, pickup and delivery are free in selected service areas."], ["Will my data be safe?", "Absolutely. We follow strict privacy and security protocols throughout every repair."], ["Do you provide warranty?", "Yes. Selected repairs include a service warranty — we’ll confirm it with your quote."]];

function Reveal({ children, className, delay = 0 }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function App() {
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
      setFormError("We couldn’t send that just now. Please call us at +91 9506636245.");
      console.error(error);
      return;
    }
    setFormError("");
    type === "quote" ? setQuoteSent(true) : setSellSent(true);
  };

  return <SiteLayout>
    <main id="top">
      <section className="hero container"><div className="hero-copy reveal"><div className="eyebrow"><span className="eyebrow-line" /> YOUR PHONE, OUR PRIORITY</div><h1><span className="hero-line-mask"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>Your mobile repair,</motion.span></span><span className="hero-line-mask"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}><em>picked up & delivered.</em></motion.span></span></h1><p>Fast, secure, and hassle-free smartphone repairs. Book a service request, tell us about your device problem, and we collect it, fix it with genuine-quality parts, and bring it back to your doorstep.</p><div className="hero-actions"><button className="button" onClick={() => openWhatsApp()} data-testid="hero-book-pickup-button">Book a pickup <ArrowRight size={17} /></button><button className="button button-ghost" onClick={() => setQuoteOpen(true)} data-testid="hero-quote-button">Get instant quote <span className="button-icon"><Sparkles size={15} /></span></button></div><div className="hero-proof"><div className="avatar-stack"><span>AK</span><span>RS</span><span>NP</span><span>+</span></div><div><strong>4.9/5</strong><span>from 1,200+ happy customers</span></div></div></div><div className="hero-visual reveal delay-1"><div className="hero-photo"><img src="https://images.pexels.com/photos/6755075/pexels-photo-6755075.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000" alt="Technician repairing a smartphone" /><div className="photo-shade" /><div className="floating-card repair-card"><span className="status-check"><Check size={15} /></span><span><b>Repair in progress</b><small>iPhone 13 Pro · #DC2841</small></span><span className="signal-bars"><i /><i /><i /></span></div><div className="floating-card pickup-card"><MapPin size={16} /><span><b>Free pickup</b><small>At your doorstep</small></span></div></div><div className="hero-caption"><span><ShieldCheck size={16} /> 100% data privacy assured</span><span>Silvassa <span className="caption-dot" /> Dadra & Nagar Haveli</span></div></div></section>

      <section className="trust-strip"><div className="container trust-grid"><div><span className="trust-icon green"><ShieldCheck /></span><span><b>Genuine parts</b><small>Quality you can trust</small></span></div><div><span className="trust-icon blue"><Clock3 /></span><span><b>Same-day service</b><small>When time matters</small></span></div><div><span className="trust-icon yellow"><Zap /></span><span><b>Free pickup & delivery</b><small>We come to you</small></span></div><div><span className="trust-icon coral"><Star /></span><span><b>Pay after delivery</b><small>Only when it's fixed</small></span></div></div></section>

      <section className="section container" id="services"><Reveal className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> WHAT WE FIX</div><h2>Repair, without<br /><span>the runaround.</span></h2></div><p>From a cracked screen to a stubborn charging port, our certified technicians handle the details so you don’t have to.</p></Reveal><Reveal className="service-grid" delay={0.1}>{services.map(([name, Icon, price], index) => <div className="service-card" key={name} data-testid={`service-card-${index}`}><span className="service-number">0{index + 1}</span><span className="service-icon"><Icon size={22} /></span><h3>{name}</h3><span className="service-price">{price}</span><button onClick={() => setQuoteOpen(true)} data-testid={`service-quote-button-${index}`}>Get a quote <ArrowUpRight /></button></div>)}</Reveal></section>

      <section className="blue-section" id="how-it-works"><div className="container"><Reveal className="section-heading light"><div><div className="eyebrow"><span className="eyebrow-line light-line" /> SIMPLE BY DESIGN</div><h2>Four steps to a<br /><span>better phone day.</span></h2></div><p>We’ve made getting your phone fixed feel less like a chore and more like a quick handoff.</p></Reveal><Reveal className="steps-grid" delay={0.1}>{[["01", "Book a repair", "Submit your service request through the Dolmencare app or WhatsApp."], ["02", "Describe the issue", "Tell us your phone model and explain the problem."], ["03", "We pick it up & repair", "We confirm the service details and charges, then our technicians fix it."], ["04", "Pay after delivery", "Your repaired phone returns safely — pay only after delivery."]].map(([n, title, text]) => <div className="step" key={n} data-testid={`process-step-${n}`}><span className="step-number">{n}</span><div className="step-line" /><h3>{title}</h3><p>{text}</p></div>)}</Reveal></div></section>

      <section className="feature-split container"><Reveal className="feature-image"><img src="https://images.pexels.com/photos/35290682/pexels-photo-35290682.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1000" alt="Mobile repair tools and technician workspace" /><div className="image-label"><Wrench size={15} /> CERTIFIED TECHNICIANS</div></Reveal><Reveal className="feature-copy" delay={0.12}><div className="eyebrow"><span className="eyebrow-line" /> THE DOLMENCARE DIFFERENCE</div><h2>Care that goes<br /><span>under the surface.</span></h2><p>We don’t just replace parts. We diagnose properly, communicate clearly, and treat every device like it belongs to someone we know.</p><ul>{["Certified repair technicians", "Transparent pricing, no hidden charges", "Live repair status updates", "Strict data privacy protocols"].map(item => <li key={item}><span><Check size={14} /></span>{item}</li>)}</ul><button className="text-button" onClick={() => openWhatsApp()} data-testid="difference-book-button">Book your repair <ArrowRight size={17} /></button></Reveal></section>

      <section className="quote-banner" id="sell-phone"><Reveal className="container banner-inner"><div><div className="eyebrow light"><span className="eyebrow-line light-line" /> OLD PHONE? NEW POSSIBILITIES</div><h2>Turn your old phone<br />into <em>instant value.</em></h2><p>Get a fair, transparent estimate in under 2 minutes. We make selling your old phone simple.</p></div><button className="button button-white" onClick={() => setSellOpen(true)} data-testid="sell-phone-cta">Sell your old phone <ArrowRight size={17} /></button></Reveal></section>

      <section className="brands-section container"><Reveal className="center-heading"><div className="eyebrow centered"><span className="eyebrow-line" /> WE SPEAK PHONE</div><h2>Every major brand.<br /><span>One trusted team.</span></h2><p>Apple to Nothing, we know your device inside out.</p></Reveal><div className="brand-marquee" data-testid="brand-marquee"><div className="brand-marquee-track">{[...brands, ...brands].map((brand, index) => <span className="brand-pill" key={`${brand}-${index}`} data-testid={`brand-${brand.toLowerCase().replaceAll(" ", "-")}${index >= brands.length ? "-clone" : ""}`}>{brand}</span>)}</div></div></section>

      <section className="app-banner container" id="app-download"><Reveal className="app-phone-art"><Smartphone size={90} strokeWidth={1.2} /><span className="app-spark spark-1">✦</span><span className="app-spark spark-2">✦</span></Reveal><Reveal className="app-copy" delay={0.12}><div className="eyebrow"><span className="eyebrow-line" /> DOLMENCARE, IN YOUR POCKET</div><h2>Track your repair.<br /><span>Anytime, anywhere.</span></h2><p>Get live updates, manage pickups, and reach us faster with the Dolmencare Android app.</p>{apk?.available ? <a className="button" href={`${API}/app/download`} data-testid="android-apk-download"><Download size={17} /> Download Android app</a> : <span className="button button-disabled" data-testid="android-apk-download" aria-disabled="true"><Download size={17} /> Android app — coming soon</span>}<small>{apk?.available ? `${apk.filename} · ${(apk.size / 1048576).toFixed(1)} MB` : "The Dolmencare app is on its way"}</small></Reveal></section>

      <section className="reviews-section"><div className="container"><Reveal className="center-heading"><div className="eyebrow centered"><span className="eyebrow-line" /> KIND WORDS</div><h2>Good repairs.<br /><span>Great stories.</span></h2></Reveal><Reveal className="reviews-grid" delay={0.1}>{[["“", "My iPhone screen was replaced in just a few hours. Pickup and delivery made everything so convenient.", "Aarav K.", "iPhone 13 Pro"], ["“", "Excellent service, affordable pricing, and professional staff. I finally found my go-to repair team.", "Riya S.", "Samsung S22"], ["“", "My phone was repaired without me leaving home. Highly recommended to everyone in Silvassa.", "Nikhil P.", "OnePlus 11"]].map(([mark, text, name, device]) => <article className="review-card" key={name} data-testid={`review-${name.split(" ")[0].toLowerCase()}`}><div className="stars">★★★★★</div><p>{mark}{text}</p><footer><span className="review-avatar">{name[0]}</span><span><b>{name}</b><small>{device}</small></span></footer></article>)}</Reveal></div></section>

      <section className="faq-section container" id="faq"><Reveal className="faq-intro"><div className="eyebrow"><span className="eyebrow-line" /> GOT QUESTIONS?</div><h2>Good to know.</h2><p>Still curious? Call us at <a href="tel:+919506636245">+91 9506636245</a> — we’re happy to help.</p></Reveal><Reveal className="faq-list" delay={0.1}>{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? "open" : ""}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} data-testid={`faq-question-${index}`}><span>{question}</span><ChevronDown size={19} /></button>{openFaq === index && <p data-testid={`faq-answer-${index}`}>{answer}</p>}</div>)}</Reveal></section>
    </main>

    {quoteOpen && <div className="modal-backdrop" onClick={() => setQuoteOpen(false)}><div className="modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setQuoteOpen(false)} data-testid="quote-modal-close"><X /></button>{quoteSent ? <Success title="Quote request received" text="Our team will call you shortly with your best repair estimate." onClose={() => setQuoteOpen(false)} /> : <><div className="eyebrow"><span className="eyebrow-line" /> INSTANT QUOTE</div><h2>Let’s price your repair.</h2><p className="modal-intro">Share a few details and we’ll get back with a clear starting estimate.</p>{formError && <p className="form-error" data-testid="lead-form-error">{formError}</p>}<form onSubmit={event => submitLead(event, "quote")}><label>Phone brand<select name="brand" required data-testid="quote-brand-select"><option value="">Choose brand</option>{brands.map(brand => <option key={brand}>{brand}</option>)}</select></label><label>What needs fixing?<select name="issue" required data-testid="quote-issue-select"><option value="">Choose a service</option>{services.map(([name, , price]) => <option key={name}>{name} · {price}</option>)}</select></label><label>Your phone number<input name="phone" required type="tel" placeholder="10-digit mobile number" data-testid="quote-phone-input" /></label><button className="button full-button" type="submit" data-testid="quote-submit-button">Get my estimate <ArrowRight size={17} /></button></form></>}</div></div>}
    {sellOpen && <div className="modal-backdrop" onClick={() => setSellOpen(false)}><div className="modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setSellOpen(false)} data-testid="sell-modal-close"><X /></button>{sellSent ? <Success title="Valuation request received" text="We’ll call you soon with a fair estimate for your device." onClose={() => setSellOpen(false)} /> : <><div className="eyebrow"><span className="eyebrow-line" /> SELL YOUR OLD PHONE</div><h2>Give it a second life.</h2><p className="modal-intro">Tell us about your device. No pressure, just a fair estimate.</p>{formError && <p className="form-error" data-testid="lead-form-error">{formError}</p>}<form onSubmit={event => submitLead(event, "sell")}><label>Phone model<input name="model" required placeholder="e.g. iPhone 11 64GB" data-testid="sell-model-input" /></label><label>Condition<select name="condition" required data-testid="sell-condition-select"><option value="">Choose condition</option><option>Like new</option><option>Good — minor signs of use</option><option>Needs some love</option></select></label><label>Your phone number<input name="phone" required type="tel" placeholder="10-digit mobile number" data-testid="sell-phone-input" /></label><button className="button full-button" type="submit" data-testid="sell-submit-button">Get my valuation <ArrowRight size={17} /></button></form></>}</div></div>}
  </SiteLayout>;
}

function Success({ title, text, onClose }) { return <div className="success-state"><span><Check /></span><h2>{title}</h2><p>{text}</p><button className="text-button" onClick={onClose} data-testid="success-close-button">Done <ArrowRight size={17} /></button></div>; }
export default App;
