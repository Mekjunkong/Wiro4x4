import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { ArrowRight, MapPin, Clock, Users } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";

interface ProductTier {
  slug: string;
  href: string;
  imageSrc: string;
  title: string;
  titleHe: string;
  subtitle: string;
  subtitleHe: string;
  duration: string;
  durationHe: string;
  location: string;
  locationHe: string;
  groupSize: string;
  groupSizeHe: string;
  startingPrice: string;
  startingPriceHe: string;
  priceNote: string;
  priceNoteHe: string;
  badge?: string;
  badgeHe?: string;
}

const PRODUCT_TIERS: ProductTier[] = [
  {
    slug: "one-day",
    href: "/tours",
    imageSrc: "4x4_water_splash",
    title: "One-Day Adventures",
    titleHe: "טיולי יום",
    subtitle:
      "Six private off-road routes through Chiang Mai's mountains, waterfalls, and local villages.",
    subtitleHe:
      "חקרו את היעדים הטובים ביותר של צ'יאנג מאי ביום אחד עמוס פעילות. בחרו מ-6 מסלולי שטח ייחודיים.",
    duration: "Full Day",
    durationHe: "יום שלם",
    location: "Chiang Mai",
    locationHe: "צ'יאנג מאי",
    groupSize: "1-7 guests",
    groupSizeHe: "1-7 אורחים",
    startingPrice: "$81",
    startingPriceHe: "₪300",
    priceNote: "THB available on request",
    priceNoteHe: "מחיר ב-THB לפי בקשה",
  },
  {
    slug: "northern-thailand-3d2n",
    href: "/packages/northern-thailand-3d2n",
    imageSrc: "nong_khiaw_river",
    title: "3 Days / 2 Nights",
    titleHe: "3 ימים / 2 לילות",
    subtitle:
      "Three days across mountain roads, caves, temples, and quiet lodge stays.",
    subtitleHe:
      "הרפתקת הרים בצפון תאילנד דרך מערות צ'יאנג דאו, דוי אנג חאנג ומקדשי צ'יאנג ראי. לינה בלודג'ים בהרים.",
    duration: "3 Days",
    durationHe: "3 ימים",
    location: "Northern Thailand",
    locationHe: "צפון תאילנד",
    groupSize: "2-6 guests",
    groupSizeHe: "2-6 אורחים",
    startingPrice: "$361",
    startingPriceHe: "₪1,336",
    priceNote: "THB available on request",
    priceNoteHe: "מחיר ב-THB לפי בקשה",
    badge: "Popular",
    badgeHe: "פופולרי",
  },
  {
    slug: "grand-tour-laos-14d",
    href: "/packages/grand-tour-laos-14d",
    imageSrc: "vang_vieng_mountains",
    title: "14-Day Grand Tour",
    titleHe: "מסע גדול 14 ימים",
    subtitle:
      "Fourteen days by 4x4 across Northern Thailand and Laos, planned privately.",
    subtitleHe:
      "הרפתקת השטח האולטימטיבית מצ'יאנג מאי דרך צפון תאילנד ללאוס וחזרה. חציית גבולות ברכב 4x4.",
    duration: "14 Days",
    durationHe: "14 ימים",
    location: "Thailand + Laos",
    locationHe: "תאילנד + לאוס",
    groupSize: "2-4 guests",
    groupSizeHe: "2-4 אורחים",
    startingPrice: "$1,677",
    startingPriceHe: "₪6,205",
    priceNote: "THB available on request",
    priceNoteHe: "מחיר ב-THB לפי בקשה",
    badge: "Grand Adventure",
    badgeHe: "הרפתקה גדולה",
  },
];

export function ProductTiers() {
  const { t } = useLanguage();

  return (
    <section
      id="tours"
      className="py-20 md:py-28 bg-background dark:bg-background"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl md:mb-14">
          <h2 className="text-4xl font-heading font-medium tracking-tight text-foreground md:text-5xl">
            {t("Choose your way into the north", "בחרו את הדרך שלכם לצפון")}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t(
              "Start with one day, a mountain escape, or a private overland journey. We tailor the route after you choose.",
              "התחילו ביום אחד, בריחה להרים או מסע שטח פרטי. נתאים את המסלול אחרי שתבחרו."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-rows-2">
          {PRODUCT_TIERS.map((tier, index) => {
            const featured = index === 0;
            return (
              <Link
                key={tier.slug}
                href={tier.href}
                className={
                  featured ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5"
                }
              >
                <article className="luxury-card group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-sm border border-border/70 bg-card shadow-premium">
                  <div
                    className={`relative overflow-hidden ${featured ? "h-[32rem] md:h-[40rem] lg:h-full lg:min-h-[46rem]" : "h-64 lg:h-56"}`}
                  >
                    <OptimizedImage
                      src={tier.imageSrc}
                      alt={t(tier.title, tier.titleHe)}
                      width={800}
                      height={600}
                      sizes={
                        featured
                          ? "(max-width: 1024px) 100vw, 58vw"
                          : "(max-width: 1024px) 100vw, 42vw"
                      }
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${featured ? "from-primary via-primary/30 to-primary/5" : "from-primary/90 via-primary/30 to-transparent"}`}
                    />

                    <div
                      className={`absolute inset-x-0 bottom-0 ${featured ? "p-6 md:p-9" : "p-5"}`}
                    >
                      <h3
                        className={`font-heading font-medium text-white ${featured ? "text-3xl md:text-5xl" : "text-2xl"}`}
                      >
                        {t(tier.title, tier.titleHe)}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/65">
                          {t("from", "החל מ-")}
                        </span>
                        <span
                          className={`font-heading text-white ${featured ? "text-4xl" : "text-3xl"}`}
                        >
                          {t(tier.startingPrice, tier.startingPriceHe)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/65">
                        {t(tier.priceNote, tier.priceNoteHe)}
                      </p>
                      {featured && (
                        <>
                          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
                            {t(tier.subtitle, tier.subtitleHe)}
                          </p>
                          <TierMeta tier={tier} t={t} light />
                          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-white transition-all group-hover:gap-3">
                            {t("Explore day routes", "גלו מסלולי יום")}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {!featured && (
                    <div className="relative flex flex-1 flex-col p-5">
                      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                        {t(tier.subtitle, tier.subtitleHe)}
                      </p>
                      <TierMeta tier={tier} t={t} />
                      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-accent-readable transition-all group-hover:gap-3">
                        {t("View journey", "צפו במסע")}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  )}
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TierMeta({
  tier,
  t,
  light = false,
}: {
  tier: ProductTier;
  t: (en: string, he: string) => string;
  light?: boolean;
}) {
  return (
    <div
      className={`mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs ${light ? "text-white/70" : "text-muted-foreground"}`}
    >
      <span className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        {t(tier.duration, tier.durationHe)}
      </span>
      <span className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        {t(tier.location, tier.locationHe)}
      </span>
      <span className="flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5" aria-hidden="true" />
        {t(tier.groupSize, tier.groupSizeHe)}
      </span>
    </div>
  );
}
