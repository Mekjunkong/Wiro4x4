import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bike,
  CalendarDays,
  CarFront,
  Check,
  CircleAlert,
  Clock3,
  ExternalLink,
  Landmark,
  Leaf,
  MessageCircle,
  Mountain,
  Route,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";

import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  MAE_HONG_SON_CATEGORIES,
  MAE_HONG_SON_HIGHLIGHTS,
  MAE_HONG_SON_PACES,
  MAE_HONG_SON_ROUTE_MOMENTS,
  MAE_HONG_SON_STAGES,
  MAE_HONG_SON_VEHICLE_NOTES,
  buildGoogleMapsDirectionsUrl,
  buildMaeHongSonSearchUrl,
  filterMaeHongSonHighlights,
  type MaeHongSonCategory,
  type MaeHongSonPace,
  type MaeHongSonVehicle,
} from "@/data/maeHongSonLoop";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trackEvent } from "@/lib/analytics";

type FilterId = "all" | MaeHongSonCategory;

const categoryIcons = {
  nature: Leaf,
  culture: Landmark,
  viewpoints: Mountain,
  "town-food": Utensils,
  seasonal: Sparkles,
  detours: Route,
} satisfies Record<MaeHongSonCategory, typeof Leaf>;

const routePoints = [
  { x: 74, y: 169 },
  { x: 32, y: 123 },
  { x: 45, y: 83 },
  { x: 70, y: 48 },
  { x: 120, y: 48 },
  { x: 151, y: 85 },
  { x: 151, y: 133 },
  { x: 103, y: 170 },
];

