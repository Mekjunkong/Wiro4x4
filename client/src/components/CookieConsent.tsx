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
      className="site-cookie-consent fixed bottom-0 inset-x-0 z-[9997] animate-fade-in-up px-3 pb-3 sm:px-4"
      role="region"
      aria-label={t("Cookie consent", "הסכמה לעוגיות")}
    >
      <div className="mx-auto max-w-xl sm:max-w-2xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-sm border border-[#f0bd3f]/25 bg-[#10231c]/95 px-3 py-2.5 text-[#f5f0e7] shadow-[0_-8px_30px_rgba(11,42,34,0.22)] backdrop-blur-sm md:px-4">
          <p className="flex-1 text-xs leading-snug text-[#d9d2c4] sm:text-sm">
            {t(
              "Essential cookies save booking drafts.",
              "עוגיות חיוניות שומרות טיוטת הזמנה."
            )}{" "}
            <a
              href="/privacy"
              className="font-medium text-[#f0bd3f] hover:underline"
            >
              {t("Read our Privacy Policy", "קראו את מדיניות הפרטיות שלנו")}
            </a>
          </p>
          <button
            onClick={handleAccept}
            className="whitespace-nowrap rounded-sm bg-[#f0bd3f] px-4 py-2 text-xs font-semibold text-[#10231c] transition-colors hover:bg-[#ffd36b] sm:text-sm"
          >
            {t("Accept", "אישור")}
          </button>
        </div>
      </div>
    </div>
  );
}
