import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from "@/lib/cookieConsent";

export function CookieConsent() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_CONSENT_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    } catch {
      // localStorage not available
    }
    window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-2 inset-x-3 z-[9997] animate-fade-in-up sm:inset-x-0 sm:px-4"
      role="region"
      aria-label={t("Cookie consent", "הסכמה לעוגיות")}
    >
      <div className="mx-auto max-w-xl sm:max-w-2xl">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-md px-3 py-2.5 md:px-4 shadow-premium flex items-center gap-3">
          <p className="text-xs sm:text-sm text-muted-foreground flex-1 leading-snug">
            {t(
              "Essential cookies save booking drafts.",
              "עוגיות חיוניות שומרות טיוטת הזמנה."
            )}{" "}
            <a
              href="/privacy"
              className="text-primary hover:underline font-medium"
            >
              {t("Read our Privacy Policy", "קראו את מדיניות הפרטיות שלנו")}
            </a>
          </p>
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            {t("Accept", "אישור")}
          </button>
        </div>
      </div>
    </div>
  );
}
