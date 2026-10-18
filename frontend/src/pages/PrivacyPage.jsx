import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import "./pages.css";

export default function PrivacyPage() {
  useEffect(() => { document.title = "Privacy Policy — Dolmencare"; }, []);
  return (
    <SiteLayout>
      <main className="page-main container" data-testid="privacy-page">
        <div className="page-hero">
          <div className="eyebrow"><span className="eyebrow-line" /> PRIVACY POLICY</div>
          <h1>How Dolmencare handles <span>your information.</span></h1>
          <span className="policy-meta" data-testid="privacy-effective-date">Effective date: 18 October 2026</span>
          <p>Dolmen Care (Dolmencare) is operated by Yashashree Corporation. This policy explains how information may be handled when you use our mobile repair application, website, or contact our business.</p>
        </div>

        <div className="prose">
          <h2>1. Information We May Collect</h2>
          <p>Depending on the features you use, we may collect information such as your name, phone number, email address, service address, device model, repair request, booking status, and customer support messages.</p>
          <p>If the application uses account registration, location services, analytics, notifications, or other third-party services, the information processed by those features is handled as described in this policy.</p>

          <h2>2. How We Use Information</h2>
          <ul>
            <li>Receive and manage repair bookings.</li>
            <li>Coordinate service appointments and device pickup and delivery.</li>
            <li>Communicate booking updates and service charges.</li>
            <li>Process or confirm payments.</li>
            <li>Respond to customer questions.</li>
            <li>Protect the service against fraud and misuse.</li>
          </ul>

          <h2>3. Payments</h2>
          <p>Dolmencare may display the business's UPI QR code or other payment instructions after service delivery. Payments should be made only through the confirmed payment method.</p>
          <p>We do not ask customers to share their UPI PIN, bank password, or OTP with our staff. Any payment provider involved may process information according to its own privacy policy.</p>

          <h2>4. Sharing of Information</h2>
          <p>We do not sell customers' personal information. Information may be shared with service providers or other parties when necessary to operate the service, process payments, comply with applicable law, or protect users and the business.</p>
          <p>Third-party services currently used:</p>
          <ul>
            <li><b>WhatsApp (Meta Platforms)</b> — booking and support conversations when you choose to contact us there.</li>
            <li><b>UPI payment apps</b> — payments you make after service delivery are processed by your chosen payment app under its own privacy policy.</li>
            <li><b>PostHog</b> — privacy-conscious usage analytics on our website to help us improve it.</li>
          </ul>

          <h2>5. Data Security and Retention</h2>
          <p>We take reasonable steps to protect customer information. Information is retained only as long as reasonably necessary for service delivery, business records, dispute resolution, or legal obligations. No internet-based system can guarantee absolute security.</p>

          <h2>6. Your Choices and Rights</h2>
          <p>You may contact us to request access to, correction of, or deletion of personal information, subject to applicable legal and record-retention requirements.</p>
          <p>If you have created an account in the Dolmencare app and want it deleted, follow the steps on our <Link to="/delete-account" data-testid="privacy-delete-account-link">Delete Account page</Link>.</p>

          <h2>7. Children's Privacy</h2>
          <p>Dolmencare is intended for customers who can lawfully request our services. We do not knowingly collect children's personal information in violation of applicable law.</p>

          <h2>8. Changes to This Policy</h2>
          <p>We may update this policy when our services or data practices change. The latest version will always be published on this page.</p>

          <h2>9. Contact</h2>
          <p>Privacy questions and requests:</p>
          <ul>
            <li><b>Business operator:</b> Yashashree Corporation</li>
            <li><b>App/service name:</b> Dolmen Care (Dolmencare)</li>
            <li><b>Email:</b> <a href="mailto:dolmenrepairing@gmail.com">dolmenrepairing@gmail.com</a></li>
            <li><b>Phone:</b> <a href="tel:+919506636245">+91 9506636245</a></li>
            <li><b>Address:</b> Dolmen Care, Shop No. 11, Asha Complex, Near Main Char Rasta, Silvassa, Dadra & Nagar Haveli</li>
          </ul>
        </div>
      </main>
    </SiteLayout>
  );
}
