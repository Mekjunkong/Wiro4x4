import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { MessageCircle, Calendar, HelpCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trackEvent } from "@/lib/analytics";

export function FloatingActionButtons() {
  const { t, language } = useLanguage();
  const [location] = useLocation();
  const isBookingPage = location === "/book";

  const [chatOpen, setChatOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => setChatOpen((e as CustomEvent).detail);
    window.addEventListener("chat-open", handler);
    return () => window.removeEventListener("chat-open", handler);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const updateScrollState = () => {
      setHasScrolledPastHero(window.scrollY > window.innerHeight * 0.55);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const isHomePage = location === "/";
  const hideOnHomeHero = isHomePage && !hasScrolledPastHero;
  const hideOnMobile = isMobile && isHomePage;

  const handleWhatsAppClick = () => {
    trackEvent("floating_whatsapp_click", { language, path: location });
    const message =
      language === "he"
        ? encodeURIComponent(
            "שלום, אנחנו רוצים לבדוק זמינות ומחיר לטיול 4x4 פרטי בצ'יאנג מאי. תאריכים/גודל קבוצה:"
          )
        : encodeURIComponent(
            "Hi WIRO, we'd like to check availability and price for a private 4x4 tour in Chiang Mai. Dates/group size:"
          );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleChatClick = () => {
    window.dispatchEvent(new CustomEvent("chat-toggle"));
  };

  if (hideOnMobile || hideOnHomeHero || chatOpen) return null;

  const isRtl = language === "he";
  const bottomClass = isBookingPage ? "bottom-20 md:bottom-6" : "bottom-6";
  const sideClass = isRtl ? "left-4 md:left-6" : "right-4 md:right-6";
  const tooltipOrder = isRtl ? "order-last" : "";
  const rowDir = isRtl ? "flex-row-reverse" : "";

  return (
    <div
      className={`fixed ${sideClass} ${bottomClass} flex flex-col items-end gap-3`}
      style={{ zIndex: 9997 }}
      role="group"
      aria-label={t("Quick actions", "פעולות מהירות")}
    >
      {/* Trip Planner */}
      <div className={`relative group flex items-center gap-2 ${rowDir}`}>
        <span
          className={`${tooltipOrder} opacity-0 group-hover:opacity-100 transition-opacity bg-card text-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-md border border-border/70 whitespace-nowrap`}
        >
          {t("Ask WIRO", "שאלו את WIRO")}
        </span>
        <button
          type="button"
          onClick={handleChatClick}
          className="inline-flex items-center justify-center min-w-12 min-h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          aria-label={t("Ask WIRO trip planner", "שאלו את מתכנן הטיול של WIRO")}
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>

      {/* Ask Availability */}
      <div className={`relative group flex items-center gap-2 ${rowDir}`}>
        <span
          className={`${tooltipOrder} opacity-0 group-hover:opacity-100 transition-opacity bg-card text-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-md border border-border/70 whitespace-nowrap`}
        >
          {t("Ask Availability", "בדקו זמינות")}
        </span>
        <Link
          href="/book"
          onClick={() =>
            trackEvent("floating_book_click", { language, path: location })
          }
          className="inline-flex items-center justify-center min-w-12 min-h-12 border-2 border-secondary text-secondary bg-card hover:bg-secondary hover:text-secondary-foreground rounded-full shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          aria-label={t("Ask Availability", "בדקו זמינות")}
        >
          <Calendar className="h-5 w-5" />
        </Link>
      </div>

      {/* WhatsApp */}
      <div className={`relative group flex items-center gap-2 ${rowDir}`}>
        <span
          className={`${tooltipOrder} opacity-0 group-hover:opacity-100 transition-opacity bg-card text-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-md border border-border/70 whitespace-nowrap`}
        >
          {t("WhatsApp", "וואטסאפ")}
        </span>
        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="inline-flex items-center justify-center min-w-12 min-h-12 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
          aria-label={t("Contact us on WhatsApp", "צרו קשר בוואטסאפ")}
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
