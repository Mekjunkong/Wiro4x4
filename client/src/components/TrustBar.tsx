import { Languages, MessageCircle, Star, Utensils } from "lucide-react";
import { COMPANY_TRIPADVISOR_URL } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";

const TRUST_ITEMS = [
  {
    icon: Star,
    value: "Tripadvisor",
    en: "Public Reviews",
    he: "ביקורות ציבוריות",
    href: COMPANY_TRIPADVISOR_URL,
  },
  {
    icon: MessageCircle,
    value: "Private",
    en: "Trip Planning",
    he: "תכנון טיול פרטי",
  },
  {
    icon: Languages,
    value: "עברית",
    en: "Hebrew Speaking",
    he: "דוברי עברית",
  },
  {
    icon: Utensils,
    value: "Kosher-aware",
    en: "Meal Coordination",
    he: "תיאום ארוחות",
  },
] as const;

export function TrustBar() {
  const { t } = useLanguage();

  return (
    <section className="py-6 md:py-8 bg-primary border-y border-accent/20">
      <div className="container">
        <div className="grid grid-cols-2 gap-x-2 gap-y-5 md:flex md:items-center md:justify-center md:gap-0">
          {TRUST_ITEMS.map((item, index) => {
            const content = (
              <>
                <item.icon className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-2xl md:text-3xl text-white leading-tight">
                    {item.value}
                  </span>
                  <span className="text-xs text-white/60 uppercase tracking-wider">
                    {t(item.en, item.he)}
                  </span>
                </div>
              </>
            );

            return (
              <div
                key={item.en}
                className="flex min-w-0 items-center justify-center md:justify-start"
              >
                {"href" in item ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center gap-2 px-2 text-white/90 transition-colors hover:text-white md:gap-3 md:px-10"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex min-w-0 items-center gap-2 px-2 text-white/90 md:gap-3 md:px-10">
                    {content}
                  </div>
                )}
                {index < TRUST_ITEMS.length - 1 && (
                  <div className="hidden md:block w-px h-10 bg-accent/25" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
