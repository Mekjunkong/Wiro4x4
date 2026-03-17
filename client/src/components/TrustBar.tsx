import { Star, Users, MessageCircle, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TRUST_ITEMS = [
  { icon: Star, value: "4.9", en: "Google Rating", he: "דירוג גוגל" },
  { icon: Users, value: "500+", en: "Happy Travelers", he: "מטיילים מרוצים" },
  {
    icon: MessageCircle,
    value: "עברית",
    en: "Hebrew Speaking",
    he: "דוברי עברית",
  },
  { icon: ShieldCheck, value: "100%", en: "Kosher Meals", he: "אוכל כשר" },
];

export function TrustBar() {
  const { t } = useLanguage();

  return (
    <section className="py-4 bg-primary border-y border-accent/20">
      <div className="container">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {TRUST_ITEMS.map(item => (
            <div
              key={item.en}
              className="flex items-center gap-2 text-white/90"
            >
              <item.icon className="w-4 h-4 text-accent" />
              <span className="font-bold text-sm">{item.value}</span>
              <span className="text-xs text-white/60 uppercase tracking-wider">
                {t(item.en, item.he)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
