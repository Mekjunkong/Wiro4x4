import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { MessageCircle, Calendar, Plus, X } from "lucide-react";
import { Link, useLocation } from "wouter";

export function FloatingActionButtons() {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [location] = useLocation();
  const isBookingPage = location === "/book";

  // N4: Only pulse 3 times on mount, then stop
  const [showPulse, setShowPulse] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 9000); // 3s x 3 cycles
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div
      className={`fixed right-4 md:right-6 flex flex-col gap-3 ${isBookingPage ? "bottom-16 md:bottom-20" : "bottom-4 md:bottom-6"}`}
      style={{ zIndex: 9999 }}
      role="group"
      aria-label={t("Quick actions", "פעולות מהירות")}
    >
      {/* Desktop / larger screens: always show both buttons */}
      {/* Small screens (<400px): collapsible FAB */}
      <div className="hidden min-[400px]:flex flex-col gap-3">
        {/* Book Now Button */}
        <Link href="/book">
          <button
            className={`border-2 border-[#D4AF37] text-[#D4AF37] bg-card hover:bg-[#D4AF37] hover:text-card rounded-full p-4 shadow-premium-lg transition-all duration-300 hover:scale-110 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 ${showPulse ? "animate-subtle-pulse" : ""}`}
            aria-label={t("Book Now", "הזמינו עכשיו")}
          >
            <Calendar className="h-6 w-6" />
            <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-card text-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {t("Book Now", "הזמינו עכשיו")}
            </span>
          </button>
        </Link>

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsAppClick}
          className={`bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-premium-lg transition-all duration-300 hover:scale-110 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 ${showPulse ? "animate-subtle-pulse" : ""}`}
          aria-label={t("Contact us on WhatsApp", "צרו קשר בוואטסאפ")}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-card text-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {t("Chat with us", "שלחו הודעה")}
          </span>
        </button>
      </div>

      {/* Small screens (<400px): collapsible single FAB */}
      <div className="flex min-[400px]:hidden flex-col gap-3 items-end">
        {isExpanded && (
          <>
            <Link href="/book">
              <button
                className="border-2 border-[#D4AF37] text-[#D4AF37] bg-card hover:bg-[#D4AF37] hover:text-card rounded-full p-4 shadow-premium-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2"
                aria-label={t("Book Now", "הזמינו עכשיו")}
              >
                <Calendar className="h-6 w-6" />
              </button>
            </Link>

            <button
              onClick={handleWhatsAppClick}
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-premium-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
              aria-label={t("Contact us on WhatsApp", "צרו קשר בוואטסאפ")}
            >
              <MessageCircle className="h-6 w-6" />
            </button>
          </>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1C1C1C] rounded-full p-4 shadow-premium-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2"
          aria-label={
            isExpanded
              ? t("Close quick actions", "סגירת פעולות מהירות")
              : t("Open quick actions", "פתיחת פעולות מהירות")
          }
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  );
}
