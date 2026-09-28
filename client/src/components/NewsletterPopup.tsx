import { useState, useEffect } from "react";
import { X, Mail, Send, Plane } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { COOKIE_CONSENT_KEY } from "@/lib/cookieConsent";

const STORAGE_KEY = "wiro_newsletter_dismissed";
const SHOW_DELAY_MS = 120_000; // Delay so booking CTAs stay primary
const DISMISS_DAYS = 30; // Don't show again for 30 days after dismiss

export function NewsletterPopup() {
  const { t, language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success(t("Subscribed successfully!", "נרשמת בהצלחה!"));
      setEmail("");
      dismiss(365); // Don't show for a year after subscribing
    },
    onError: err => {
      toast.error(err.message || t("Something went wrong", "משהו השתבש"));
    },
  });

  function dismiss(days = DISMISS_DAYS) {
    const expiry = Date.now() + days * 86_400_000;
    localStorage.setItem(STORAGE_KEY, String(expiry));
    setVisible(false);
  }

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && Date.now() < Number(stored)) return;

    // Gate: cookie consent must be accepted
    try {
      if (!localStorage.getItem(COOKIE_CONSENT_KEY)) return;
    } catch {
      return;
    }

    // Gate: must have viewed 3+ pages in this session
    try {
      const views = Number(sessionStorage.getItem("wiro_page_views") || "0");
      if (views < 3) return;
    } catch {
      return;
    }

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Dismiss on Escape key
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribeMutation.mutate({ email: email.trim(), language });
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-[10002] animate-in fade-in duration-300"
        onClick={() => dismiss()}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative bg-white dark:bg-card rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
          {/* Gold accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-accent via-accent/70 to-accent" />

          {/* Close button */}
          <button
            onClick={() => dismiss()}
            className="absolute top-3 right-3 p-1.5 rounded-full text-foreground/40 dark:text-white/40 hover:bg-foreground/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-8">
            {/* Icon */}
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mx-auto mb-5">
              <Plane className="w-7 h-7 text-accent" />
            </div>

            {/* Heading */}
            <h2 className="text-2xl md:text-[1.65rem] font-heading font-bold text-center text-foreground dark:text-white mb-3">
              {t("Love to Travel?", "אוהבים לטייל?")}
            </h2>

            {/* Body text */}
            <p className="text-foreground/60 dark:text-white/60 text-sm leading-relaxed text-center mb-2">
              {t(
                "If you love to travel, you're always looking for new destinations, great opportunities, tips and ideas\u2026",
                "מי שאוהב לטייל תמיד מחפש יעדים חדשים, הזדמנויות מעולות, טיפים ורעיונות\u2026"
              )}
            </p>
            <p className="text-foreground/60 dark:text-white/60 text-sm leading-relaxed text-center mb-6">
              {t(
                "Subscribe to our newsletter and be the first to hear about new destinations, exclusive deals for subscribers only, plus tips, articles and ideas for your next trip\u2026",
                "הרשמו למידעון שלנו ותוכלו לשמוע ראשונים על היעדים החדשים, המבצעים המיוחדים רק למנויי המידעון ועוד טיפים, כתבות ורעיונות לטיול הבא\u2026"
              )}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground/30 dark:text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t("Your email address", "כתובת האימייל שלך")}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-foreground/15 dark:border-white/15 bg-background dark:bg-muted text-foreground dark:text-white placeholder:text-foreground/35 dark:placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="w-full bg-accent hover:bg-accent-cta-hover text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                <Send className="w-4 h-4" />
                {subscribeMutation.isPending
                  ? t("Subscribing...", "נרשם...")
                  : t("Subscribe Now", "הרשמו עכשיו")}
              </button>
            </form>

            {/* No spam note */}
            <p className="text-foreground/35 dark:text-white/35 text-xs text-center mt-4">
              {t(
                "No spam, unsubscribe anytime.",
                "ללא ספאם, ביטול הרשמה בכל עת."
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
