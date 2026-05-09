import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { ArrowRight, Clock, MessageCircle } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { COMPANY_WHATSAPP_URL } from "@/const";

interface RouteIdea {
  slug: string;
  href: string;
  imageSrc: string;
  eyebrow: string;
  eyebrowHe: string;
  title: string;
  titleHe: string;
  bestFor: string;
  bestForHe: string;
  subtitle: string;
  subtitleHe: string;
  duration: string;
  durationHe: string;
  terrain: string;
  terrainHe: string;
  groupFit: string;
  groupFitHe: string;
  planningNote: string;
  planningNoteHe: string;
  badge?: string;
  badgeHe?: string;
  cta: string;
  ctaHe: string;
  detailCta: string;
  detailCtaHe: string;
}

const ROUTE_IDEAS: RouteIdea[] = [
  {
    slug: "doi-inthanon-roof-of-thailand",
    href: "/tours/doi-inthanon-roof-of-thailand",
    imageSrc: "4x4_water_splash",
    eyebrow: "Doi Inthanon 4x4",
    eyebrowHe: "דוי אינתנון 4x4",
    title: "Doi Inthanon Private Day Route",
    titleHe: "מסלול פרטי לדוי אינתנון",
    bestFor: "Best for mountain views + one strong adventure day",
    bestForHe: "מתאים לנופי הרים ויום הרפתקה חזק",
    subtitle:
      "Thailand's highest mountain direction with viewpoints, forest roads, waterfall stops, and private pacing.",
    subtitleHe:
      "כיוון ההר הגבוה בתאילנד עם נקודות תצפית, דרכי יער, עצירות מים וקצב פרטי.",
    duration: "1 day",
    durationHe: "יום אחד",
    terrain: "Highest mountain, forest roads, viewpoints, waterfalls",
    terrainHe: "ההר הגבוה, דרכי יער, תצפיות ומפלים",
    groupFit: "Families, couples, private groups wanting a full scenic day",
    groupFitHe: "משפחות, זוגות וקבוצות פרטיות שרוצות יום נופי מלא",
    planningNote: "Adjusted for weather, road conditions, and group comfort.",
    planningNoteHe: "מותאם למזג אוויר, תנאי דרך ונוחות הקבוצה.",
    badge: "Popular day route",
    badgeHe: "מסלול יום פופולרי",
    cta: "Ask About This Route",
    ctaHe: "שאלו על המסלול הזה",
    detailCta: "See Doi Inthanon details",
    detailCtaHe: "פרטי דוי אינתנון",
  },
  {
    slug: "chiang-rai-golden-triangle",
    href: "/packages/northern-thailand-3d2n",
    imageSrc: "nong_khiaw_river",
    eyebrow: "Chiang Rai mountain loop",
    eyebrowHe: "סיבוב הרים לכיוון צ׳אנג ראי",
    title: "Northern Thailand Mountain Loop",
    titleHe: "מסלול הרים בצפון תאילנד",
    bestFor: "Best for a slower 2 to 3 day mountain loop",
    bestForHe: "מתאים לסיבוב הרים רגוע של 2 עד 3 ימים",
    subtitle:
      "A private Chiang Mai to Chiang Rai direction with mountain roads, temples, village stops, and overnight pacing.",
    subtitleHe:
      "כיוון פרטי מצ׳אנג מאי לצ׳אנג ראי עם דרכי הרים, מקדשים, עצירות בכפרים וקצב לינה רגוע.",
    duration: "2 to 3 days",
    durationHe: "2 עד 3 ימים",
    terrain: "Mountain roads, temples, villages, overnight pacing",
    terrainHe: "דרכי הרים, מקדשים, כפרים וקצב לינה",
    groupFit: "Small private groups with time for a slower loop",
    groupFitHe: "קבוצות פרטיות קטנות עם זמן לסיבוב רגוע",
    planningNote:
      "Good when you want scenery, road time, and fewer rushed stops.",
    planningNoteHe: "מתאים כשרוצים נופים, זמן דרך ופחות עצירות בלחץ.",
    cta: "Ask About This Route",
    ctaHe: "שאלו על המסלול הזה",
    detailCta: "See 3-day package",
    detailCtaHe: "פרטי חבילת 3 ימים",
  },
  {
    slug: "family-waterfall-adventure",
    href: "/tours",
    imageSrc: "single_cascade_waterfall",
    eyebrow: "Jungle waterfall 4x4",
    eyebrowHe: "מפלים וג׳יפים בצפון",
    title: "Family Waterfall Adventure Day",
    titleHe: "יום משפחתי עם מפלים ושטח",
    bestFor: "Best for families comparing ATV or combo tours",
    bestForHe: "מתאים למשפחות שמשוות ATV וטיולי קומבו",
    subtitle:
      "Adventure without the group-tour rush: private stops, comfort breaks, scenic 4x4 sections, and difficulty matched to your group.",
    subtitleHe:
      "הרפתקה בלי לחץ של טיול קבוצתי: עצירות פרטיות, הפסקות נוחות, קטעי 4x4 נופיים ורמת קושי לפי הקבוצה.",
    duration: "Flexible day",
    durationHe: "יום גמיש",
    terrain: "Waterfall stops, scenic roads, gentle 4x4 sections",
    terrainHe: "עצירות מפלים, דרכים נופיות וקטעי 4x4 רגועים",
    groupFit: "Families with kids; good ATV/combo-tour alternative",
    groupFitHe: "משפחות עם ילדים; חלופה ל-ATV או טיולי קומבו",
    planningNote: "Scenic 4x4, not a reckless off-road product.",
    planningNoteHe: "4x4 נופי, לא מוצר שטח מסוכן או פרוע.",
    cta: "Ask About This Route",
    ctaHe: "שאלו על המסלול הזה",
    detailCta: "Browse route options",
    detailCtaHe: "ראו אפשרויות מסלול",
  },
  {
    slug: "custom-private-route",
    href: "/contact",
    imageSrc: "vang_vieng_mountains",
    eyebrow: "Custom private route",
    eyebrowHe: "מסלול פרטי בהתאמה",
    title: "Custom Northern Thailand Route",
    titleHe: "מסלול פרטי בצפון תאילנד",
    bestFor: "Best when food, language, timing, or comfort matters",
    bestForHe: "מתאים כשאוכל, שפה, זמנים או נוחות חשובים",
    subtitle:
      "Send your dates, group size, food needs, and travel style. WIRO shapes the route around your group.",
    subtitleHe:
      "שלחו תאריכים, מספר מטיילים, צרכי אוכל וסגנון טיול. WIRO מתאימה את המסלול לקבוצה שלכם.",
    duration: "Built around you",
    durationHe: "נבנה סביבכם",
    terrain: "Northern Thailand routes shaped by dates and comfort",
    terrainHe: "מסלולים בצפון תאילנד לפי תאריכים ונוחות",
    groupFit:
      "Private groups needing Hebrew, kosher, timing, or comfort support",
    groupFitHe: "קבוצות פרטיות שצריכות עברית, כשרות, זמנים או נוחות",
    planningNote:
      "Good for Hebrew support, kosher planning, older travelers, and multi-family groups.",
    planningNoteHe: "מתאים לעברית, תכנון כשר, מטיילים מבוגרים וכמה משפחות יחד.",
    cta: "Ask About This Route",
    ctaHe: "שאלו על המסלול הזה",
    detailCta: "Start custom inquiry",
    detailCtaHe: "פתחו פנייה מותאמת",
  },
];

