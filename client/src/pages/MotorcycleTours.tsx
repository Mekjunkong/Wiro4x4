import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Gauge,
  MapPin,
  Route,
} from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { WiroRouteMap } from "@/components/wiro/WiroRouteMap";
import { MOTORCYCLE_PLACES, MOTORCYCLE_ROUTES } from "@/data/motorcycleRoutes";
import {
  MOTORCYCLE_HIGHLIGHTS as highlights,
  MOTORCYCLE_TOUR_OPTIONS as options,
  type TourOption,
} from "@shared/motorcycleTours";

export default function MotorcycleTours() {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<TourOption["id"]>("five");
  const active = options.find(option => option.id === selected) ?? options[1];
  const routeStops =
    active.id === "custom" ? MOTORCYCLE_PLACES : MOTORCYCLE_ROUTES[active.id];
  const requestMessage = t(
    `Hello WIRO! I want a motorcycle tour quotation. Selected option: ${active.title.en}. Please connect me with the Off Trail Thailand / Adventurer Moto Tours plan. Dates: __ Group size: __ Riding experience: __`,
    `שלום WIRO! אני רוצה הצעת מחיר לטיול אופנועים. האפשרות שנבחרה: ${active.title.he}. אשמח לפרטים על תכנית Off Trail Thailand / Adventurer Moto Tours. תאריכים: __ מספר רוכבים: __ ניסיון רכיבה: __`
  );
  usePageMeta({
    title: t(
      "Off Trail Thailand Motorcycle Tours",
      "טיולי אופנוע Off Trail Thailand"
    ),
    description: t(
      "Ride beyond borders from Chiang Mai through Mae Hong Son, Pai, Thaton and Chiang Rai with a three-day, five-day or custom motorcycle adventure.",
      "רכבו מעבר לגבולות מצ׳יאנג מאי דרך מאה הונג סון, פאי, תאטן וצ׳יאנג ראי בטיול אופנועים של 3 ימים, 5 ימים או במסלול אישי."
    ),
    canonicalPath: "/motorcycle-tours",
    ogImage:
      "https://www.wiro4x4indochina.com/images/optimized/motorcycle-touring-illustration.webp",
  });
  return (
    <>
      <Header />
      <main
        id="main-content"
        dir={language === "he" ? "rtl" : "ltr"}
        className="pt-28 pb-16"
      >
        <section className="container max-w-6xl">
          <p className="text-primary font-semibold mb-3">
            OFF TRAIL THAILAND · ADVENTURER MOTO TOURS
          </p>
          <h1 className="text-4xl md:text-6xl font-heading mb-5">
            {t("Ride Beyond Borders", "רוכבים מעבר לגבולות")}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl text-muted-foreground mb-8">
            {t(
              "Northern Thailand Motorcycle Adventure: Chiang Mai – Mae Hong Son – Pai – Thaton – Chiang Rai",
              "הרפתקת אופנועים בצפון תאילנד: צ׳יאנג מאי – מאה הונג סון – פאי – תאטן – צ׳יאנג ראי"
            )}
          </p>
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
            <img
              src="/images/optimized/motorcycle-touring-illustration.webp"
              alt={t(
                "Motorcycle adventure through Northern Thailand",
                "הרפתקת אופנועים בצפון תאילנד"
              )}
              className="w-full rounded-sm object-cover max-h-[480px]"
            />
            <div className="rounded-sm border border-accent/30 bg-muted p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-4">
                {t("Tour overview", "סקירת הטיול")}
              </h2>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <p className="flex gap-2">
                  <Clock3 className="size-4 text-primary shrink-0" />
                  {t(
                    "3 or 5 days, or build your own route",
                    "3 או 5 ימים, או מסלול אישי"
                  )}
                </p>
                <p className="flex gap-2">
                  <Route className="size-4 text-primary shrink-0" />
                  {t(
                    "100% paved roads · intermediate to experienced",
                    "כבישים סלולים · רמת ביניים עד מנוסים"
                  )}
                </p>
                <p className="flex gap-2">
                  <Gauge className="size-4 text-primary shrink-0" />
                  {t(
                    "Honda CB500X or Honda NX500",
                    "Honda CB500X או Honda NX500"
                  )}
                </p>
                <p className="flex gap-2">
                  <MapPin className="size-4 text-primary shrink-0" />
                  {t(
                    "Start and finish in Chiang Mai",
                    "התחלה וסיום בצ׳יאנג מאי"
                  )}
                </p>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                {t(
                  "Carefully crafted by the Off Trail Thailand team, with more than 2,500 curves, mountain landscapes, remote villages and authentic Northern Thai hospitality.",
                  "נבנה בקפידה על ידי צוות Off Trail Thailand, עם יותר מ-2,500 פניות, נופי הרים, כפרים מרוחקים ואירוח צפוני אותנטי."
                )}
              </p>
              <a
                href="https://www.offtrailthailand.com"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-primary underline"
              >
                www.OffTrailThailand.com
              </a>
            </div>
          </div>
        </section>
        <section
          className="container max-w-6xl mt-16"
          aria-labelledby="local-guides-heading"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              {t("WIRO local route guides", "מדריכי המסלולים המקומיים של WIRO")}
            </p>
            <h2
              id="local-guides-heading"
              className="mt-2 text-3xl font-heading md:text-4xl"
            >
              {t(
                "Understand the road before you choose",
                "מכירים את הדרך לפני שבוחרים"
              )}
            </h2>
          </div>
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {[
              {
                href: "/motorcycle-tours/samoeng-loop",
                image: "/images/optimized/samoeng_valley.webp",
                alt: t(
                  "Green mountain valley along the Samoeng Loop",
                  "עמק הררי ירוק לאורך לולאת סמואנג"
                ),
                title: t("Samoeng Loop", "לולאת סמואנג"),
                description: t(
                  "A one-day mountain circuit with WIRO’s complete Google Maps route and 38 saved places.",
                  "מסלול הררי ליום אחד עם מסלול Google Maps המלא של WIRO ו-38 מקומות שמורים."
                ),
                meta: t("1 day · Motorcycle", "יום אחד · אופנוע"),
                cta: t("Explore Samoeng", "גלו את סמואנג"),
              },
              {
                href: "/motorcycle-tours/mae-hong-son-loop",
                image: "/images/optimized/motorcycle-touring-illustration.webp",
                alt: t(
                  "Motorcycles on a mountain road in Northern Thailand",
                  "אופנועים בדרך הררית בצפון תאילנד"
                ),
                title: t("Mae Hong Son Loop", "לולאת מאה הונג סון"),
                description: t(
                  "A cinematic expedition atlas with 4, 5 and 6-day ideas, stage maps and curated local highlights.",
                  "אטלס מסע קולנועי עם רעיונות ל-4, 5 ו-6 ימים, מפות לפי מקטע ונקודות עניין מקומיות."
                ),
                meta: t(
                  "4–6 days · Motorcycle or 4x4",
                  "4–6 ימים · אופנוע או 4x4"
                ),
                cta: t("Explore Mae Hong Son", "גלו את מאה הונג סון"),
              },
            ].map(guide => (
              <article
                key={guide.href}
                className="group overflow-hidden rounded-sm border border-accent/35 bg-muted"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={guide.image}
                    alt={guide.alt}
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0b2a22]/75 via-transparent to-transparent"
                    aria-hidden="true"
                  />
                  <span className="absolute bottom-4 start-4 text-xs font-bold uppercase tracking-[0.13em] text-white">
                    {guide.meta}
                  </span>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-3xl font-heading">{guide.title}</h3>
                  <p className="mt-3 min-h-[4.5rem] leading-relaxed text-muted-foreground">
                    {guide.description}
                  </p>
                  <Link
                    href={guide.href}
                    className="mt-6 inline-flex min-h-12 items-center justify-center rounded-sm bg-primary px-5 py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    {guide.cta}
                    <ArrowUpRight className="ms-2 size-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          className="container max-w-6xl mt-16"
          aria-labelledby="motorcycle-options-heading"
        >
          <h2
            id="motorcycle-options-heading"
            className="text-3xl font-heading mb-3"
          >
            {t("Choose your adventure", "בחרו את ההרפתקה שלכם")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t(
              "Select an option to see the route details before you ask WIRO for a personal quotation.",
              "בחרו אפשרות כדי לראות את פרטי המסלול לפני שתבקשו מ-WIRO הצעת מחיר אישית."
            )}
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {options.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelected(option.id)}
                className={`text-start rounded-sm border p-5 transition-colors ${selected === option.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`}
                aria-pressed={selected === option.id}
              >
                <span className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  {option.id === "five"
                    ? t("Signature route", "המסלול המרכזי")
                    : option.id === "three"
                      ? t("Classic loop", "לולאה קלאסית")
                      : t("Personal route", "מסלול אישי")}
                </span>
                <span className="mt-2 block text-xl font-semibold">
                  {t(option.title.en, option.title.he)}
                </span>
                <span className="mt-3 block text-sm opacity-85">
                  {t(option.summary.en, option.summary.he)}
                </span>
                <span className="mt-4 block text-xs font-medium opacity-75">
                  {t(option.meta.en, option.meta.he)}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              {t("Route", "מסלול")}
            </p>
            <h3 className="mt-2 mb-5 text-3xl font-heading md:text-4xl">
              {active.id === "custom"
                ? t("Where your route can go", "לאן המסלול שלכם יכול להגיע")
                : t("Your route from Chiang Mai", "המסלול שלכם מצ׳יאנג מאי")}
            </h3>
            <WiroRouteMap
              stops={routeStops}
              loop={active.id !== "custom"}
              className="wx-mapbox--loop"
              label={t(
                `Route map for ${active.title.en}`,
                `מפת המסלול של ${active.title.he}`
              )}
            />
          </div>
          <article className="mt-6 rounded-sm border border-accent/30 bg-muted p-6 md:p-8">
            <h3 className="text-2xl font-semibold">
              {t(active.title.en, active.title.he)}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {t(active.summary.en, active.summary.he)}
            </p>
            <ul className="mt-6 grid gap-4">
              {active.details.map(detail => (
                <li
                  key={detail.en}
                  className="flex gap-3 text-sm leading-relaxed"
                >
                  <Check className="size-5 text-primary shrink-0 mt-0.5" />
                  {t(detail.en, detail.he)}
                </li>
              ))}
            </ul>
          </article>
        </section>
        <section className="container max-w-6xl mt-16 grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-heading mb-5">
              {t("Tour highlights", "עיקרי הטיול")}
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {highlights.map(item => (
                <li key={item.en} className="flex gap-2 text-sm">
                  <Check className="size-4 text-primary shrink-0 mt-0.5" />
                  {t(item.en, item.he)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-sm border border-accent/30 bg-primary text-primary-foreground p-6 md:p-8">
            <h2 className="text-2xl font-semibold">
              {t("Request your quotation", "בקשו הצעת מחיר")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/85">
              {t(
                "Every trip is quoted personally. Group size, dates, route, motorcycle, hotels, support and experiences can change what your journey needs.",
                "לכל טיול ניתנת הצעת מחיר אישית. גודל הקבוצה, התאריכים, המסלול, האופנוע, המלונות, התמיכה והחוויות יכולים להשפיע על צורכי הטיול."
              )}
            </p>
            <p className="mt-3 text-sm text-white/85">
              {t(
                "Send us your details and we’ll confirm availability and the final price personally. We usually reply within one business day.",
                "שלחו לנו את הפרטים שלכם ונאשר איתכם אישית את הזמינות ואת המחיר הסופי. בדרך כלל אנחנו משיבים תוך יום עסקים אחד."
              )}
            </p>
            <TrackedWhatsAppLink
              sourceCode={
                language === "he"
                  ? "MOTORCYCLE-CONTACT-HE"
                  : "MOTORCYCLE-CONTACT-EN"
              }
              humanMessage={requestMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-[#25D366] px-5 py-3 text-sm font-bold text-white hover:bg-[#20BA5A]"
            >
              {t(
                "Ask WIRO for availability and a quotation",
                "בקשו מ-WIRO זמינות והצעת מחיר"
              )}
              <ChevronDown
                className="ms-2 size-4 -rotate-90"
                aria-hidden="true"
              />
            </TrackedWhatsAppLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
