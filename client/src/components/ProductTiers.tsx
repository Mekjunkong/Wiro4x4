import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { ArrowRight, MapPin, Clock, Users } from "lucide-react";

interface ProductTier {
  slug: string;
  href: string;
  image: { webp: string; jpg: string };
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
  badge?: string;
  badgeHe?: string;
}

const PRODUCT_TIERS: ProductTier[] = [
  {
    slug: "one-day",
    href: "/tours",
    image: {
      webp: "/images/optimized/4x4_water_splash.webp",
      jpg: "/images/optimized/4x4_water_splash.jpg",
    },
    title: "One-Day Adventures",
    titleHe: "טיולי יום",
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
    startingPrice: "฿2,900",
  },
  {
    slug: "northern-thailand-3d2n",
    href: "/packages/northern-thailand-3d2n",
    image: {
      webp: "/images/optimized/mountain_peak_sunrise_golden.webp",
      jpg: "/images/optimized/mountain_peak_sunrise_golden.jpg",
    },
    title: "3 Days / 2 Nights",
    titleHe: "3 ימים / 2 לילות",
    subtitle:
      "Northern Thailand mountain loop through Chiang Dao, Mae Salong, and Mae Hong Son. Overnight stays in mountain lodges.",
    subtitleHe:
      "לולאת הרים בצפון תאילנד דרך צ'יאנג דאו, מאה סאלונג ומאה הונג סון. לינה בלודג'ים בהרים.",
    duration: "3 Days",
    durationHe: "3 ימים",
    location: "Northern Thailand",
    locationHe: "צפון תאילנד",
    groupSize: "2–6 guests",
    groupSizeHe: "2–6 אורחים",
    startingPrice: "฿12,900",
    badge: "Popular",
    badgeHe: "פופולרי",
  },
  {
    slug: "grand-tour-laos-14d",
    href: "/packages/grand-tour-laos-14d",
    image: {
      webp: "/images/optimized/pickup_truck_dirt_road_mountains.webp",
      jpg: "/images/optimized/pickup_truck_dirt_road_mountains.jpg",
    },
    title: "14-Day Grand Tour",
    titleHe: "מסע גדול 14 ימים",
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
    startingPrice: "฿59,900",
    badge: "Grand Adventure",
    badgeHe: "הרפתקה גדולה",
  },
];

export function ProductTiers() {
  const { t } = useLanguage();

  return (
    <section
      id="tours"
      className="py-20 md:py-28 bg-[#faf7f2] dark:bg-[#1a1a1a]"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[#d4af37] text-sm font-medium tracking-[0.2em] uppercase">
            {t("Choose Your Journey", "בחרו את המסע שלכם")}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-3 text-[#1c1c1c] dark:text-white">
            {t("Our Adventures", "ההרפתקאות שלנו")}
          </h2>
          <p className="text-[#1c1c1c]/60 dark:text-white/60 mt-4 max-w-2xl mx-auto text-lg">
            {t(
              "From single-day excursions to multi-week expeditions — find the perfect off-road adventure for your group.",
              "מטיולי יום ועד מסעות של מספר שבועות — מצאו את הרפתקת השטח המושלמת לקבוצה שלכם."
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {PRODUCT_TIERS.map(tier => (
            <Link key={tier.slug} href={tier.href}>
              <article className="group relative bg-white dark:bg-[#242424] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col">
                {/* Image */}
                <div className="relative h-56 md:h-64 overflow-hidden">
                  <picture>
                    <source srcSet={tier.image.webp} type="image/webp" />
                    <img
                      src={tier.image.jpg}
                      alt={t(tier.title, tier.titleHe)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Badge */}
                  {tier.badge && (
                    <span className="absolute top-4 right-4 bg-[#d4af37] text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wide uppercase">
                      {t(tier.badge, tier.badgeHe || tier.badge)}
                    </span>
                  )}

                  {/* Price overlay */}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-white/70 text-xs tracking-wide uppercase">
                      {t("From", "החל מ-")}
                    </span>
                    <div className="text-white text-2xl font-bold font-heading">
                      {tier.startingPrice}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl md:text-2xl font-heading font-bold text-[#1c1c1c] dark:text-white mb-2">
                    {t(tier.title, tier.titleHe)}
                  </h3>
                  <p className="text-[#1c1c1c]/60 dark:text-white/60 text-sm leading-relaxed mb-5 flex-1">
                    {t(tier.subtitle, tier.subtitleHe)}
                  </p>

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-3 mb-5 text-xs text-[#1c1c1c]/50 dark:text-white/50">
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
                  <div className="flex items-center gap-2 text-[#d4af37] font-semibold text-sm group-hover:gap-3 transition-all">
                    {t("Explore", "גלו עוד")}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
