import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "lucide-react";
import { Link } from "wouter";

export function StickyBookBar() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-[#1C1C1C]/95 backdrop-blur-sm border-b border-[#D4AF37]/30 py-2 px-4 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="hidden sm:block text-white/90 text-sm font-medium">
          {t(
            "Ready for your Chiang Mai adventure?",
            "מוכנים להרפתקה בצ'יאנג מאי?"
          )}
        </p>
        <Link href="/book">
          <button className="bg-[#D4AF37] text-[#1C1C1C] rounded-full px-5 py-1.5 font-semibold text-sm flex items-center gap-2 hover:bg-[#D4AF37]/90 transition-colors">
            <Calendar className="w-4 h-4" />
            {t("Book Now", "הזמינו עכשיו")}
          </button>
        </Link>
      </div>
    </div>
  );
}
