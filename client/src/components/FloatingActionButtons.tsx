import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { MessageCircle, Calendar, Bot } from "lucide-react";
import { Link, useLocation } from "wouter";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from "@/lib/cookieConsent";

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

  const isHomePage = location === "/";
  const hideOnMobile = isMobile && scrolledPast && consentGiven && isHomePage;

  const handleWhatsAppClick = () => {
    const message =
      language === "he"
        ? encodeURIComponent(
            "שלום, אני מעוניין/ת בטיול שטח בצ'יאנג מאי. אשמח לפרטים נוספים!"
          )
        : encodeURIComponent(
            "Hi! I'm interested in an off-road tour in Chiang Mai. Can you tell me more?"
          );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleChatClick = () => {
    window.dispatchEvent(new CustomEvent("chat-toggle"));
  };

  if (hideOnMobile || chatOpen) return null;

  const bottomClass = isBookingPage ? "bottom-20 md:bottom-6" : "bottom-6";

  return (
    <div
      className={`fixed right-4 md:right-6 ${bottomClass} flex flex-col items-end gap-3`}
      style={{ zIndex: 9997 }}
      role="group"
      aria-label={t("Quick actions", "פעולות מהירות")}
    >
      {/* Chat with Moshe */}
      <div className="relative group flex items-center gap-2">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
          {t("Chat with Moshe", "דברו עם משה")}
        </span>
        <button
          onClick={handleChatClick}
          className="w-12 h-12 bg-secondary hover:bg-secondary/90 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          aria-label={t("Chat with Moshe", "דברו עם משה")}
        >
          <Bot className="h-5 w-5" />
        </button>
      </div>

      {/* Book Now */}
      <div className="relative group flex items-center gap-2">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
          {t("Book Now", "הזמינו עכשיו")}
        </span>
        <Link href="/book">
          <button
            className="w-12 h-12 border-2 border-secondary text-secondary bg-white hover:bg-secondary hover:text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            aria-label={t("Book Now", "הזמינו עכשיו")}
          >
            <Calendar className="h-5 w-5" />
          </button>
        </Link>
      </div>

      {/* WhatsApp */}
      <div className="relative group flex items-center gap-2">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
          {t("WhatsApp", "וואטסאפ")}
        </span>
        <button
          onClick={handleWhatsAppClick}
          className="w-12 h-12 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
          aria-label={t("Contact us on WhatsApp", "צרו קשר בוואטסאפ")}
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
