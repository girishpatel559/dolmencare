import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import "./pages.css";

export default function PrivacyPage() {
  const { t } = useLanguage();
  const P = t.privacyPage;
  useEffect(() => { document.title = "Privacy Policy — Dolmencare"; }, []);
  return (
    <SiteLayout>
      <main className="page-main container" data-testid="privacy-page">
        <div className="page-hero">
          <div className="eyebrow"><span className="eyebrow-line" /> {P.eyebrow}</div>
          <h1>{P.t1} <span>{P.t2}</span></h1>
          <span className="policy-meta" data-testid="privacy-effective-date">{P.effective}</span>
          <p>{P.intro}</p>
        </div>

        <div className="prose">
          {P.sections.map((section) => (
            <section key={section.h}>
              <h2>{section.h}</h2>
              {section.paras?.map((para, pIndex) => (
                <p key={para.slice(0, 24)}>
                  {para}
                  {section.hasDeleteLink && pIndex === section.paras.length - 1 && (
                    <> <Link to="/delete-account" data-testid="privacy-delete-account-link">{P.linkDelete}</Link>.</>
                  )}
                </p>
              ))}
              {section.list && <ul>{section.list.map((item) => <li key={item.slice(0, 24)}>{item}</li>)}</ul>}
            </section>
          ))}
        </div>
      </main>
    </SiteLayout>
  );
}
