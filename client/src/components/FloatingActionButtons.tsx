import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from "@/lib/cookieConsent";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

export function FloatingActionButtons() {
  const { t, language } = useLanguage();
  const [location] = useLocation();
  const isBookingPage = location === "/book";

  const [scrolledPast, setScrolledPast] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [consentGiven, setConsentGiven] = useState(() => {
    try {
      return !!localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch {
      return false;
    }
  });

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
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const whatsappMessage =
    language === "he"
      ? "שלום WIRO 4x4, נשמח לבדוק זמינות לטיול פרטי.\nתאריכים: __\nמספר מטיילים: __\nמלון או אזור איסוף: __\nרעיון למסלול: __\nצרכי כשרות / שבת / מדריך בעברית: __"
      : "Hi WIRO 4x4, I'd like to check availability for a private tour.\nDates: __\nGroup size: __\nPickup area or hotel: __\nRoute idea: __\nKosher / Shabbat / Hebrew-guide needs: __";
  const isHomePage = location === "/";
  const hideUntilUsefulOnHome = isHomePage && !scrolledPast;

  if (isBookingPage || hideUntilUsefulOnHome) return null;

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
        {isHomePage && (
          <Link
            href="/book"
            className="flex h-11 items-center justify-center gap-2 rounded-sm bg-accent-cta px-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:bg-accent-cta-hover focus:outline-none focus:ring-2 focus:ring-accent-cta focus:ring-offset-2 sm:px-4"
            aria-label={t("Book a tour", "הזמינו טיול")}
          >
            <Calendar className="h-5 w-5" aria-hidden="true" />
            <span>{t("Book Now", "הזמינו עכשיו")}</span>
          </Link>
        )}
        {!isHomePage && (
          <TrackedWhatsAppLink
            sourceCode={
              language === "he" ? "GLOBAL-FLOAT-HE" : "GLOBAL-FLOAT-EN"
            }
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
        )}
      </div>
    </div>
  );
}
