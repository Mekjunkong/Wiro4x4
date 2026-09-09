import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Gauge,
  Map,
  MapPin,
  Route,
} from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

type Copy = { en: string; he: string };
type TourOption = {
  id: "three" | "five" | "custom";
  title: Copy;
  summary: Copy;
  meta: Copy;
  details: Copy[];
};

const options: TourOption[] = [
  {
    id: "three",
    title: {
      en: "Northern Thailand Loop · 3 Days",
      he: "לולאת צפון תאילנד · 3 ימים",
    },
    summary: {
      en: "Chiang Mai · Pai · Mae Hong Son · Chiang Mai. A compact, scenic loop with caves, villages and mountain roads.",
      he: "צ׳יאנג מאי · פאי · מאה הונג סון · צ׳יאנג מאי. לולאה קצרה עם מערות, כפרים וכבישי הרים.",
    },
    meta: {
      en: "3 days / 2 nights · about 550 km",
      he: "3 ימים / 2 לילות · כ-550 ק״מ",
    },
    details: [
      {
        en: "Day 1: Chiang Mai to Pai via Mok Fa Waterfall and Pai Canyon sunset.",
        he: "יום 1: מצ׳יאנג מאי לפאי דרך מפל מוק פאה ושקיעה בקניון פאי.",
      },
      {
        en: "Day 2: Pai to Mae Hong Son via Tham Lod Cave, Ban Jabo and a Long Neck Karen village boat ride.",
        he: "יום 2: מפאי למאה הונג סון דרך מערת תאם לוד, באן ג׳אבו ושיט לכפר קארן ארוך הצוואר.",
      },
      {
        en: "Day 3: Mae Hong Son to Chiang Mai through the Mae Hong Son Loop mountain roads.",
        he: "יום 3: ממאה הונג סון לצ׳יאנג מאי בכבישי ההרים של לולאת מאה הונג סון.",
      },
    ],
  },
  {
    id: "five",
    title: {
      en: "Ride Beyond Borders · 5 Days",
      he: "רוכבים מעבר לגבולות · 5 ימים",
    },
    summary: {
      en: "Chiang Mai · Mae Hong Son · Pai · Thaton · Chiang Rai. The complete Off Trail Thailand adventure.",
      he: "צ׳יאנג מאי · מאה הונג סון · פאי · תאטן · צ׳יאנג ראי. הרפתקת Off Trail Thailand המלאה.",
    },
    meta: {
      en: "5 days / 4 nights · approximately 1,115 km · 100% paved",
      he: "5 ימים / 4 לילות · כ-1,115 ק״מ · כבישים סלולים",
    },
    details: [
      {
        en: "Day 1 · Chiang Mai → Doi Inthanon → Mae Hong Son: Thailand’s highest peak (2,565 m), Wachirathan Waterfall and Mae Chaem. 240 km · 6–6.5 hours. Overnight: Fern Resort Mae Hong Son.",
        he: "יום 1 · צ׳יאנג מאי → דוי אינתנון → מאה הונג סון: הפסגה הגבוהה בתאילנד (2,565 מ׳), מפל וצ׳יראטאן ומאה צ׳אם. 240 ק״מ · 6–6.5 שעות. לינה: Fern Resort Mae Hong Son.",
      },
      {
        en: "Day 2 · Mae Hong Son → Pai: optional Long Neck Karen Village boat excursion, Tham Lod Cave bamboo raft and the mountain curves into Pai. 210 km · 4.5–5 hours. Overnight: The Quarter Pai.",
        he: "יום 2 · מאה הונג סון → פאי: שיט אופציונלי לכפר קארן ארוך הצוואר, רפסודת במבוק במערת תאם לוד וכבישי הרים לפאי. 210 ק״מ · 4.5–5 שעות. לינה: The Quarter Pai.",
      },
      {
        en: "Day 3 · Pai → Mae Taeng → Thaton: viewpoints, coffee, an ethical elephant sanctuary and Wat Thaton before sunset. 270 km · 6–6.5 hours. Overnight: Maekok River Village Resort.",
        he: "יום 3 · פאי → מאה טאנג → תאטן: תצפיות, קפה, מקלט פילים אתי ומקדש ואט תאטן לפני השקיעה. 270 ק״מ · 6–6.5 שעות. לינה: Maekok River Village Resort.",
      },
      {
        en: "Day 4 · Thaton → Doi Mae Salong → Golden Triangle → Chiang Rai: tea plantations, Chinese heritage, Mekong River boat excursion and borderland history. 200 km · 4–5 hours. Overnight: Diamond Park Inn Chiang Rai Resort.",
        he: "יום 4 · תאטן → דוי מאה סאלונג → משולש הזהב → צ׳יאנג ראי: מטעי תה, מורשת סינית, שיט במקונג והיסטוריית אזור הגבול. 200 ק״מ · 4–5 שעות. לינה: Diamond Park Inn Chiang Rai Resort.",
      },
      {
        en: "Day 5 · Chiang Rai → Wat Rong Khun → Chiang Mai: visit the White Temple, return the motorcycle and transfer to your hotel. 180–190 km · 3.5–4.5 hours. Expected arrival: around 15:00.",
        he: "יום 5 · צ׳יאנג ראי → ואט רונג קון → צ׳יאנג מאי: ביקור במקדש הלבן, החזרת האופנוע והעברה למלון. 180–190 ק״מ · 3.5–4.5 שעות. הגעה צפויה: בסביבות 15:00.",
      },
    ],
  },
  {
    id: "custom",
    title: { en: "Build Your Own Tour", he: "בנו את הטיול שלכם" },
    summary: {
      en: "Choose the days, roads, riding pace, stays and experiences that fit your group.",
      he: "בחרו את מספר הימים, הכבישים, קצב הרכיבה, הלינות והחוויות שמתאימים לקבוצה שלכם.",
    },
    meta: {
      en: "Flexible dates · route · pace · support",
      he: "תאריכים · מסלול · קצב · תמיכה גמישים",
    },
    details: [
      {
        en: "Combine the Mae Hong Son Loop, Pai, Doi Inthanon, Doi Mae Salong, Chiang Rai or other northern roads.",
        he: "שלבו את לולאת מאה הונג סון, פאי, דוי אינתנון, דוי מאה סאלונג, צ׳יאנג ראי או כבישים צפוניים אחרים.",
      },
      {
        en: "Tell us your riding level, preferred daily distance, hotel style, must-see places and support needs.",
        he: "ספרו לנו על רמת הרכיבה, המרחק היומי, סגנון המלונות, המקומות שחשוב לכם לראות וצרכי התמיכה.",
      },
      {
        en: "We will shape a personal route and confirm availability, inclusions and the final quotation with you.",
        he: "נבנה עבורכם מסלול אישי ונאשר איתכם זמינות, מה כלול והצעת מחיר סופית.",
      },
    ],
  },
];

