import { useState } from "react";
import {
  ArrowUpRight,
  Bike,
  Check,
  CircleAlert,
  Clock3,
  Coffee,
  Compass,
  ExternalLink,
  Landmark,
  Leaf,
  Map,
  MapPin,
  MessageCircle,
  Mountain,
  PawPrint,
  Route,
} from "lucide-react";

import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SamoengMapOverview } from "@/components/SamoengMapOverview";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  SAMOENG_CATEGORIES,
  SAMOENG_MY_MAPS_EMBED_URL,
  SAMOENG_ROUTE_STAGES,
  SAMOENG_ROUTE_URL,
  SAMOENG_SAVED_PLACES_URL,
  buildGoogleMapsSearchUrl,
  filterSamoengAttractions,
  type SamoengCategory,
} from "@/data/samoengLoop";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trackEvent } from "@/lib/analytics";

type FilterId = "all" | SamoengCategory;

const categoryIcons = {
  nature: Leaf,
  views: Mountain,
  culture: Landmark,
  adventure: Compass,
  family: PawPrint,
  food: Coffee,
} satisfies Record<SamoengCategory, typeof Leaf>;

export default function SamoengLoopGuide() {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<FilterId>("all");
  const visibleAttractions = filterSamoengAttractions(activeCategory);
  const whatsAppMessage = t(
    "Hi WIRO! I’m planning the Samoeng Loop by motorcycle. Date: __ Riders: __ Riding experience: __ I’d like help with: motorcycle rental / guide / support vehicle / route planning.",
    "שלום WIRO! אני מתכנן/ת לרכוב את לולאת סמואנג באופנוע. תאריך: __ מספר רוכבים: __ ניסיון רכיבה: __ אשמח לעזרה עם: השכרת אופנוע / מדריך / רכב ליווי / תכנון מסלול."
  );

  const pageTitle = t(
    "Samoeng Loop Motorcycle Route Guide",
    "מדריך אופנועים ללולאת סמואנג"
  );
  const pageDescription = t(
    "Open the complete Samoeng Loop motorcycle route from Chiang Mai and explore WIRO’s curated waterfalls, viewpoints, temples, activities and cafe stops.",
    "פתחו את מסלול האופנוע המלא של לולאת סמואנג מצ׳יאנג מאי וגלו מפלים, תצפיות, מקדשים, אטרקציות ובתי קפה שבחר צוות WIRO."
  );

  usePageMeta({
    title: pageTitle,
    description: pageDescription,
    canonicalPath: "/motorcycle-tours/samoeng-loop",
    language,
    ogImage:
      "https://www.wiro4x4indochina.com/images/optimized/samoeng_valley.webp",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id":
        "https://www.wiro4x4indochina.com/motorcycle-tours/samoeng-loop#webpage",
      url: "https://www.wiro4x4indochina.com/motorcycle-tours/samoeng-loop",
      name: pageTitle,
      description: pageDescription,
      isPartOf: {
        "@id": "https://www.wiro4x4indochina.com/#website",
      },
      about: {
        "@type": "Place",
        name: "Samoeng Loop, Chiang Mai",
      },
      inLanguage: language,
    },
  });

  const trackMapOpen = (placement: string, attractionId?: string) => {
    trackEvent("map_open", {
      page: "/motorcycle-tours/samoeng-loop",
      placement,
      language,
      ...(attractionId ? { tour: attractionId } : {}),
    });
  };

  return (
    <>
      <Header />
      <main id="main-content" dir={language === "he" ? "rtl" : "ltr"}>
        <Breadcrumb
          items={[
            {
              label: t("Motorcycle tours", "טיולי אופנועים"),
              href: "/motorcycle-tours",
            },
            { label: t("Samoeng Loop", "לולאת סמואנג") },
          ]}
        />

        <section className="container max-w-6xl pb-16 pt-5 md:pb-20">
          <div className="grid items-stretch gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:gap-0">
            <div className="relative order-2 min-h-[280px] overflow-hidden rounded-sm lg:order-1 lg:min-h-[560px] lg:rounded-e-none">
              <img
                src="/images/optimized/samoeng_valley.webp"
                alt={t(
                  "Green mountain valley along the Samoeng Loop near Chiang Mai",
                  "עמק הררי ירוק לאורך לולאת סמואנג ליד צ׳יאנג מאי"
                )}
                width={1600}
                height={1067}
                loading="eager"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,42,34,0.04)_25%,rgba(11,42,34,0.78)_100%)]"
                aria-hidden="true"
              />
              <p className="absolute inset-x-5 bottom-5 max-w-md text-sm leading-relaxed text-[#f8f5ec] md:inset-x-7 md:bottom-7">
                {t(
                  "A full-day mountain circuit when you allow time for stops, food and changing road conditions.",
                  "מסלול הררי ליום מלא כשמשאירים זמן לעצירות, אוכל ותנאי דרך משתנים."
                )}
              </p>
            </div>

            <div className="order-1 flex flex-col justify-center rounded-sm border border-border bg-card px-6 py-8 md:px-10 md:py-12 lg:order-2 lg:rounded-s-none lg:border-s-0">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                {t("WIRO local route guide", "מדריך מסלול מקומי של WIRO")}
              </p>
              <h1 className="mt-4 text-4xl font-heading leading-[1.04] md:text-6xl">
                {t("Ride the Samoeng Loop", "רוכבים בלולאת סמואנג")}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {t(
                  "A paved mountain loop from Chiang Mai with waterfalls, gardens, temples, cafes and long stretches of winding road. Choose your stops, then open the complete course in Google Maps.",
                  "לולאה הררית סלולה מצ׳יאנג מאי עם מפלים, גנים, מקדשים, בתי קפה וקטעים ארוכים של כביש מפותל. בחרו את העצירות ואז פתחו את המסלול המלא ב-Google Maps."
                )}
              </p>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-y border-border py-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Route className="size-4 text-primary" aria-hidden="true" />
                  {t("About 130 km", "כ-130 ק״מ")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4 text-primary" aria-hidden="true" />
                  {t("About 3 hr 40 min riding", "כ-3 שעות ו-40 דקות רכיבה")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-primary" aria-hidden="true" />
                  {t(
                    "Start and finish in Chiang Mai",
                    "התחלה וסיום בצ׳יאנג מאי"
                  )}
                </span>
              </div>

              <a
                href={SAMOENG_ROUTE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackMapOpen("full-route")}
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-primary px-5 py-3 text-center font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <Map className="me-2 size-5" aria-hidden="true" />
                {t(
                  "Open the full route in Google Maps",
                  "פתחו את המסלול המלא ב-Google Maps"
                )}
                <ArrowUpRight className="ms-2 size-4" aria-hidden="true" />
              </a>
              <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                {t(
                  "Opens the complete course supplied by WIRO. Google Maps may adjust time for live traffic.",
                  "פותח את המסלול המלא שסיפק WIRO. זמן הנסיעה עשוי להשתנות ב-Google Maps לפי התנועה."
                )}
              </p>
            </div>
          </div>
        </section>

        <SamoengMapOverview
          embedUrl={SAMOENG_MY_MAPS_EMBED_URL}
          routeUrl={SAMOENG_ROUTE_URL}
          onMapFocus={() => trackMapOpen("overview-map")}
          onRouteOpen={() => trackMapOpen("overview-full-route")}
        />

        <section
          className="border-y border-border bg-muted/70 py-14 md:py-18"
          aria-labelledby="route-shape-heading"
        >
          <div className="container max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                {t("The course", "מהלך המסלול")}
              </p>
              <h2
                id="route-shape-heading"
                className="mt-2 text-3xl font-heading md:text-4xl"
              >
                {t("Four chapters around the mountain", "ארבעה פרקים סביב ההר")}
              </h2>
            </div>

            <ol className="relative mt-9 grid gap-0 md:grid-cols-4">
              {SAMOENG_ROUTE_STAGES.map((stage, index) => (
                <li
                  key={stage.name.en}
                  className="relative border-s border-accent/45 pb-8 ps-8 last:pb-0 md:border-s-0 md:border-t md:pb-0 md:pe-7 md:ps-0 md:pt-8"
                >
                  <span className="absolute -start-[0.7rem] top-0 flex size-[1.4rem] items-center justify-center rounded-full bg-primary text-[0.65rem] font-bold text-primary-foreground md:-top-[0.7rem] md:start-0">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold">
                    {t(stage.name.en, stage.name.he)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(stage.description.en, stage.description.he)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="stops"
          className="container max-w-6xl py-16 md:py-20"
          aria-labelledby="stops-heading"
        >
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                {t("Build your day", "בנו את היום שלכם")}
              </p>
              <h2
                id="stops-heading"
                className="mt-2 text-3xl font-heading md:text-4xl"
              >
                {t("Choose stops by mood", "בחרו עצירות לפי הסגנון")}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t(
                  "You do not need to visit everything. Pick two or three stops that fit your pace and leave room for the mountain road itself.",
                  "לא צריך לבקר בכל מקום. בחרו שתיים או שלוש עצירות שמתאימות לקצב שלכם והשאירו זמן לכביש ההררי עצמו."
                )}
              </p>

              <div
                className="mt-7 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible"
                aria-label={t("Filter attractions", "סינון אטרקציות")}
              >
                {SAMOENG_CATEGORIES.map(category => {
                  const count = filterSamoengAttractions(category.id).length;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={activeCategory === category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`inline-flex min-h-11 shrink-0 items-center justify-between gap-3 rounded-sm border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                        activeCategory === category.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary"
                      }`}
                    >
                      <span>{t(category.label.en, category.label.he)}</span>
                      <span className="text-xs opacity-70">{count}</span>
                    </button>
                  );
                })}
              </div>

              <a
                href={SAMOENG_SAVED_PLACES_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackMapOpen("saved-list")}
                className="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-primary underline decoration-accent decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {t(
                  "See all 38 saved places in Google Maps",
                  "ראו את כל 38 המקומות השמורים ב-Google Maps"
                )}
                <ExternalLink className="ms-2 size-4" aria-hidden="true" />
              </a>
            </div>

            <div className="min-w-0">
              <p
                className="mb-3 text-sm text-muted-foreground"
                aria-live="polite"
              >
                {t(
                  `Showing ${visibleAttractions.length} curated stops`,
                  `מוצגות ${visibleAttractions.length} עצירות נבחרות`
                )}
              </p>
              <ul className="overflow-hidden rounded-sm border border-border bg-card">
                {visibleAttractions.map(attraction => {
                  const Icon = categoryIcons[attraction.category];
                  const category = SAMOENG_CATEGORIES.find(
                    item => item.id === attraction.category
                  );
                  return (
                    <li
                      key={attraction.id}
                      className="grid gap-4 border-b border-border p-5 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center md:p-6"
                    >
                      <div className="min-w-0">
                        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                          <Icon className="size-4" aria-hidden="true" />
                          {category
                            ? t(category.label.en, category.label.he)
                            : null}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold [overflow-wrap:anywhere]">
                          {attraction.name}
                        </h3>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                          {t(
                            attraction.description.en,
                            attraction.description.he
                          )}
                        </p>
                      </div>
                      <a
                        href={buildGoogleMapsSearchUrl(attraction.searchQuery)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackMapOpen("attraction", attraction.id)
                        }
                        aria-label={t(
                          `Open ${attraction.name} in Google Maps`,
                          `פתחו את ${attraction.name} ב-Google Maps`
                        )}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-sm border border-primary px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      >
                        {t("Open in Maps", "פתחו במפה")}
                        <ArrowUpRight
                          className="ms-2 size-4"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-primary py-14 text-primary-foreground md:py-16">
          <div className="container grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
                {t("Before you ride", "לפני הרכיבה")}
              </p>
              <h2 className="mt-2 text-3xl font-heading md:text-4xl">
                {t("Plan for a full mountain day", "תכננו יום הררי מלא")}
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-primary-foreground/80">
                {t(
                  "The map’s riding time does not include viewpoints, meals, queues or weather. Start early, check your motorcycle and fuel, and download the route before leaving Chiang Mai.",
                  "זמן הרכיבה במפה אינו כולל תצפיות, ארוחות, תורים או מזג אוויר. צאו מוקדם, בדקו את האופנוע והדלק והורידו את המסלול לפני היציאה מצ׳יאנג מאי."
                )}
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                t(
                  "Check weather and road conditions the same morning.",
                  "בדקו מזג אוויר ותנאי דרך באותו בוקר."
                ),
                t(
                  "Wear a helmet and protective riding gear.",
                  "חבשו קסדה ולבשו ציוד רכיבה מגן."
                ),
                t(
                  "Carry water, phone power and an offline map.",
                  "קחו מים, סוללה לטלפון ומפה לא מקוונת."
                ),
                t(
                  "Do not rush the blind curves or ride after dark.",
                  "אל תמהרו בפניות עיוורות והימנעו מרכיבה בחושך."
                ),
              ].map(note => (
                <li key={note} className="flex gap-3 text-sm leading-relaxed">
                  <Check
                    className="mt-0.5 size-5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="container max-w-6xl py-16 md:py-20">
          <div className="grid overflow-hidden rounded-sm border border-accent/35 bg-muted lg:grid-cols-[1fr_0.72fr]">
            <div className="px-6 py-8 md:px-10 md:py-12">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                {t("Want local support?", "רוצים תמיכה מקומית?")}
              </p>
              <h2 className="mt-2 text-3xl font-heading md:text-4xl">
                {t(
                  "Ask WIRO to help shape the ride",
                  "בקשו מ-WIRO לעזור בתכנון הרכיבה"
                )}
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                {t(
                  "Tell us your date, group size and riding experience. We can discuss motorcycle rental, a local guide, a support vehicle or a route adjusted to your pace.",
                  "ספרו לנו את התאריך, גודל הקבוצה וניסיון הרכיבה. אפשר לדבר על השכרת אופנוע, מדריך מקומי, רכב ליווי או מסלול שמותאם לקצב שלכם."
                )}
              </p>
              <TrackedWhatsAppLink
                sourceCode={
                  language === "he" ? "SAMOENG-GUIDE-HE" : "SAMOENG-GUIDE-EN"
                }
                humanMessage={whatsAppMessage}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex min-h-12 items-center justify-center rounded-sm bg-[#25D366] px-5 py-3 text-center font-bold text-[#f8fff9] transition-colors hover:bg-[#20BA5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <MessageCircle className="me-2 size-5" aria-hidden="true" />
                {t(
                  "Plan my Samoeng Loop with WIRO",
                  "תכננו איתי את לולאת סמואנג"
                )}
              </TrackedWhatsAppLink>
            </div>
            <div className="border-t border-accent/35 bg-card p-6 md:p-8 lg:border-s lg:border-t-0">
              <div className="flex items-start gap-3">
                <CircleAlert
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-semibold">
                    {t("Route information", "מידע על המסלול")}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(
                      "Distances and riding time are approximate. Attraction hours, fees, access and road conditions can change. Confirm important stops directly before departure.",
                      "המרחקים וזמן הרכיבה משוערים. שעות פתיחה, מחירים, גישה ותנאי דרך יכולים להשתנות. בדקו עצירות חשובות ישירות לפני היציאה."
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-5 text-sm text-muted-foreground">
                <Bike
                  className="size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {t(
                  "This guide is for paved-road motorcycle planning, not WIRO’s private 4x4 Samoeng tour.",
                  "המדריך מיועד לתכנון רכיבת כביש ואינו טיול ה-4x4 הפרטי של WIRO בלולאת סמואנג."
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
