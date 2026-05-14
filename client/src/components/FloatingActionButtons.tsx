import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bot } from "lucide-react";
import { useLocation } from "wouter";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from "@/lib/cookieConsent";
import { trackEvent } from "@/lib/analytics";

export function FloatingActionButtons() {
  const { t, language } = useLanguage();
  const [location] = useLocation();
  const isBookingPage = location === "/book";

  const [scrolledPast, setScrolledPast] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [consentGiven, setConsentGiven] = useState(() => {
    try {
      return !!localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e: Event) => setChatOpen((e as CustomEvent).detail);
    window.addEventListener("chat-open", handler);
    return () => window.removeEventListener("chat-open", handler);
  }, []);

  useEffect(() => {
    const onConsent = () => setConsentGiven(true);
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolledPast(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChatClick = () => {
    trackEvent("floating_chat_click", { language, path: location });
    window.dispatchEvent(new CustomEvent("chat-toggle"));
  };

  const isHomePage = location === "/";
  const hideUntilUsefulOnHome = isHomePage && (!scrolledPast || !consentGiven);

  if (isBookingPage || hideUntilUsefulOnHome || chatOpen) return null;

  const isRtl = language === "he";
  const bottomClass =
    isMobile && !consentGiven ? "bottom-36 md:bottom-6" : "bottom-6";
  const sideClass = isRtl ? "left-4 md:left-6" : "right-4 md:right-6";

  return (
    <div
      className={`fixed ${sideClass} ${bottomClass}`}
      style={{ zIndex: 9997 }}
    >
      <button
        onClick={handleChatClick}
        className="h-12 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg flex items-center justify-center gap-2 px-3 sm:px-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
        aria-label={t("Ask Moshe", "שאלו את משה")}
      >
        <Bot className="h-5 w-5" />
        <span className="hidden sm:inline text-sm font-semibold">
          {t("Ask Moshe", "שאלו את משה")}
        </span>
      </button>
    </div>
  );
}
