import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./index";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("dolmen-lang");
    return translations[saved] ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("dolmen-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: translations[lang] || translations.en }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
