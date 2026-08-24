import { Languages, MessageCircle, Star, Utensils } from "lucide-react";
import { COMPANY_TRIPADVISOR_URL } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";

const TRUST_ITEMS = [
  {
    icon: Star,
    value: "Real guests",
    en: "Public Tripadvisor reviews",
    he: "ביקורות ציבוריות",
    href: COMPANY_TRIPADVISOR_URL,
  },
  {
    icon: MessageCircle,
    value: "Private route",
    en: "Planned around your group",
    he: "תכנון טיול פרטי",
  },
  {
    icon: Languages,
    value: "עברית",
    en: "Hebrew planning available",
    he: "דוברי עברית",
  },
  {
    icon: Utensils,
    value: "Food + Shabbat",
    en: "Discussed before confirmation",
    he: "תיאום ארוחות",
  },
] as const;

export function TrustBar() {
  const { t } = useLanguage();

  return (
    <section className="wiro-trust-bar bg-primary border-y border-accent/20">
      <div className="container">
        <div className="grid grid-cols-2 gap-x-2 gap-y-5 md:flex md:items-center md:justify-center md:gap-0">
          {TRUST_ITEMS.map((item, index) => {
            const content = (
              <>
                <item.icon className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-base md:text-lg text-white leading-tight">
                    {item.value}
                  </span>
                  <span className="text-[0.68rem] leading-tight text-white/60">
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