function buildRouteWhatsAppUrl(route: RouteIdea, language: "en" | "he") {
  const message =
    language === "he"
      ? `שלום WIRO, נשמח לבדוק זמינות ומחיר עבור ${route.titleHe}. תאריכים: ___ / מספר מטיילים: ___ / צורך באוכל כשר: ___`
      : `Hi WIRO, can you check availability and price for ${route.title}? Dates: ___ / Travelers: ___ / Food or kosher needs: ___`;

  return `${COMPANY_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

export function ProductTiers() {
  const { t, language } = useLanguage();

  return (
    <section
      id="tours"
      className="py-20 md:py-28 bg-background dark:bg-background"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 relative">
          <span className="type-label relative text-accent block mb-3">
            {t("Private route ideas", "רעיונות למסלול פרטי")}
          </span>
          <h2 className="type-headline relative mt-2 text-foreground dark:text-white">
            {t(
              "Choose the shape of your private 4x4 route",
              "בוחרים את סגנון המסלול, ואנחנו מתאימים אותו לקבוצה שלכם"
            )}
          </h2>
          <div className="w-16 h-[3px] bg-accent mx-auto mt-4 mb-5" />
          <p className="type-lede relative text-muted-foreground dark:text-white/60 mx-auto max-w-3xl">
            {t(
              "Start with a route style, then send your dates and group size. WIRO checks fit, availability, and price on WhatsApp before you book.",
              "התחילו מסגנון מסלול, שלחו תאריכים ומספר מטיילים, ונבדוק בוואטסאפ התאמה, זמינות ומחיר לפני הזמנה."
            )}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 lg:gap-7">
          {ROUTE_IDEAS.map(route => (
            <article
              key={route.slug}
              className="luxury-card group relative bg-card rounded-sm overflow-hidden h-full flex flex-col border border-border"
            >
              <Link href={route.href}>
                <div className="relative h-72 overflow-hidden cursor-pointer">
                  <OptimizedImage
                    src={route.imageSrc}
                    alt={t(
                      `${route.title} from Chiang Mai private 4x4 tour`,
                      `${route.titleHe} עם WIRO 4x4`
                    )}
                    width={800}
                    height={600}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/35 to-primary/10 transition-all duration-500 group-hover:from-primary/90 group-hover:via-primary/50" />

                  {route.badge && (
                    <span className="type-caps absolute top-4 right-4 rounded-sm border border-accent/45 bg-card/95 px-3 py-1.5 text-[0.68rem] text-primary shadow-lg">
                      {t(route.badge, route.badgeHe || route.badge)}
                    </span>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="type-caps mb-2 text-[0.68rem] text-accent">
                      {t(route.eyebrow, route.eyebrowHe)}
                    </p>
                    <h3 className="font-heading text-2xl md:text-3xl font-normal leading-[1.05] tracking-[-0.015em] text-white">
                      {t(route.title, route.titleHe)}
                    </h3>
                  </div>
                </div>
              </Link>

              <div className="p-5 flex-1 flex flex-col relative">
                <p className="text-muted-foreground dark:text-white/60 text-[0.95rem] leading-[1.65] mb-4 flex-1">
                  {t(route.subtitle, route.subtitleHe)}
                </p>

                <dl className="mb-4 grid gap-2 border-y border-border py-4 text-sm">
                  <div>
                    <dt className="type-caps flex items-center gap-1 text-[0.62rem] text-accent">
                      <Clock className="h-3.5 w-3.5" />
                      {t("Duration", "משך")}
                    </dt>
                    <dd className="mt-1 text-foreground dark:text-white">
                      {t(route.duration, route.durationHe)}
                    </dd>
                  </div>
                  <div>
                    <dt className="type-caps text-[0.62rem] text-accent">
                      {t("Best for", "מתאים ל")}
                    </dt>
                    <dd className="mt-1 text-foreground dark:text-white">
                      {t(route.bestFor, route.bestForHe)}
                    </dd>
                  </div>
                  <div>
                    <dt className="type-caps text-[0.62rem] text-accent">
                      {t("Scenery / terrain", "נוף / דרך")}
                    </dt>
                    <dd className="mt-1 text-muted-foreground dark:text-white/60">
                      {t(route.terrain, route.terrainHe)}
                    </dd>
                  </div>
                  <div>
                    <dt className="type-caps text-[0.62rem] text-accent">
                      {t("Group fit", "התאמה לקבוצה")}
                    </dt>
                    <dd className="mt-1 text-muted-foreground dark:text-white/60">
                      {t(route.groupFit, route.groupFitHe)}
                    </dd>
                  </div>
                </dl>

                <p className="mb-5 border border-border bg-background/70 px-3 py-2 text-sm leading-relaxed text-muted-foreground dark:text-white/60">
                  {t(route.planningNote, route.planningNoteHe)}
                </p>

                <div className="mt-auto flex flex-col gap-3">
                  <a
                    href={buildRouteWhatsAppUrl(route, language)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-accent-cta px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-accent-cta-hover"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t(route.cta, route.ctaHe)}
                  </a>
                  <Link href={route.href}>
                    <span className="inline-flex items-center justify-center gap-2 text-accent font-semibold text-sm transition-all group-hover:gap-3">
                      {t(route.detailCta, route.detailCtaHe)}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-accent w-0 group-hover:w-full transition-all duration-500 ease-out" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
