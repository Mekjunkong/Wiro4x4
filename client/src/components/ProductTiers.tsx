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
    imageSrc: "nong_khiaw_river",
    title: "3 Days / 2 Nights",
    titleHe: "3 ימים / 2 לילות",
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
    startingPrice: "฿12,900",
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
      className="py-20 md:py-28 bg-background dark:bg-background"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-accent-cta dark:text-accent text-sm font-medium tracking-[0.2em] uppercase">
            {t("Choose Your Journey", "בחרו את המסע שלכם")}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-3 text-foreground dark:text-white">
            {t("Our Adventures", "ההרפתקאות שלנו")}
          </h2>
          <p className="text-muted-foreground dark:text-white/60 mt-4 max-w-2xl mx-auto text-lg">
            {t(
              "From single-day excursions to multi-week expeditions — find the perfect off-road adventure for your group.",
              "מטיולי יום ועד מסעות של מספר שבועות — מצאו את הרפתקת השטח המושלמת לקבוצה שלכם."
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {PRODUCT_TIERS.map(tier => (
            <Link key={tier.slug} href={tier.href}>
              <article className="group relative bg-white dark:bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer h-full flex flex-col">
                {/* Cinematic Image */}
                <div className="relative h-72 md:h-80 overflow-hidden">
                  <OptimizedImage
                    src={tier.imageSrc}
                    alt={t(tier.title, tier.titleHe)}
                    width={800}
                    height={600}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Badge */}
                  {tier.badge && (
                    <span className="absolute top-4 right-4 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wide uppercase shadow-lg">
                      {t(tier.badge, tier.badgeHe || tier.badge)}
                    </span>
                  )}

                  {/* Title + Price overlay on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-1">
                      {t(tier.title, tier.titleHe)}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-white/60 text-xs tracking-wide uppercase">
                        {t("From", "החל מ-")}
                      </span>
                      <span className="text-white text-2xl font-bold font-heading">
                        {tier.startingPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Slim Content Footer */}
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-muted-foreground dark:text-white/60 text-sm leading-relaxed mb-4 flex-1">
                    {t(tier.subtitle, tier.subtitleHe)}
                  </p>

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground dark:text-white/50">
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
