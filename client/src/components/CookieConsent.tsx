import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const COOKIE_CONSENT_KEY = "cookie-consent-accepted";

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
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up"
      role="dialog"
      aria-label={t("Cookie consent", "הסכמה לעוגיות")}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 md:p-6 shadow-premium-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <p className="text-sm text-muted-foreground flex-1">
            {t(
              "We use cookies and local storage for essential site functionality, such as authentication and saving your booking draft.",
              "האתר משתמש בעוגיות ואחסון מקומי לתפקוד בסיסי, כמו התחברות ושמירת טיוטת הזמנה."
            )}{" "}
            <a
              href="/privacy"
              className="text-primary hover:underline font-medium"
            >
              {t("Learn more", "למידע נוסף")}
            </a>
          </p>
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            {t("Accept", "אישור")}
          </button>
        </div>
      </div>
    </div>
  );
}
