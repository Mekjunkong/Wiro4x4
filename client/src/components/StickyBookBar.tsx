import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { Calendar, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { trackEvent } from "@/lib/analytics";

export function StickyBookBar() {
  const { t, language } = useLanguage();
  const [chatOpen, setChatOpen] = useState(false);

  const handleWhatsAppClick = () => {
    trackEvent("sticky_whatsapp_click", { language });
    const message =
      language === "he"
        ? encodeURIComponent(
            "שלום, אנחנו רוצים לבדוק זמינות ומחיר לטיול 4x4 פרטי בצ'יאנג מאי. תאריכים/גודל קבוצה:"
          )
        : encodeURIComponent(
            "Hi WIRO, we'd like to check availability and price for a private 4x4 tour in Chiang Mai. Dates/group size:"
          );

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  useEffect(() => {
    const handler = (e: Event) => setChatOpen((e as CustomEvent).detail);
    window.addEventListener("chat-open", handler);
    return () => window.removeEventListener("chat-open", handler);
  }, []);

  if (chatOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9998] md:hidden border-t border-accent/30 bg-card/95 px-4 py-3 backdrop-blur-md shadow-[0_-12px_36px_rgba(15,23,42,0.16)]">
      <div className="mx-auto max-w-7xl space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground/95">
              {t("Chiang Mai Off-Road Tours", "טיולי שטח בצ'יאנג מאי")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("From $81/person", "החל מ-$81 לאדם")}
            </p>
          </div>
          <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
            {t("Fast response", "מענה מהיר")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#25D366]/25 bg-[#25D366]/10 px-3 py-2 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/15 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
            aria-label={t("Contact us on WhatsApp", "צרו קשר בוואטסאפ")}
          >
            <MessageCircle className="h-4 w-4" />
            {t("WhatsApp", "וואטסאפ")}
          </button>

          <Link
            href="/book"
            onClick={() => trackEvent("sticky_book_click")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent-cta px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent-cta-hover focus:outline-none focus:ring-2 focus:ring-accent-cta focus:ring-offset-2"
          >
            <Calendar className="h-4 w-4" />
            {t("Ask Availability", "בדקו זמינות")}
          </Link>
        </div>
      </div>
    </div>
  );
}
