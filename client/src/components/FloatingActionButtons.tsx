import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bot, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from "@/lib/cookieConsent";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

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
    window.dispatchEvent(new CustomEvent("chat-toggle"));
  };

  const whatsappMessage =
    language === "he"
      ? "שלום WIRO 4x4, נשמח לבדוק זמינות לטיול פרטי.\nתאריכים: __\nמספר מטיילים: __\nמלון או אזור איסוף: __\nרעיון למסלול: __\nצרכי כשרות / שבת / מדריך בעברית: __"
      : "Hi WIRO 4x4, I'd like to check availability for a private tour.\nDates: __\nGroup size: __\nPickup area or hotel: __\nRoute idea: __\nKosher / Shabbat / Hebrew-guide needs: __";
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
      role="group"
      aria-label={t("Quick actions", "פעולות מהירות")}
      style={{ zIndex: 9997 }}
    >
      <div className="site-floating-actions flex flex-col items-end gap-2">
        <TrackedWhatsAppLink
          sourceCode={language === "he" ? "GLOBAL-FLOAT-HE" : "GLOBAL-FLOAT-EN"}
          humanMessage={whatsappMessage}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center gap-2 rounded-sm bg-[#25D366] px-3.5 text-white shadow-lg transition-all duration-200 hover:bg-[#20BA5A] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 sm:px-4"
          aria-label={t(
            "Check availability on WhatsApp",
            "בדיקת זמינות בוואטסאפ"
          )}
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-semibold">
            {t("WhatsApp", "וואטסאפ")}
          </span>
        </TrackedWhatsAppLink>
        <button
          type="button"
          onClick={handleChatClick}
          className="flex h-11 items-center justify-center gap-2 rounded-sm border border-[#f0bd3f]/45 bg-[#10231c]/95 px-3.5 text-[#f5f0e7] shadow-lg transition-all duration-200 hover:bg-[#1a3428] focus:outline-none focus:ring-2 focus:ring-[#f0bd3f] focus:ring-offset-2 sm:px-4"
          aria-label={t("Ask Levi", "שאלו את לוי")}
        >
          <Bot className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-semibold sm:hidden">
            {t("Levi", "לוי")}
          </span>
          <span className="hidden text-sm font-semibold sm:inline">
            {t("Ask Levi", "שאלו את לוי")}
          </span>
        </button>
      </div>
    </div>
  );
}