export default function MaeHongSonLoopGuide() {
  const { t, language } = useLanguage();
  const [pace, setPace] = useState<MaeHongSonPace>("6");
  const [vehicle, setVehicle] = useState<MaeHongSonVehicle>("motorcycle");
  const [activeCategory, setActiveCategory] = useState<FilterId>("all");

  const activePace =
    MAE_HONG_SON_PACES.find(option => option.id === pace) ??
    MAE_HONG_SON_PACES[2];
  const visibleHighlights = useMemo(
    () => filterMaeHongSonHighlights(activeCategory),
    [activeCategory]
  );

  const pageTitle = t(
    "Mae Hong Son Loop Local Guide — Motorcycle & 4x4",
    "מדריך מקומי ללולאת מאה הונג סון — אופנוע ו-4x4"
  );
  const pageDescription = t(
    "Plan the Mae Hong Son Loop from Chiang Mai with 4, 5 or 6-day route ideas, stage maps, local highlights and practical guidance for motorcycle and private 4x4 travelers.",
    "תכננו את לולאת מאה הונג סון מצ׳יאנג מאי עם מסלולים ל-4, 5 או 6 ימים, מפות לפי מקטע, נקודות עניין מקומיות והכוונה מעשית לאופנוע או 4x4 פרטי."
  );

  usePageMeta({
    title: pageTitle,
    description: pageDescription,
    canonicalPath: "/motorcycle-tours/mae-hong-son-loop",
    language,
    ogImage:
      "https://www.wiro4x4indochina.com/images/optimized/motorcycle-touring-illustration.webp",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id":
        "https://www.wiro4x4indochina.com/motorcycle-tours/mae-hong-son-loop#webpage",
      url: "https://www.wiro4x4indochina.com/motorcycle-tours/mae-hong-son-loop",
      name: pageTitle,
      description: pageDescription,
      isPartOf: { "@id": "https://www.wiro4x4indochina.com/#website" },
      about: { "@type": "Place", name: "Mae Hong Son Loop, Thailand" },
      inLanguage: language,
    },
  });

  const updatePace = (nextPace: MaeHongSonPace) => {
    setPace(nextPace);
    trackEvent("itinerary_expand", {
      page: "/motorcycle-tours/mae-hong-son-loop",
      placement: `${nextPace}-days`,
      language,
    });
  };

  const updateVehicle = (nextVehicle: MaeHongSonVehicle) => {
    setVehicle(nextVehicle);
    trackEvent("itinerary_expand", {
      page: "/motorcycle-tours/mae-hong-son-loop",
      placement: nextVehicle,
      language,
    });
  };

  const trackMapOpen = (placement: string, tour?: string) => {
    trackEvent("map_open", {
      page: "/motorcycle-tours/mae-hong-son-loop",
      placement,
      language,
      ...(tour ? { tour } : {}),
    });
  };

  const vehicleLabel =
    vehicle === "motorcycle"
      ? t("motorcycle", "אופנוע")
      : t("private 4x4", "4x4 פרטי");
  const whatsAppMessage = t(
    `Hi WIRO! I’m planning the Mae Hong Son Loop. Preferred pace: ${pace} days. Vehicle: ${vehicleLabel}. Dates: __ Travelers: __ Experience: __ Please help me shape the route and confirm what WIRO can arrange.`,
    `שלום WIRO! אני מתכנן/ת את לולאת מאה הונג סון. קצב מועדף: ${pace} ימים. רכב: ${vehicleLabel}. תאריכים: __ מספר מטיילים: __ ניסיון: __ אשמח לעזרה בבניית המסלול ובאישור מה WIRO יכול לארגן.`
  );

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
            { label: t("Mae Hong Son Loop", "לולאת מאה הונג סון") },
          ]}
        />

        <section className="container max-w-7xl pb-14 pt-5 md:pb-20">
          <div className="relative min-h-[620px] overflow-hidden rounded-sm bg-[#0b2a22] md:min-h-[720px]">
            <img
              src="/images/optimized/motorcycle-touring-illustration.webp"
              alt={t(
                "Motorcyclists following a winding road through the mountains of Northern Thailand",
                "רוכבי אופנוע נוסעים בדרך מפותלת בהרי צפון תאילנד"
              )}
              width={800}
              height={1067}
              loading="eager"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-[50%_54%] md:object-[50%_46%]"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,31,25,0.94)_0%,rgba(8,31,25,0.68)_48%,rgba(8,31,25,0.18)_80%),linear-gradient(0deg,rgba(8,31,25,0.94)_0%,transparent_55%)] max-md:bg-[linear-gradient(0deg,rgba(8,31,25,0.97)_0%,rgba(8,31,25,0.58)_62%,rgba(8,31,25,0.1)_100%)]"
              aria-hidden="true"
            />

            <div className="relative z-10 flex min-h-[620px] max-w-4xl flex-col justify-end px-6 py-8 text-[#f8f5ec] md:min-h-[720px] md:px-12 md:py-12 lg:px-16">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e2b65d] md:text-sm">
                {t("WIRO local expedition atlas", "אטלס המסע המקומי של WIRO")}
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-heading leading-[0.98] md:text-7xl lg:text-8xl">
                {t("Mae Hong Son Loop", "לולאת מאה הונג סון")}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/82 md:text-xl">
                {t(
                  "A road journey through western mountain towns, cave country, temple valleys and the long bends back to Chiang Mai.",
                  "מסע כביש דרך עיירות ההרים במערב, ארץ המערות, עמקי המקדשים והפיתולים הארוכים חזרה לצ׳יאנג מאי."
                )}
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
                <span className="inline-flex items-center gap-2 border border-white/30 bg-black/20 px-4 py-2.5 backdrop-blur-sm">
                  <CalendarDays
                    className="size-4 text-[#e2b65d]"
                    aria-hidden="true"
                  />
                  {t("4, 5 or 6 days", "4, 5 או 6 ימים")}
                </span>
                <span className="inline-flex items-center gap-2 border border-white/30 bg-black/20 px-4 py-2.5 backdrop-blur-sm">
                  <Bike className="size-4 text-[#e2b65d]" aria-hidden="true" />
                  {t("Motorcycle", "אופנוע")}
                </span>
                <span className="inline-flex items-center gap-2 border border-white/30 bg-black/20 px-4 py-2.5 backdrop-blur-sm">
                  <CarFront
                    className="size-4 text-[#e2b65d]"
                    aria-hidden="true"
                  />
                  {t("Private 4x4", "4x4 פרטי")}
                </span>
              </div>
              <a
                href="#build-your-loop"
                className="mt-8 inline-flex min-h-12 w-fit items-center justify-center bg-[#e2b65d] px-6 py-3 font-bold text-[#0b2a22] transition-colors hover:bg-[#f0c974] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2a22]"
              >
                {t("Explore the route", "גלו את המסלול")}
                <ArrowUpRight className="ms-2 size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          id="build-your-loop"
          className="border-y border-border bg-muted/55 py-14 md:py-20"
          aria-labelledby="build-loop-heading"
        >
          <div className="container max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  {t("Build your loop", "בנו את הלולאה שלכם")}
                </p>
                <h2
                  id="build-loop-heading"
                  className="mt-2 text-4xl font-heading md:text-5xl"
                >
                  {t("Choose your pace", "בחרו את הקצב")}
                </h2>
                <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                  {t(
                    "The road does not change, but the experience does. Four days keeps moving; six days leaves room for the places that make the loop memorable.",
                    "הכביש אינו משתנה, אבל החוויה כן. ארבעה ימים משאירים אתכם בתנועה; שישה ימים נותנים מקום לעצירות שהופכות את הלולאה לזכורה."
                  )}
                </p>

                <div
                  className="mt-7 grid grid-cols-3 gap-2"
                  role="group"
                  aria-label={t("Select trip pace", "בחרו קצב טיול")}
                >
                  {MAE_HONG_SON_PACES.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updatePace(option.id)}
                      aria-pressed={pace === option.id}
                      className={`min-h-12 border px-3 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        pace === option.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary"
                      }`}
                    >
                      {t(option.label.en, option.label.he)}
                    </button>
                  ))}
                </div>

                <div className="mt-7 border-s-2 border-accent ps-5">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                    {t(activePace.eyebrow.en, activePace.eyebrow.he)}
                  </p>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {t(activePace.summary.en, activePace.summary.he)}
                  </p>
                </div>
              </div>

              <div className="border border-border bg-card p-5 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-2xl font-heading">
                    {t(`${pace}-day field plan`, `תכנית שטח ל-${pace} ימים`)}
                  </h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                    {t("Adjust after live checks", "מתאימים לאחר בדיקה עדכנית")}
                  </span>
                </div>
                <ol className="mt-6 grid gap-3">
                  {activePace.days.map((day, index) => (
                    <li
                      key={day.en}
                      className="grid grid-cols-[2.5rem_1fr] items-center gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0"
                    >
                      <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-semibold">{t(day.en, day.he)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section
          className="container max-w-7xl py-16 md:py-24"
          aria-labelledby="route-map-heading"
        >
          <div className="grid gap-9 lg:grid-cols-[0.86fr_1.14fr] lg:items-start lg:gap-14">
            <div className="lg:sticky lg:top-28">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                {t("Route overview", "סקירת המסלול")}
              </p>
              <h2
                id="route-map-heading"
                className="mt-2 text-4xl font-heading md:text-5xl"
              >
                {t("The loop at a glance", "הלולאה במבט אחד")}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t(
                  "This atlas sketch explains the journey; use the stage buttons for live Google Maps directions. WIRO will add an editable public My Map after the final route is approved.",
                  "תרשים האטלס מסביר את המסע; השתמשו בכפתורי המקטעים לניווט עדכני ב-Google Maps. WIRO יוסיף My Map ציבורית וניתנת לעריכה לאחר אישור המסלול הסופי."
                )}
              </p>

              <div className="relative mt-7 aspect-square max-w-[460px] overflow-hidden border border-[#d6c79d] bg-[#efe9d8] p-5 shadow-[0_22px_55px_rgba(11,42,34,0.14)]">
                <div
                  className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(23,53,44,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(23,53,44,0.12)_1px,transparent_1px)] [background-size:24px_24px]"
                  aria-hidden="true"
                />
                <svg
                  viewBox="0 0 190 205"
                  className="relative h-full w-full"
                  role="img"
                  aria-label={t(
                    "Schematic clockwise Mae Hong Son Loop route",
                    "תרשים סכמטי של לולאת מאה הונג סון בכיוון השעון"
                  )}
                >
                  <path
                    d="M74 169 C40 165 21 143 32 123 C41 109 30 95 45 83 C54 74 55 56 70 48 C86 39 106 39 120 48 C138 57 145 69 151 85 C158 104 161 120 151 133 C138 150 122 164 103 170 C92 173 82 173 74 169Z"
                    fill="none"
                    stroke="#17352c"
                    strokeWidth="3"
                    strokeDasharray="2 4"
                    strokeLinecap="round"
                  />
                  {routePoints.map((point, index) => (
                    <g key={`${point.x}-${point.y}`}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={
                          index === 0 || index === routePoints.length - 1
                            ? 6
                            : 4.7
                        }
                        fill={
                          index === 0 || index === routePoints.length - 1
                            ? "#d5a53d"
                            : "#17352c"
                        }
                      />
                      <text
                        x={point.x}
                        y={point.y + 1.7}
                        textAnchor="middle"
                        fontSize="4.5"
                        fill={
                          index === 0 || index === routePoints.length - 1
                            ? "#17352c"
                            : "white"
                        }
                        fontWeight="700"
                      >
                        {index === 0 || index === routePoints.length - 1
                          ? "C"
                          : index}
                      </text>
                    </g>
                  ))}
                  <text
                    x="103"
                    y="187"
                    textAnchor="middle"
                    fontSize="8"
                    fill="#17352c"
                    fontWeight="700"
                  >
                    CHIANG MAI
                  </text>
                  <text
                    x="18"
                    y="119"
                    textAnchor="middle"
                    fontSize="6"
                    fill="#17352c"
                  >
                    MAE SARIANG
                  </text>
                  <text
                    x="38"
                    y="70"
                    textAnchor="middle"
                    fontSize="6"
                    fill="#17352c"
                  >
                    KHUN YUAM
                  </text>
                  <text
                    x="92"
                    y="28"
                    textAnchor="middle"
                    fontSize="6"
                    fill="#17352c"
                  >
                    MAE HONG SON
                  </text>
                  <text
                    x="164"
                    y="80"
                    textAnchor="middle"
                    fontSize="6"
                    fill="#17352c"
                  >
                    PANG MAPHA
                  </text>
                  <text
                    x="167"
                    y="139"
                    textAnchor="middle"
                    fontSize="7"
                    fill="#17352c"
                  >
                    PAI
                  </text>
                </svg>
                <p className="absolute bottom-3 start-4 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[#52645d]">
                  {t(
                    "Route sketch · not for navigation",
                    "תרשים מסלול · לא לניווט"
                  )}
                </p>
              </div>
            </div>

            <ol className="grid gap-4">
              {MAE_HONG_SON_STAGES.map(stage => (
                <li
                  key={stage.id}
                  className="group border border-border bg-card p-5 transition-colors hover:border-accent md:p-7"
                >
                  <div className="grid gap-4 sm:grid-cols-[3.5rem_1fr_auto] sm:items-start">
                    <span className="text-3xl font-heading text-primary">
                      {String(stage.number).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                        {t(stage.name.en, stage.name.he)}
                      </p>
                      <h3 className="mt-1 text-2xl font-heading">
                        {t(stage.route.en, stage.route.he)}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {t(stage.description.en, stage.description.he)}
                      </p>
                    </div>
                    <a
                      href={buildGoogleMapsDirectionsUrl(
                        stage.origin,
                        stage.destination,
                        vehicle === "motorcycle" ? "two-wheeler" : "driving"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackMapOpen(`stage-${stage.number}`, stage.id)
                      }
                      className="inline-flex min-h-11 w-fit items-center justify-center border border-primary px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {t(stage.mapLabel.en, stage.mapLabel.he)}
                      <ArrowUpRight
                        className="ms-2 size-4"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="bg-[#0b2a22] py-16 text-[#f8f5ec] md:py-24"
          aria-labelledby="moments-heading"
        >
          <div className="container max-w-7xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#e2b65d]">
              {t("Expedition field notes", "רשימות שטח מהמסע")}
            </p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <h2
                id="moments-heading"
                className="max-w-2xl text-4xl font-heading md:text-5xl"
              >
                {t("What the road feels like", "איך הדרך מרגישה")}
              </h2>
              <p className="text-sm text-white/65">
                {t("Swipe to explore", "החליקו כדי לגלות")}
              </p>
            </div>
          </div>
          <div
            role="region"
            aria-label={t(
              "Mae Hong Son expedition photographs",
              "תמונות מסע ממאה הונג סון"
            )}
            tabIndex={0}
            data-route-moments-carousel
            className="mt-9 scroll-smooth overflow-x-auto overscroll-x-contain px-[max(1.5rem,calc((100vw-80rem)/2))] pb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e2b65d] motion-reduce:scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex w-max snap-x snap-mandatory gap-4 md:gap-6">
              {MAE_HONG_SON_ROUTE_MOMENTS.map((moment, index) => (
                <figure
                  key={moment.id}
                  className="relative h-[440px] w-[82vw] max-w-[680px] snap-center overflow-hidden border border-white/15 bg-black md:h-[500px] md:w-[62vw]"
                >
                  <img
                    src={moment.image}
                    alt={t(moment.alt.en, moment.alt.he)}
                    width={1200}
                    height={800}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                  />
                  <div
                    className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(5,22,17,0.92)_100%)]"
                    aria-hidden="true"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#e2b65d]">
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {String(MAE_HONG_SON_ROUTE_MOMENTS.length).padStart(
                        2,
                        "0"
                      )}
                    </p>
                    <h3 className="mt-2 text-3xl font-heading md:text-4xl">
                      {t(moment.title.en, moment.title.he)}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/72 md:text-base">
                      {t(moment.description.en, moment.description.he)}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section
          className="container max-w-7xl py-16 md:py-24"
          aria-labelledby="vehicle-heading"
        >
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                {t("Choose your vehicle", "בחרו את הרכב")}
              </p>
              <h2
                id="vehicle-heading"
                className="mt-2 text-4xl font-heading md:text-5xl"
              >
                {t("One loop, two ways", "לולאה אחת, שתי דרכים")}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t(
                  "The route stays the same. The preparation, comfort and daily rhythm change.",
                  "המסלול נשאר זהה. ההכנה, הנוחות והקצב היומי משתנים."
                )}
              </p>
            </div>
            <div>
              <div
                className="grid grid-cols-2 gap-2"
                role="group"
                aria-label={t("Select vehicle", "בחרו רכב")}
              >
                {(["motorcycle", "4x4"] as const).map(option => {
                  const Icon = option === "motorcycle" ? Bike : CarFront;
                  const label =
                    option === "motorcycle"
                      ? t("Motorcycle", "אופנוע")
                      : t("Private 4x4", "4x4 פרטי");
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateVehicle(option)}
                      aria-pressed={vehicle === option}
                      className={`flex min-h-14 items-center justify-center gap-2 border px-4 py-3 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${vehicle === option ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 border border-border bg-muted/55 p-6 md:p-8">
                <ul className="grid gap-4">
                  {MAE_HONG_SON_VEHICLE_NOTES[vehicle].map(note => (
                    <li
                      key={note.en}
                      className="flex gap-3 leading-relaxed text-muted-foreground"
                    >
                      <Check
                        className="mt-1 size-5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>{t(note.en, note.he)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          id="highlights"
          className="border-y border-border bg-muted/55 py-16 md:py-24"
          aria-labelledby="highlights-heading"
        >
          <div className="container max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                {t("Curated local highlights", "נקודות עניין מקומיות שנבחרו")}
              </p>
              <h2
                id="highlights-heading"
                className="mt-2 text-4xl font-heading md:text-5xl"
              >
                {t("Choose what deserves your time", "בחרו למה להקדיש זמן")}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t(
                  "The loop is the experience. Use these as possibilities, not a checklist, and confirm access for anything marked live check.",
                  "הלולאה היא החוויה. השתמשו במקומות האלה כאפשרויות ולא כרשימת חובה, ובדקו גישה עדכנית לכל מקום שמסומן לבדיקה."
                )}
              </p>
            </div>

            <div
              className="mt-8 flex gap-2 overflow-x-auto pb-2"
              role="group"
              aria-label={t("Filter highlights", "סינון נקודות עניין")}
            >
              {MAE_HONG_SON_CATEGORIES.map(category => {
                const count = filterMaeHongSonHighlights(category.id).length;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    aria-pressed={activeCategory === category.id}
                    className={`min-h-11 shrink-0 border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${activeCategory === category.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`}
                  >
                    {t(category.label.en, category.label.he)}{" "}
                    <span className="ms-2 opacity-65">{count}</span>
                  </button>
                );
              })}
            </div>

            <p
              className="mt-6 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {t(
                `Showing ${visibleHighlights.length} curated places`,
                `מציג ${visibleHighlights.length} מקומות שנבחרו`
              )}
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {visibleHighlights.map(highlight => {
                const Icon = categoryIcons[highlight.category];
                return (
                  <article
                    key={highlight.id}
                    className="flex flex-col border border-border bg-card p-5 md:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-primary">
                        <Icon className="size-4" aria-hidden="true" />
                        {t(
                          MAE_HONG_SON_CATEGORIES.find(
                            category => category.id === highlight.category
                          )?.label.en ?? highlight.category,
                          MAE_HONG_SON_CATEGORIES.find(
                            category => category.id === highlight.category
                          )?.label.he ?? highlight.category
                        )}
                      </span>
                      {highlight.liveCheckRequired ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#f2e8ca] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#604b16]">
                          <Clock3 className="size-3" aria-hidden="true" />
                          {t("Live check", "בדיקה עדכנית")}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-4 text-2xl font-heading">
                      {t(highlight.name.en, highlight.name.he)}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {t(highlight.description.en, highlight.description.he)}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                      <a
                        href={buildMaeHongSonSearchUrl(highlight.searchQuery)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackMapOpen("highlight", highlight.id)}
                        className="inline-flex min-h-11 items-center justify-center border border-primary px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {t("Open in Maps", "פתחו במפות")}
                        <ArrowUpRight
                          className="ms-2 size-4"
                          aria-hidden="true"
                        />
                      </a>
                      <a
                        href={highlight.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground underline decoration-accent underline-offset-4 hover:text-foreground"
                      >
                        {t("Tourism source", "מקור תיירותי")}
                        <ExternalLink className="size-3" aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="container max-w-7xl py-16 md:py-24"
          aria-labelledby="road-ready-heading"
        >
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border border-border bg-card p-6 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                {t("Before the road", "לפני היציאה")}
              </p>
              <h2
                id="road-ready-heading"
                className="mt-2 text-4xl font-heading md:text-5xl"
              >
                {t(
                  "Check today, not last season",
                  "בודקים היום, לא לפי העונה הקודמת"
                )}
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                {t(
                  "Mountain weather, haze, access and road incidents can change quickly. Use official sources before every stage and let the plan breathe.",
                  "מזג אוויר הררי, עשן, גישה ואירועי כביש יכולים להשתנות במהירות. בדקו מקורות רשמיים לפני כל מקטע והשאירו גמישות בתכנית."
                )}
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: t(
                      "Mae Hong Son weather",
                      "מזג האוויר במאה הונג סון"
                    ),
                    href: "https://www.tmd.go.th/en/weather/province/mae-hong-son",
                  },
                  {
                    label: t("Weather warnings", "אזהרות מזג אוויר"),
                    href: "https://www.tmd.go.th/en/warning-and-events/warning-storm",
                  },
                  {
                    label: t("Highway updates", "עדכוני כבישים"),
                    href: "https://www.doh.go.th/content/1590",
                  },
                  {
                    label: t("Air quality", "איכות האוויר"),
                    href: "https://air4thai.pcd.go.th/",
                  },
                ].map(item => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-between gap-3 border border-border px-4 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {item.label}
                    <ExternalLink
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </div>
            <aside
              className="bg-[#0b2a22] p-6 text-[#f8f5ec] md:p-10"
              aria-label={t("Safety essentials", "עיקרי בטיחות")}
            >
              <ShieldCheck
                className="size-9 text-[#e2b65d]"
                aria-hidden="true"
              />
              <h3 className="mt-5 text-3xl font-heading">
                {t("Road-ready essentials", "מוכנים לדרך")}
              </h3>
              <ul className="mt-6 grid gap-4 text-sm leading-relaxed text-white/75">
                <li className="flex gap-3">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-[#e2b65d]"
                    aria-hidden="true"
                  />
                  {t(
                    "Carry the correct Thai-recognized driving licence or permit and confirm your insurance coverage.",
                    "נשאו רישיון נהיגה או היתר המוכר בתאילנד ובדקו את הכיסוי הביטוחי שלכם."
                  )}
                </li>
                <li className="flex gap-3">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-[#e2b65d]"
                    aria-hidden="true"
                  />
                  {t(
                    "Use a proper helmet on a motorcycle and avoid planning mountain arrivals after dark.",
                    "חבשו קסדה תקנית באופנוע והימנעו מתכנון הגעה בהרים לאחר החשיכה."
                  )}
                </li>
                <li className="flex gap-3">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-[#e2b65d]"
                    aria-hidden="true"
                  />
                  {t(
                    "Keep fuel, water, offline navigation and a weather alternative for every long stage.",
                    "דאגו לדלק, מים, ניווט לא מקוון וחלופת מזג אוויר לכל מקטע ארוך."
                  )}
                </li>
              </ul>
              <div className="mt-7 border-t border-white/20 pt-5 text-sm">
                <p>
                  <strong>{t("Medical emergency", "חירום רפואי")}:</strong> 1669
                </p>
                <p className="mt-2">
                  <strong>{t("Tourist Police", "משטרת התיירות")}:</strong> 1155
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section
          className="bg-[#e2b65d] py-16 md:py-20"
          aria-labelledby="plan-with-wiro-heading"
        >
          <div className="container max-w-5xl text-center text-[#0b2a22]">
            <p className="text-sm font-bold uppercase tracking-[0.16em]">
              {t("Local planning, your pace", "תכנון מקומי, בקצב שלכם")}
            </p>
            <h2
              id="plan-with-wiro-heading"
              className="mx-auto mt-3 max-w-3xl text-4xl font-heading md:text-6xl"
            >
              {t(
                "Ask WIRO to shape your Mae Hong Son Loop",
                "בקשו מ-WIRO לבנות את לולאת מאה הונג סון שלכם"
              )}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-[#17352c]">
              {t(
                `Your message will include the ${pace}-day pace and ${vehicleLabel} choice. WIRO will confirm what can be arranged; this guide is not a fixed package promise.`,
                `ההודעה תכלול קצב של ${pace} ימים ובחירה ב-${vehicleLabel}. WIRO יאשר מה ניתן לארגן; המדריך אינו התחייבות לחבילה קבועה.`
              )}
            </p>
            <TrackedWhatsAppLink
              sourceCode={
                language === "he"
                  ? "MAE-HONG-SON-GUIDE-HE"
                  : "MAE-HONG-SON-GUIDE-EN"
              }
              humanMessage={whatsAppMessage}
              tour={`mae-hong-son-loop-${pace}-days-${vehicle}`}
              className="mx-auto mt-8 inline-flex min-h-14 w-full max-w-sm items-center justify-center bg-[#0b2a22] px-6 py-3 font-bold text-white transition-colors hover:bg-[#143e33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#e2b65d]"
            >
              <MessageCircle className="me-2 size-5" aria-hidden="true" />
              {t("Plan my loop with WIRO", "תכננו את הלולאה שלי עם WIRO")}
            </TrackedWhatsAppLink>
            <p className="mt-4 text-xs text-[#5c542f]">
              {t(
                `${MAE_HONG_SON_HIGHLIGHTS.length} curated highlights · Sources checked 11 September 2026`,
                `${MAE_HONG_SON_HIGHLIGHTS.length} נקודות עניין · המקורות נבדקו ב-11 בספטמבר 2026`
              )}
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-muted/55 py-7">
          <div className="container max-w-7xl flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
            <CircleAlert
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p>
              {t(
                "This is an editorial planning guide for a changing mountain route. Google Maps can recalculate directions; official conditions and local instructions take priority.",
                "זהו מדריך תכנון עריכתי למסלול הררי משתנה. Google Maps עשוי לחשב את הדרך מחדש; תנאים רשמיים והנחיות מקומיות קודמים למדריך."
              )}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
