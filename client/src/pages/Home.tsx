import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { ProductTiers } from "@/components/ProductTiers";
import { GalleryShowcase } from "@/components/GalleryShowcase";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { TrustAndKosher } from "@/components/TrustAndKosher";
import { QuickInquiryForm } from "@/components/QuickInquiryForm";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { StickyBookBar } from "@/components/StickyBookBar";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/contexts/LanguageContext";

const HOMEPAGE_FAQS = [
  {
    questionEn: "Is WIRO a private Chiang Mai 4x4 tour or a mixed group tour?",
    questionHe: "האם WIRO הוא טיול ג׳יפים פרטי או טיול קבוצתי?",
    answerEn:
      "WIRO plans private 4x4 routes for your family or group. WhatsApp is where we check dates, shape the route, and confirm the price before you book.",
    answerHe:
      "WIRO מתכננת מסלולי 4x4 פרטיים למשפחה או לקבוצה שלכם. בוואטסאפ בודקים תאריכים, בונים כיוון מסלול ומאשרים מחיר לפני הזמנה.",
  },
  {
    questionEn: "Can you plan a Doi Inthanon 4x4 day tour from Chiang Mai?",
    questionHe: "אפשר לתכנן טיול פרטי לדוי אינתנון מצ׳אנג מאי?",
    answerEn:
      "Yes. Doi Inthanon is one of the main private route ideas. Stops and timing depend on weather, road conditions, park rules, and your group comfort.",
    answerHe:
      "כן. דוי אינתנון הוא אחד מכיווני המסלול המרכזיים. העצירות והזמנים תלויים במזג האוויר, תנאי הדרך, כללי הפארק ונוחות הקבוצה.",
  },
  {
    questionEn: "Is this a good alternative to Chiang Mai ATV or combo tours?",
    questionHe: "זה מתאים במקום טיול ATV או טיול קומבו בצ׳אנג מאי?",
    answerEn:
      "Often, yes. WIRO is a scenic private 4x4 experience, not a reckless ATV product. The adventure level is matched to weather, road conditions, and your group.",
    answerHe:
      "לעיתים כן. WIRO היא חוויית 4x4 פרטית ונופית, לא מוצר ATV פרוע. רמת ההרפתקה מותאמת למזג האוויר, תנאי הדרך והקבוצה.",
  },
  {
    questionEn:
      "Can Hebrew-speaking or kosher-observant travelers ask questions before booking?",
    questionHe: "מטיילים דוברי עברית או שומרי כשרות יכולים לשאול לפני הזמנה?",
    answerEn:
      "Yes. Send your dates, number of travelers, route interests, and food or kosher needs on WhatsApp. WIRO replies in Hebrew or English before payment pressure.",
    answerHe:
      "כן. שלחו בוואטסאפ תאריכים, מספר מטיילים, כיוון מסלול וצרכי אוכל או כשרות. WIRO עונה בעברית או באנגלית לפני לחץ לתשלום.",
  },
];

const HOMEPAGE_FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOMEPAGE_FAQS.map(item => ({
    "@type": "Question",
    name: item.questionEn,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answerEn,
    },
  })),
};

function HomeConversionFAQ() {
  const { t } = useLanguage();

  return (
    <section
      className="bg-background py-20 md:py-24"
      aria-labelledby="homepage-faq-heading"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="type-label text-accent">
            {t("Before you ask on WhatsApp", "לפני ששואלים בוואטסאפ")}
          </span>
          <h2
            id="homepage-faq-heading"
            className="type-headline mt-3 text-foreground dark:text-white"
          >
            {t(
              "Private Chiang Mai 4x4 tours, clarified before booking",
              "טיול ג׳יפים פרטי מצ׳אנג מאי, ברור לפני הזמנה"
            )}
          </h2>
          <div className="mx-auto mt-4 mb-8 h-[3px] w-16 bg-accent" />
          <p className="type-lede text-muted-foreground dark:text-white/60">
            {t(
              "Most guests want to know one thing first: will this route fit our dates, people, comfort level, and travel style? That is why WhatsApp comes before payment.",
              "רוב האורחים רוצים לדעת קודם דבר אחד: האם המסלול מתאים לתאריכים, לאנשים, לנוחות ולסגנון הטיול שלנו? לכן וואטסאפ מגיע לפני תשלום."
            )}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
          {HOMEPAGE_FAQS.map(item => (
            <article
              key={item.questionEn}
              className="rounded-sm border border-border bg-card p-5"
            >
              <h3 className="font-heading text-xl leading-snug text-foreground dark:text-white">
                {t(item.questionEn, item.questionHe)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground dark:text-white/60">
                {t(item.answerEn, item.answerHe)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta({
    title: "Chiang Mai Private 4x4 Tours | Hebrew and English | WIRO 4x4",
    appendBrandSuffix: false,
    description:
      "Private 4x4 adventures from Chiang Mai with Hebrew and English planning, kosher-friendly logistics, route ideas, and WhatsApp availability and price confirmation before booking.",
    canonicalPath: "/",
    jsonLd: HOMEPAGE_FAQ_JSON_LD,
  });
  return (
    <div className="min-h-screen smooth-scroll">
      <Header />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <SocialProofStrip />
        <ProductTiers />
        <TrustAndKosher />
        <GalleryShowcase />
        <HomeConversionFAQ />
        <QuickInquiryForm />
      </main>
      <Footer />
      <FloatingActionButtons />
      <StickyBookBar />
    </div>
  );
}
