import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const STORAGE_KEY = "wiro-announcement-dismissed";

const OFFERS = [
  { en: "Book 3+ days and get 10% off!", he: "הזמינו 3+ ימים וקבלו 10% הנחה!" },
  {
    en: "Early bird special — Book now for peak season!",
    he: "מבצע מוקדם — הזמינו עכשיו לעונת השיא!",
  },
  {
    en: "New! Samoeng Loop Mountain Circuit now available",
    he: "חדש! מסלול לולאת סמואנג זמין עכשיו",
  },
];

export function AnnouncementBar() {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(STORAGE_KEY);
    if (!wasDismissed) setDismissed(false);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % OFFERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [dismissed]);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const offer = OFFERS[currentIndex];

  return (
    <div
      className="bg-[#d4af37] text-[#1c1c1c] text-center text-sm font-medium relative"
      style={{ height: "36px", lineHeight: "36px" }}
    >
      <span className="inline-block animate-fade-in">
        {t(offer.en, offer.he)}
      </span>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label={t("Dismiss announcement", "סגור הודעה")}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
