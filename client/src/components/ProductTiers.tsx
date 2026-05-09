import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { ArrowRight, MapPin, Clock, Users, MessageCircle } from "lucide-react";
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
  location: string;
  locationHe: string;
  groupSize: string;
  groupSizeHe: string;
  planningNote: string;
  planningNoteHe: string;
  badge?: string;
  badgeHe?: string;
  cta: string;
  ctaHe: string;
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
    bestFor: "Best if you want one strong adventure day",
    bestForHe: "מתאים ליום הרפתקה אחד חזק",
    subtitle:
      "Thailand's highest mountain direction with viewpoints, forest roads, waterfall stops, hotel pickup, and private pacing.",
    subtitleHe:
      "כיוון ההר הגבוה בתאילנד עם נקודות תצפית, דרכי יער, עצירות מים, איסוף מהמלון וקצב פרטי.",
    duration: "1 day",
    durationHe: "יום אחד",
    location: "Doi Inthanon",
    locationHe: "דוי אינתנון",
    groupSize: "Family or group",
    groupSizeHe: "משפחה או קבוצה",
    planningNote: "Adjusted for weather, road conditions, and group comfort.",
    planningNoteHe: "מותאם למזג אוויר, תנאי דרך ונוחות הקבוצה.",
    badge: "Popular day route",
    badgeHe: "מסלול יום פופולרי",
    cta: "Ask if Doi Inthanon fits my date",
    ctaHe: "בדיקת דוי אינתנון לתאריך שלי",
  },
  {
    slug: "chiang-rai-golden-triangle",
    href: "/packages/northern-thailand-3d2n",
    imageSrc: "nong_khiaw_river",
    eyebrow: "Chiang Rai mountain loop",
    eyebrowHe: "סיבוב הרים לכיוון צ׳אנג ראי",
    title: "Northern Thailand Mountain Loop",
    titleHe: "מסלול הרים בצפון תאילנד",
    bestFor: "Best for 2 to 3 days with more road time",
    bestForHe: "מתאים ל-2 עד 3 ימים עם יותר דרך",
    subtitle:
      "A private Chiang Mai to Chiang Rai direction with mountain roads, temples, village stops, hotels, meals, and pace confirmed before booking.",
    subtitleHe:
      "כיוון פרטי מצ׳אנג מאי לצ׳אנג ראי עם דרכי הרים, מקדשים, עצירות בכפרים, מלונות, ארוחות וקצב שמאושרים לפני הזמנה.",
    duration: "2 to 3 days",
    durationHe: "2 עד 3 ימים",
    location: "Chiang Rai direction",
    locationHe: "כיוון צ׳אנג ראי",
    groupSize: "Small private group",
    groupSizeHe: "קבוצה פרטית קטנה",
    planningNote: "Route, hotel, meals, and pace are confirmed before booking.",
    planningNoteHe: "מסלול, מלון, ארוחות וקצב נסיעה מאושרים לפני הזמנה.",
    cta: "Ask for 2 to 3 day route options",
    ctaHe: "בדיקת אפשרויות ל-2 עד 3 ימים",
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
    location: "Waterfalls + scenic roads",
    locationHe: "מפלים ודרכים נופיות",
    groupSize: "Kids welcome",
    groupSizeHe: "מתאים לילדים",
    planningNote: "Scenic 4x4, not a reckless off-road product.",
    planningNoteHe: "4x4 נופי, לא מוצר שטח מסוכן או פרוע.",
    cta: "Ask for a family-friendly route",
    ctaHe: "בקשת מסלול מתאים למשפחה",
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
      "Send your dates, group size, food needs, and travel style. WIRO shapes the private route before you pay.",
    subtitleHe:
      "שלחו תאריכים, מספר מטיילים, צרכי אוכל וסגנון טיול. WIRO מתאימה את המסלול לפני תשלום.",
    duration: "Built around you",
    durationHe: "נבנה סביבכם",
    location: "Northern Thailand",
    locationHe: "צפון תאילנד",
    groupSize: "Private group only",
    groupSizeHe: "קבוצה פרטית בלבד",
    planningNote:
      "Good for Hebrew support, kosher planning, older travelers, and multi-family groups.",
    planningNoteHe: "מתאים לעברית, תכנון כשר, מטיילים מבוגרים וכמה משפחות יחד.",
    cta: "Plan my private route on WhatsApp",
    ctaHe: "תכנון מסלול פרטי בוואטסאפ",
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
              "Start with one of these route styles, then send your dates and group size. WIRO confirms the route, pickup, meals, inclusions, and price before you book.",
              "התחילו מאחד מסגנונות המסלול, שלחו תאריכים ומספר מטיילים, ונחזור בוואטסאפ עם מסלול, איסוף, ארוחות ומחיר לפני הזמנה."
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
                <div className="mb-3">
                  <span className="type-caps inline-flex items-center rounded-sm border border-accent/25 bg-accent/10 px-3 py-1 text-[0.68rem] text-accent">
                    {t(route.bestFor, route.bestForHe)}
                  </span>
                </div>

                <p className="text-muted-foreground dark:text-white/60 text-[0.95rem] leading-[1.65] mb-4 flex-1">
                  {t(route.subtitle, route.subtitleHe)}
                </p>

                <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground dark:text-white/50">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {t(route.duration, route.durationHe)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {t(route.location, route.locationHe)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {t(route.groupSize, route.groupSizeHe)}
                  </span>
                </div>

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
                      {t("See route details", "פרטי המסלול")}
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
