export default {
  bookMessage: "Hi Dolmencare! I'd like to book a doorstep pickup for my phone. Please share the next steps.",
  booking: {
    eyebrow: "BOOK A REPAIR", title: "Book a Repair",
    intro: "Fill in the details below — we'll call to confirm your pickup shortly.",
    brand: "Mobile Brand", chooseBrand: "Choose brand",
    brands: ["Samsung", "Apple iPhone", "Vivo", "Oppo", "Xiaomi", "Realme", "OnePlus", "Motorola", "Other"],
    model: "Mobile Model", modelPh: "e.g. Samsung Galaxy S23",
    problem: "Problem Type", chooseProblem: "Choose problem",
    problems: ["Screen damage", "Battery issue", "Charging problem", "Water damage", "Software problem", "Speaker/microphone issue", "Phone not switching on", "Other"],
    desc: "Describe Your Problem", descOpt: "optional", descPh: "Anything else we should know…",
    name: "Customer Name", namePh: "Your full name",
    phone: "Mobile Number", phonePh: "10-digit mobile number",
    address: "Pickup Area/Address", addressPh: "Flat, street, area, landmark…",
    submit: "Book Repair", submitting: "Booking…",
    successT: "Booking confirmed!", successP: "Your booking has been saved. We'll call you shortly to confirm the pickup.",
    bookingId: "Booking ID", viewDetails: "View Booking Details", chat: "Chat on WhatsApp",
    error: "We couldn't save your booking just now. Please call us at +91 9506636245.",
    done: "Done", statusLabel: "Status",
    locDetect: "Detect my location", locDetecting: "Detecting…", locFound: "Location detected — please confirm the address below.", locError: "Couldn't detect your location. Please type your address."
  },
  track: {
    title: "Track Your Booking", intro: "Enter your booking ID and the mobile number used while booking.",
    idLabel: "Booking ID", idPh: "e.g. DC-4F2K9A", phoneLabel: "Mobile Number", phonePh: "10-digit mobile number",
    submit: "Check Status", checking: "Checking…",
    idOptional: "forgot ID? Mobile number is enough",
    notFound: "No booking found for that booking ID and mobile number.",
    currentStatus: "Current status", yourBooking: "TRACK REPAIR",
    error: "Something went wrong. Please try again."
  },
  layout: {
    announcement: "Doorstep repairs across Silvassa & nearby areas",
    callUs: "Call us: +91 9506636245",
    nav: { services: "Services", how: "How it works", sell: "Sell your phone", contact: "Contact", talk: "Talk to us", book: "Book a pickup", chat: "Chat on WhatsApp", track: "Track booking" },
    footerTag: "Fast, reliable, secure mobile repair pickup & delivery.",
    explore: "Explore", company: "Company", reachUs: "Reach us",
    links: { services: "Services", how: "How it works", sell: "Sell your phone", faq: "FAQ", contact: "Contact Us", privacy: "Privacy Policy", delete: "Delete Account", admin: "Admin Login" },
    hours: "Mon–Sun · 9:00–21:00",
    region: "Silvassa, Dadra & Nagar Haveli",
    rights: "© 2026 Dolmencare · Operated by Yashashree Corporation",
    madeFor: "Made for better phone days"
  },
  home: {
    hero: {
      eyebrow: "YOUR PHONE, OUR PRIORITY",
      t1: "Your mobile repair,", t2: "picked up & delivered.",
      sub: "Fast, secure, and hassle-free smartphone repairs. Book a service request, tell us about your device problem, and we collect it, fix it with genuine-quality parts, and bring it back to your doorstep.",
      book: "Book a pickup", quote: "Get instant quote",
      rating: "from 1,200+ happy customers",
      cardRepair: "Repair in progress", cardPickup: "Free pickup", cardPickupSub: "At your doorstep",
      privacy: "100% data privacy assured", region: "Silvassa · Dadra & Nagar Haveli"
    },
    trust: [
      { t: "Genuine parts", s: "Quality you can trust" },
      { t: "Same-day service", s: "When time matters" },
      { t: "Free pickup & delivery", s: "We come to you" },
      { t: "Pay after delivery", s: "Only when it's fixed" }
    ],
    services: {
      eyebrow: "WHAT WE FIX", t1: "Repair, without", t2: "the runaround.",
      sub: "From a cracked screen to a stubborn charging port, our certified technicians handle the details so you don't have to.",
      getQuote: "Get a quote",
      items: [
        { name: "Screen Replacement", price: "From ₹999" }, { name: "Battery Replacement", price: "From ₹699" },
        { name: "Charging Port Repair", price: "From ₹499" }, { name: "Camera Repair", price: "From ₹799" },
        { name: "Speaker & Microphone", price: "From ₹499" }, { name: "Water Damage Repair", price: "From ₹1,499" },
        { name: "Motherboard Repair", price: "From ₹1,999" }, { name: "Software Issues", price: "From ₹299" },
        { name: "Data Recovery", price: "From ₹1,299" }, { name: "Back Glass Replacement", price: "From ₹899" }
      ]
    },
    steps: {
      eyebrow: "SIMPLE BY DESIGN", t1: "Four steps to a", t2: "better phone day.",
      sub: "We've made getting your phone fixed feel less like a chore and more like a quick handoff.",
      items: [
        { title: "Book a repair", text: "Submit your service request through the Dolmencare app or WhatsApp." },
        { title: "Describe the issue", text: "Tell us your phone model and explain the problem." },
        { title: "We pick it up & repair", text: "We confirm the service details and charges, then our technicians fix it." },
        { title: "Pay after delivery", text: "Your repaired phone returns safely — pay only after delivery." }
      ]
    },
    diff: {
      eyebrow: "THE DOLMENCARE DIFFERENCE", t1: "Care that goes", t2: "under the surface.",
      sub: "We don't just replace parts. We diagnose properly, communicate clearly, and treat every device like it belongs to someone we know.",
      points: ["Certified repair technicians", "Transparent pricing, no hidden charges", "Live repair status updates", "Strict data privacy protocols"],
      cta: "Book your repair", label: "CERTIFIED TECHNICIANS"
    },
    sellBanner: {
      eyebrow: "OLD PHONE? NEW POSSIBILITIES", t1: "Turn your old phone", t2: "into instant value.",
      sub: "Get a fair, transparent estimate in under 2 minutes. We make selling your old phone simple.",
      cta: "Sell your old phone"
    },
    brands: { eyebrow: "WE SPEAK PHONE", t1: "Every major brand.", t2: "One trusted team.", sub: "Apple to Nothing, we know your device inside out." },
    app: {
      eyebrow: "DOLMENCARE, IN YOUR POCKET", t1: "Track your repair.", t2: "Anytime, anywhere.",
      sub: "Get live updates, manage pickups, and reach us faster with the Dolmencare Android app.",
      download: "Download Android app", comingSoon: "Android app — coming soon", onWay: "The Dolmencare app is on its way", trackBtn: "Track your booking"
    },
    reviews: {
      eyebrow: "KIND WORDS", t1: "Good repairs.", t2: "Great stories.",
      items: [
        { text: "My iPhone screen was replaced in just a few hours. Pickup and delivery made everything so convenient.", name: "Aarav K.", device: "iPhone 13 Pro" },
        { text: "Excellent service, affordable pricing, and professional staff. I finally found my go-to repair team.", name: "Riya S.", device: "Samsung S22" },
        { text: "My phone was repaired without me leaving home. Highly recommended to everyone in Silvassa.", name: "Nikhil P.", device: "OnePlus 11" }
      ]
    },
    faq: {
      eyebrow: "GOT QUESTIONS?", title: "Good to know.",
      sub: "Still curious? Call us at +91 9506636245 — we're happy to help.",
      items: [
        { q: "How long does repair take?", a: "Most repairs are completed within 2–24 hours, depending on the issue and parts availability." },
        { q: "Is pickup free?", a: "Yes, pickup and delivery are free in selected service areas." },
        { q: "Will my data be safe?", a: "Absolutely. We follow strict privacy and security protocols throughout every repair." },
        { q: "Do you provide warranty?", a: "Yes. Selected repairs include a service warranty — we'll confirm it with your quote." }
      ]
    },
    quote: {
      eyebrow: "INSTANT QUOTE", title: "Let's price your repair.",
      intro: "Share a few details and we'll get back with a clear starting estimate.",
      brand: "Phone brand", chooseBrand: "Choose brand", issue: "What needs fixing?", chooseIssue: "Choose a service",
      phone: "Your phone number", phonePh: "10-digit mobile number",
      email: "Email", emailHint: "optional — get status updates", emailPh: "you@example.com",
      submit: "Get my estimate", successT: "Quote request received", successP: "Our team will call you shortly with your best repair estimate."
    },
    sell: {
      eyebrow: "SELL YOUR OLD PHONE", title: "Give it a second life.",
      intro: "Tell us about your device. No pressure, just a fair estimate.",
      model: "Phone model", modelPh: "e.g. iPhone 11 64GB",
      condition: "Condition", chooseCondition: "Choose condition",
      conditions: ["Like new", "Good — minor signs of use", "Needs some love"],
      submit: "Get my valuation", successT: "Valuation request received", successP: "We'll call you soon with a fair estimate for your device.",
      phone: "Your phone number", phonePh: "10-digit mobile number", email: "Email", emailHint: "optional — get status updates", emailPh: "you@example.com"
    },
    formError: "We couldn't send that just now. Please call us at +91 9506636245.",
    done: "Done"
  },
  servicesPage: {
    eyebrow: "OUR MOBILE REPAIR SERVICES", t1: "Repairs that come", t2: "to your doorstep.",
    sub: "Dolmencare helps you request mobile repair services conveniently — book in the app or on WhatsApp, and we handle the rest across Silvassa and selected surrounding areas.",
    book: "Book a repair", call: "+91 9506636245",
    cards: [
      { title: "Screen Repair", text: "For cracked, broken, or malfunctioning screens. Repair options and pricing depend on your phone model and parts availability." },
      { title: "Battery Replacement", text: "For batteries that drain quickly, fail to charge properly, or require replacement after inspection." },
      { title: "Charging & Audio Problems", text: "Assistance with charging ports, speakers, microphones, and related faults." },
      { title: "Software Support", text: "Troubleshooting for supported software issues, device settings, and operating problems." },
      { title: "Other Mobile Repairs", text: "Many other repairs are available, subject to inspection and parts availability. Just ask us about your device." }
    ],
    bookingTitle: "Booking and payment",
    bookingText: "Submit your repair request using the Dolmencare app. We will confirm the service details and any applicable charges before proceeding. Payment instructions will be provided after the service is completed and the device is delivered, according to the confirmed booking terms — you pay after delivery.",
    availability: "Service availability: Silvassa and selected surrounding areas of Dadra & Nagar Haveli, subject to availability.",
    helpTitle: "Need help choosing?",
    helpText: "For assistance, call us at +91 9506636245 or email dolmenrepairing@gmail.com. Tell us your phone model and the problem, and we will guide you."
  },
  contactPage: {
    eyebrow: "CONTACT DOLMENCARE", t1: "We're here to help with", t2: "your repair.",
    sub: "Questions, bookings, or support — reach us on whichever channel suits you best. We aim to respond to enquiries as soon as reasonably possible.",
    whatsapp: "Chat on WhatsApp", callNow: "Call now",
    phoneT: "Phone", phoneS: "Mon–Sun, 9:00–21:00",
    emailT: "Email", emailS: "For bookings, quotes, and support",
    visitT: "Visit us", address: "Shop No. 11, Asha Complex, Near Main Char Rasta, Silvassa, Dadra & Nagar Haveli",
    areaT: "Service area", areaS: "Silvassa and surrounding areas of Dadra & Nagar Haveli, subject to service availability.",
    bizTitle: "Business details",
    bizName: "Business name: Dolmen Care (Dolmencare)",
    bizOp: "Business operator: Yashashree Corporation",
    bizArea: "Service area: Silvassa and surrounding areas of Dadra & Nagar Haveli",
    tipsTitle: "Customer support tips",
    tips: [
      "Please include your booking reference, mobile phone model, and a brief description of the problem when contacting us.",
      "For your privacy and security, never send your phone password, banking PIN, OTP, or other confidential credentials through any form or message."
    ]
  },
  deletePage: {
    eyebrow: "DELETE ACCOUNT", t1: "Delete your Dolmencare", t2: "app account.",
    sub: "If you created an account in the Dolmencare app, you can request deletion of your account and personal information at any time using any of the options below.",
    opts: [
      { title: "Option 1 — In the app", text: "Open the Dolmencare app and go to Profile → Account → Delete Account, then confirm. This option is available in app versions that include account settings." },
      { title: "Option 2 — By email", text: "Email us with the subject \"Delete my account\" from your registered email address, and include your registered phone number so we can verify the request." },
      { title: "Option 3 — By phone", text: "Call us and request account deletion. We will verify your identity using your registered phone number before proceeding." }
    ],
    whatTitle: "What happens after you request deletion",
    what: [
      "We verify the request against your registered phone number or email address.",
      "Your account and associated personal information are deleted within 7 working days, and we confirm the deletion by SMS or email.",
      "Deletion is permanent — booking history, saved devices, and app preferences cannot be recovered afterwards.",
      "Some service and invoice records may be retained where required for legal, tax, or dispute-resolution obligations, as described in our Privacy Policy."
    ]
  },
  privacyPage: {
    eyebrow: "PRIVACY POLICY", t1: "How Dolmencare handles", t2: "your information.",
    effective: "Effective date: 18 October 2026",
    intro: "Dolmen Care (Dolmencare) is operated by Yashashree Corporation. This policy explains how information may be handled when you use our mobile repair application, website, or contact our business.",
    linkDelete: "Delete Account page",
    sections: [
      { h: "1. Information We May Collect", paras: ["Depending on the features you use, we may collect information such as your name, phone number, email address, service address, device model, repair request, booking status, and customer support messages.", "If the application uses account registration, location services, analytics, notifications, or other third-party services, the information processed by those features is handled as described in this policy."] },
      { h: "2. How We Use Information", list: ["Receive and manage repair bookings.", "Coordinate service appointments and device pickup and delivery.", "Communicate booking updates and service charges.", "Process or confirm payments.", "Respond to customer questions.", "Protect the service against fraud and misuse."] },
      { h: "3. Payments", paras: ["Dolmencare may display the business's UPI QR code or other payment instructions after service delivery. Payments should be made only through the confirmed payment method.", "We do not ask customers to share their UPI PIN, bank password, or OTP with our staff. Any payment provider involved may process information according to its own privacy policy."] },
      { h: "4. Sharing of Information", paras: ["We do not sell customers' personal information. Information may be shared with service providers or other parties when necessary to operate the service, process payments, comply with applicable law, or protect users and the business.", "Third-party services currently used:"], list: ["WhatsApp (Meta Platforms) — booking and support conversations when you choose to contact us there.", "UPI payment apps — payments you make after service delivery are processed by your chosen payment app under its own privacy policy.", "PostHog — privacy-conscious usage analytics on our website to help us improve it."] },
      { h: "5. Data Security and Retention", paras: ["We take reasonable steps to protect customer information. Information is retained only as long as reasonably necessary for service delivery, business records, dispute resolution, or legal obligations. No internet-based system can guarantee absolute security."] },
      { h: "6. Your Choices and Rights", paras: ["You may contact us to request access to, correction of, or deletion of personal information, subject to applicable legal and record-retention requirements.", "If you have created an account in the Dolmencare app and want it deleted, follow the steps on our"], hasDeleteLink: true },
      { h: "7. Children's Privacy", paras: ["Dolmencare is intended for customers who can lawfully request our services. We do not knowingly collect children's personal information in violation of applicable law."] },
      { h: "8. Changes to This Policy", paras: ["We may update this policy when our services or data practices change. The latest version will always be published on this page."] },
      { h: "9. Contact", paras: ["Privacy questions and requests:"], list: ["Business operator: Yashashree Corporation", "App/service name: Dolmen Care (Dolmencare)", "Email: dolmenrepairing@gmail.com", "Phone: +91 9506636245", "Address: Dolmen Care, Shop No. 11, Asha Complex, Near Main Char Rasta, Silvassa, Dadra & Nagar Haveli"] }
    ]
  }
};
