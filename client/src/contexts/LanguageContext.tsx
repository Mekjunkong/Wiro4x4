import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

type Language = "en" | "th" | "he";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Bilingual t() — Thai falls back to English if not provided */
  t: (en: string, th?: string, he?: string) => string;
}

const STORAGE_KEY = "wiro-preferred-language";

function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "he" || stored === "th") {
      return stored;
    }
  } catch {
    // localStorage unavailable (SSR, private browsing, etc.)
  }
  // Auto-detect from browser language on first visit
  if (typeof navigator !== "undefined") {
    const lang = navigator.language?.toLowerCase();
    if (lang?.startsWith("he")) return "he";
    if (lang?.startsWith("th")) return "th";
  }
  return "en";
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const HEBREW_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&family=Heebo:wght@400;500&display=swap";
const HEBREW_FONTS_ID = "hebrew-fonts";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Load Hebrew fonts (Rubik + Heebo) only when needed
  useEffect(() => {
    if (language !== "he") return;
    if (document.getElementById(HEBREW_FONTS_ID)) return;
    const link = document.createElement("link");
    link.id = HEBREW_FONTS_ID;
    link.rel = "stylesheet";
    link.href = HEBREW_FONTS_URL;
    document.head.appendChild(link);
  }, [language]);

  const t = (en: string, th?: string, he?: string) => {
    if (language === "en") return en;
    if (language === "th") return th ?? en;
    return he ?? en; // Hebrew fallback
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div
        lang={language}
        dir={language === "he" ? "rtl" : "ltr"}
        className={language === "he" ? "rtl" : ""}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
