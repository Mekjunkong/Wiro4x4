import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "lucide-react";
import { Link } from "wouter";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from "@/lib/cookieConsent";

export function StickyBookBar() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visible = scrolled && consentGiven;

  return (
    <div
      className={`fixed left-0 right-0 z-[9998] transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full md:-translate-y-full opacity-0 pointer-events-none"
      } bottom-0 md:bottom-auto md:top-0 bg-card/95 backdrop-blur-sm border-t md:border-b md:border-t-0 border-accent/30 py-2 px-4`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <p className="text-foreground/90 text-sm font-medium">
            {t("Chiang Mai Off-Road Tours", "טיולי שטח בצ'יאנג מאי")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("From ฿2,900/person", "החל מ-฿2,900 לאדם")}
          </p>
        </div>
        <Link href="/book">
          <button className="bg-accent-cta text-primary-foreground rounded-full px-5 py-2 font-semibold text-sm flex items-center gap-2 hover:bg-accent-cta-hover transition-colors">
            <Calendar className="w-4 h-4" />
            {t("Book Now", "הזמינו עכשיו")}
          </button>
        </Link>
      </div>
    </div>
  );
}