const highlights: Copy[] = [
  { en: "More than 2,500 mountain curves", he: "יותר מ-2,500 פניות הרריות" },
  { en: "Doi Inthanon National Park", he: "הפארק הלאומי דוי אינתנון" },
  { en: "Tham Lod Cave bamboo rafting", he: "רפסודת במבוק במערת תאם לוד" },
  { en: "Long Neck Karen Village", he: "כפר קארן ארוך הצוואר" },
  { en: "Ethical elephant sanctuary", he: "מקלט פילים אתי" },
  { en: "Doi Mae Salong tea plantations", he: "מטעי התה של דוי מאה סאלונג" },
  { en: "Golden Triangle and Mekong boat trip", he: "משולש הזהב ושיט במקונג" },
  { en: "White Temple (Wat Rong Khun)", he: "המקדש הלבן (ואט רונג קון)" },
];

export default function MotorcycleTours() {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<TourOption["id"]>("five");
  const active = options.find(option => option.id === selected) ?? options[1];
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
          aria-labelledby="samoeng-guide-heading"
        >
          <div className="grid overflow-hidden rounded-sm border border-accent/35 bg-muted lg:grid-cols-[0.82fr_1.18fr]">
            <img
              src="/images/optimized/samoeng_valley.webp"
              alt={t(
                "Green mountain valley along the Samoeng Loop",
                "עמק הררי ירוק לאורך לולאת סמואנג"
              )}
              width={1200}
              height={800}
              loading="lazy"
              className="h-full min-h-[260px] w-full object-cover"
            />
            <div className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-12">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                {t("WIRO local route guide", "מדריך מסלול מקומי של WIRO")}
              </p>
              <h2
                id="samoeng-guide-heading"
                className="mt-2 text-3xl font-heading md:text-4xl"
              >
                {t(
                  "Ride the Samoeng Loop in one day",
                  "רוכבים את לולאת סמואנג ביום אחד"
                )}
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                {t(
                  "Open WIRO’s complete Google Maps route, then choose waterfalls, viewpoints, temples, activities and cafe stops that match your pace.",
                  "פתחו את מסלול Google Maps המלא של WIRO ובחרו מפלים, תצפיות, מקדשים, אטרקציות ובתי קפה שמתאימים לקצב שלכם."
                )}
              </p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Route className="size-4 text-primary" aria-hidden="true" />
                  {t("About 130 km", "כ-130 ק״מ")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Map className="size-4 text-primary" aria-hidden="true" />
                  {t("38 saved places", "38 מקומות שמורים")}
                </span>
              </div>
              <Link
                href="/motorcycle-tours/samoeng-loop"
                className="mt-7 inline-flex min-h-12 w-fit items-center justify-center rounded-sm bg-primary px-5 py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {t("Explore the Samoeng Loop", "גלו את לולאת סמואנג")}
                <ArrowUpRight className="ms-2 size-4" aria-hidden="true" />
              </Link>
            </div>
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
