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
  bestFor: string;
  bestForHe: string;
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
  cta: string;
  ctaHe: string;
}

const PRODUCT_TIERS: ProductTier[] = [
  {
    slug: "one-day",
    href: "/tours",
    imageSrc: "4x4_water_splash",
    title: "One-Day Adventures",
    titleHe: "טיולי יום",
    bestFor: "Best for first-time visitors",
    bestForHe: "מתאים למבקרים בפעם הראשונה",
    subtitle:
      "Explore Chiang Mai's best destinations in a single action-packed day. Choose from 6 unique off-road routes.",
    subtitleHe:
      "חקרו את היעדים הטובים ביותר של צ'יאנג מאי ביום אחד עמוס פעילות. בחרו מ-6 מסלולי שטח ייחודיים.",
    duration: "Full Day",
    durationHe: "יום שלם",
    location: "Chiang Mai",
    locationHe: "צ'יאנג מאי",
    groupSize: "1–7 guests",
    groupSizeHe: "1–7 אורחים",
    startingPrice: "$81",
    startingPriceHe: "₪300",
    priceNote: "THB available on request",
    priceNoteHe: "מחיר ב-THB לפי בקשה",
    cta: "View day trips",
    ctaHe: "למסלולי יום",
  },
  {
    slug: "northern-thailand-3d2n",
    href: "/packages/northern-thailand-3d2n",
    imageSrc: "nong_khiaw_river",
    title: "3 Days / 2 Nights",
    titleHe: "3 ימים / 2 לילות",
    bestFor: "Best for families who want one curated route",
    bestForHe: "מתאים למשפחות שרוצות מסלול מתוכנן",
    subtitle:
      "Northern Thailand mountain adventure through Chiang Dao caves, Doi Ang Khang, and Chiang Rai temples. Mountain lodge stays.",
    subtitleHe:
      "הרפתקת הרים בצפון תאילנד דרך מערות צ'יאנג דאו, דוי אנג חאנג ומקדשי צ'יאנג ראי. לינה בלודג'ים בהרים.",
    duration: "3 Days",
    durationHe: "3 ימים",
    location: "Northern Thailand",
    locationHe: "צפון תאילנד",
    groupSize: "2–6 guests",
    groupSizeHe: "2–6 אורחים",
    startingPrice: "$361",
    startingPriceHe: "₪1,336",
    priceNote: "THB available on request",
    priceNoteHe: "מחיר ב-THB לפי בקשה",
    badge: "Popular",
    badgeHe: "פופולרי",
    cta: "See 3-day package",
    ctaHe: "לחבילת 3 ימים",
  },
  {
    slug: "grand-tour-laos-14d",
    href: "/packages/grand-tour-laos-14d",
    imageSrc: "vang_vieng_mountains",
    title: "14-Day Grand Tour",
    titleHe: "מסע גדול 14 ימים",
    bestFor: "Best for the full expedition crew",
    bestForHe: "מתאים למי שרוצה מסע מלא",
    subtitle:
      "The ultimate overland adventure from Chiang Mai through Northern Thailand to Laos and back. Cross borders by 4x4.",
    subtitleHe:
      "הרפתקת השטח האולטימטיבית מצ'יאנג מאי דרך צפון תאילנד ללאוס וחזרה. חציית גבולות ברכב 4x4.",
    duration: "14 Days",
    durationHe: "14 ימים",
    location: "Thailand + Laos",
    locationHe: "תאילנד + לאוס",
    groupSize: "2–4 guests",
    groupSizeHe: "2–4 אורחים",
    startingPrice: "$1,677",
    startingPriceHe: "₪6,205",
    priceNote: "THB available on request",
    priceNoteHe: "מחיר ב-THB לפי בקשה",
    badge: "Grand Adventure",
    badgeHe: "הרפתקה גדולה",
    cta: "Plan grand tour",
    ctaHe: "לתכנן מסע גדול",
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
        {/* Premium section heading */}
        <div className="text-center mb-12 md:mb-16 relative">
          <span className="relative text-accent text-xs font-bold tracking-[0.3em] uppercase block mb-3">
            {t("Choose Your Journey", "בחרו את המסע שלכם")}
          </span>
          <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-heading font-bold mt-2 text-foreground dark:text-white tracking-tight">
            {t("Our Adventures", "ההרפתקאות שלנו")}
          </h2>
          <div className="w-16 h-[3px] bg-accent mx-auto mt-4 mb-5" />
          <p className="relative text-muted-foreground dark:text-white/60 max-w-2xl mx-auto text-lg">
            {t(
              "Choose the route that matches your group, pace, and budget in a few seconds.",
              "בחרו את המסלול שמתאים לקבוצה, לקצב ולתקציב שלכם בתוך כמה שניות."
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {PRODUCT_TIERS.map(tier => (
            <Link key={tier.slug} href={tier.href}>
              <article className="luxury-card group relative bg-card rounded-sm overflow-hidden cursor-pointer h-full flex flex-col border border-border">
                {/* Cinematic Image — taller */}
                <div className="relative h-80 md:h-96 overflow-hidden">
                  <OptimizedImage
                    src={tier.imageSrc}
                    alt={t(tier.title, tier.titleHe)}
                    width={800}
                    height={600}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                  />
                  {/* Dark gradient — stronger on hover to reveal text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-primary/10 transition-all duration-500 group-hover:from-primary/90 group-hover:via-primary/50" />

                  {/* Badge — gold foil */}
                  {tier.badge && (
                    <span
                      className="absolute top-4 right-4 text-[#1c1c1c] text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #f5d76e 0%, #d4af37 40%, #b8960f 100%)",
                      }}
                    >
                      {t(tier.badge, tier.badgeHe || tier.badge)}
                    </span>
                  )}

                  {/* Title + Price overlay on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-2">
                      {t(tier.title, tier.titleHe)}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white/60 text-xs tracking-widest uppercase block">
                        {t("from", "החל מ-")}
                      </span>
                      <span className="text-white text-3xl font-bold font-heading ml-1">
                        {t(tier.startingPrice, tier.startingPriceHe)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-white/65">
                      {t(tier.priceNote, tier.priceNoteHe)}
                    </p>
                  </div>
                </div>

                {/* Content Footer */}
                <div className="p-5 flex-1 flex flex-col relative">
                  <div className="mb-3">
                    <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                      {t(tier.bestFor, tier.bestForHe)}
                    </span>
                  </div>

                  <p className="text-muted-foreground dark:text-white/60 text-sm leading-relaxed mb-4 flex-1">
                    {t(tier.subtitle, tier.subtitleHe)}
                  </p>

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-3 mb-5 text-xs text-muted-foreground dark:text-white/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t(tier.duration, tier.durationHe)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {t(tier.location, tier.locationHe)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {t(tier.groupSize, tier.groupSizeHe)}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-accent font-semibold text-sm group-hover:gap-3 transition-all">
                    {t(tier.cta, tier.ctaHe)}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>

                  {/* Gold bottom border that expands on hover */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-accent w-0 group-hover:w-full transition-all duration-500 ease-out" />
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
