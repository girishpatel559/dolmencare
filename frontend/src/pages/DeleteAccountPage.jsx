import { useEffect } from "react";
import { Mail, Phone, Smartphone, Trash2 } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import "./pages.css";

export default function DeleteAccountPage() {
  useEffect(() => { document.title = "Delete Account — Dolmencare"; }, []);
  return (
    <SiteLayout>
      <main className="page-main container" data-testid="delete-account-page">
        <div className="page-hero">
          <div className="eyebrow"><span className="eyebrow-line" /> DELETE ACCOUNT</div>
          <h1>Delete your Dolmencare <span>app account.</span></h1>
          <p>If you created an account in the Dolmencare app, you can request deletion of your account and personal information at any time using any of the options below.</p>
        </div>

        <div className="page-grid">
          <div className="info-card" data-testid="delete-option-app">
            <span className="info-icon"><Smartphone size={20} /></span>
            <h3>Option 1 — In the app</h3>
            <p>Open the Dolmencare app and go to <b>Profile → Account → Delete Account</b>, then confirm. This option is available in app versions that include account settings.</p>
          </div>
          <div className="info-card" data-testid="delete-option-email">
            <span className="info-icon"><Mail size={20} /></span>
            <h3>Option 2 — By email</h3>
            <p>Email us with the subject <b>"Delete my account"</b> from your registered email address, and include your registered phone number so we can verify the request.</p>
            <a className="card-link" href="mailto:dolmenrepairing@gmail.com?subject=Delete%20my%20account" data-testid="delete-email-link">dolmenrepairing@gmail.com</a>
          </div>
          <div className="info-card" data-testid="delete-option-phone">
            <span className="info-icon"><Phone size={20} /></span>
            <h3>Option 3 — By phone</h3>
            <p>Call us and request account deletion. We will verify your identity using your registered phone number before proceeding.</p>
            <a className="card-link" href="tel:+919506636245" data-testid="delete-phone-link">+91 9506636245</a>
          </div>
        </div>

        <div className="page-band" data-testid="delete-what-happens">
          <h2><Trash2 size={18} style={{ verticalAlign: "-3px" }} /> What happens after you request deletion</h2>
          <ul>
            <li>We verify the request against your registered phone number or email address.</li>
            <li>Your account and associated personal information are deleted within <b>7 working days</b>, and we confirm the deletion by SMS or email.</li>
            <li>Deletion is permanent — booking history, saved devices, and app preferences cannot be recovered afterwards.</li>
            <li>Some service and invoice records may be retained where required for legal, tax, or dispute-resolution obligations, as described in our Privacy Policy.</li>
          </ul>
        </div>
      </main>
    </SiteLayout>
  );
}
