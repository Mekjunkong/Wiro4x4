import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppPrompt() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current) return;

    const handleScroll = () => {
      if (hasTriggered.current) return;

      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const scrollPercent = window.scrollY / scrollHeight;
      if (scrollPercent > 0.7) {
        hasTriggered.current = true;
        setVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible || dismissed) return null;

  const encodedMessage = encodeURIComponent(
    t(
      "Hi WIRO 4x4 \u2013 I have some questions about your tours.",
      "\u05D4\u05D9\u05D9 WIRO 4x4 \u2014 \u05D9\u05E9 \u05DC\u05D9 \u05DB\u05DE\u05D4 \u05E9\u05D0\u05DC\u05D5\u05EA \u05E2\u05DC \u05D4\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD \u05E9\u05DC\u05DB\u05DD."
    )
  );

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-24 left-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-[280px] border border-gray-100 relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 rounded"
          aria-label={t("Close", "\u05E1\u05D2\u05D5\u05E8")}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Prompt text */}
        <p className="text-sm text-gray-700 pr-5 mb-3">
          {t(
            "Have questions? Chat with us on WhatsApp!",
            "\u05D9\u05E9 \u05DC\u05DA \u05E9\u05D0\u05DC\u05D5\u05EA? \u05D3\u05D1\u05E8\u05D5 \u05D0\u05D9\u05EA\u05E0\u05D5 \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4!"
          )}
        </p>

        {/* CTA button */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-medium rounded-full px-4 py-2 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {t(
            "Chat Now",
            "\u05E6\u05D0\u05D8\u05D5 \u05E2\u05DB\u05E9\u05D9\u05D5"
          )}
        </a>
      </div>
    </div>
  );
}
