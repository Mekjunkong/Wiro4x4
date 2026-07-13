import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  ReactNode,
} from "react";
import { useLocation } from "wouter";

type Language = "en" | "he";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, he: string) => string;
}

const STORAGE_KEY = "wiro-preferred-language";
const ENGLISH_COMMERCIAL_ROUTES = new Set([
  "/kosher-tours",
  "/hebrew-guide",
  "/private-family-tours",
]);

export function getForcedRouteLanguage(pathname: string): Language | null {
  if (pathname === "/he" || pathname.startsWith("/he/")) return "he";
  if (ENGLISH_COMMERCIAL_ROUTES.has(pathname)) return "en";
  return null;
}

function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "he") {
      return stored;
    }
  } catch {
    // localStorage unavailable (SSR, private browsing, etc.)
  }
  // Auto-detect Hebrew from browser language on first visit
  if (
    typeof navigator !== "undefined" &&
    navigator.language?.startsWith("he")
  ) {
    return "he";
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
  const [location] = useLocation();
  const [preferredLanguage, setLanguageState] =
    useState<Language>(getStoredLanguage);
  const language = getForcedRouteLanguage(location) ?? preferredLanguage;

  // Content language is selected during render; root attributes follow in a
  // layout effect before the browser paints the route.
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
  }, [language]);

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

  const t = (en: string, he: string) => {
    return language === "en" ? en : he;
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
