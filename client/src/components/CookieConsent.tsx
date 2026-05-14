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
      className="fixed bottom-3 inset-x-0 z-[9997] px-4 animate-fade-in-up"
      role="region"
      aria-label={t("Cookie consent", "הסכמה לעוגיות")}
    >
      <div className="mx-auto max-w-3xl">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-4 py-3 md:px-5 shadow-premium flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-sm text-muted-foreground flex-1">
            {t(
              "We use cookies for essential site features, including booking drafts.",
              "האתר משתמש בעוגיות לתפקוד בסיסי, כולל שמירת טיוטת הזמנה."
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
            className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            {t("Accept", "אישור")}
          </button>
        </div>
      </div>
    </div>
  );
}
