import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { OptimizedImage } from "@/components/OptimizedImage";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Link } from "wouter";
import {
  COMMERCIAL_LANDING_CONTENT,
  copyFor,
  type CommercialIntent,
  type CommercialLanguage,
} from "./commercialLandingContent";

interface CommercialLandingPageProps {
  intent: CommercialIntent;
  forcedLanguage?: CommercialLanguage;
}

export function CommercialLandingPage({
  intent,
  forcedLanguage,
}: CommercialLandingPageProps) {
  const { language: preferredLanguage } = useLanguage();
  const language = forcedLanguage ?? preferredLanguage;
  const content = COMMERCIAL_LANDING_CONTENT[intent];
  const oppositeLanguage = language === "he" ? "en" : "he";
  const Arrow = language === "he" ? ArrowLeft : ArrowRight;
  const canonicalPath = content.paths[forcedLanguage ?? "en"];
  const siblingGuides = Object.values(COMMERCIAL_LANDING_CONTENT).filter(
    sibling => sibling.intent !== intent
  );

  usePageMeta({
    title: copyFor(content.metaTitle, language),
    description: copyFor(content.metaDescription, language),
    canonicalPath,
    language: forcedLanguage ?? "en",
    alternates: {
      en: content.paths.en,
      he: content.paths.he,
      "x-default": content.paths.en,
    },
    ogImage: `https://www.wiro4x4indochina.com/images/optimized/${content.heroImage}.webp`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: copyFor(content.h1, language),
      description: copyFor(content.metaDescription, language),
      inLanguage: language,
      touristType: copyFor(content.audience, language),
      provider: {
        "@type": "TravelAgency",
        name: "WIRO 4x4",
        url: "https://www.wiro4x4indochina.com",
      },
    },
  });

  const detailRows = [
    {
      icon: Clock3,
      label: { en: "Duration", he: "משך" },
      value: content.duration,
    },
    {
      icon: Users,
      label: { en: "Private group", he: "קבוצה פרטית" },
      value: content.groupSize,
    },
    {
      icon: MapPin,
      label: { en: "Pickup", he: "איסוף" },
      value: content.pickup,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb items={[{ label: copyFor(content.h1, language) }]} />
      <main id="main-content">
        <section className="relative min-h-[72vh] overflow-hidden bg-primary text-white">
          <OptimizedImage
            src={content.heroImage}
            alt={copyFor(content.heroAlt, language)}
            className="absolute inset-0 h-full w-full object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/15" />
          <div className="container relative flex min-h-[72vh] items-end pb-14 pt-40 md:pb-20">
            <div className="max-w-4xl">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-accent">
                {copyFor(content.eyebrow, language)}
              </p>
              <h1 className="max-w-4xl text-4xl font-medium leading-[1.05] text-white md:text-6xl lg:text-7xl">
                {copyFor(content.h1, language)}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">
                {copyFor(content.intro, language)}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <TrackedWhatsAppLink
                  sourceCode={content.sourceCodes[language]}
                  humanMessage={copyFor(content.whatsappMessage, language)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="min-h-12 gap-2 bg-[#25D366] px-6 text-white hover:bg-[#20BA5A]"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    {copyFor(content.whatsappLabel, language)}
                  </Button>
                </TrackedWhatsAppLink>
                <Link
                  href={content.paths[oppositeLanguage]}
                  className="inline-flex min-h-11 items-center gap-2 border-b border-white/50 text-sm font-semibold text-white hover:border-accent hover:text-accent"
                  lang={oppositeLanguage}
                  hrefLang={oppositeLanguage}
                >
                  {language === "he"
                    ? "העמוד באנגלית"
                    : "Read this page in Hebrew"}
                  <Arrow className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card">
          <div className="container grid gap-px bg-border md:grid-cols-3">
            {detailRows.map(({ icon: Icon, label, value }) => (
              <div key={label.en} className="bg-card px-6 py-7 md:px-8">
                <div className="mb-3 flex items-center gap-2 text-accent">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em]">
                    {copyFor(label, language)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {copyFor(value, language)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
                {language === "he" ? "למי המסלול מתאים" : "Who this is for"}
              </p>
              <h2 className="mt-4 text-3xl font-medium md:text-4xl">
                {language === "he"
                  ? "היום נבנה סביב הקבוצה"
                  : "The day is built around the group"}
              </h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                {copyFor(content.audience, language)}
              </p>
              <div className="mt-8 border-s-2 border-accent ps-5">
                <p className="text-sm font-semibold">
                  {language === "he" ? "התאמה למשפחות" : "Family suitability"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {copyFor(content.familySuitability, language)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-5 border-b border-border pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
                    {language === "he" ? "דוגמאות למסלול" : "Route examples"}
                  </p>
                  <h2 className="mt-3 text-3xl font-medium">
                    {language === "he"
                      ? "שלוש דרכים לבנות את היום"
                      : "Three ways to shape the day"}
                  </h2>
                </div>
                <span className="hidden font-serif text-6xl text-accent/30 sm:block">
                  03
                </span>
              </div>
              <ol className="divide-y divide-border">
                {content.itinerary.map((item, index) => (
                  <li
                    key={item.title.en}
                    className="grid gap-4 py-6 sm:grid-cols-[3rem_1fr]"
                  >
                    <span className="font-mono text-sm text-accent">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {copyFor(item.title, language)}
                      </h3>
                      <p className="mt-2 leading-relaxed text-muted-foreground">
                        {copyFor(item.detail, language)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-muted/40 py-16 md:py-24">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="border-t-4 border-emerald-600 bg-card p-7 md:p-9">
                <h2 className="text-2xl font-medium">
                  {language === "he" ? "מה כלול" : "Included"}
                </h2>
                <ul className="mt-6 space-y-4">
                  {content.included.map(item => (
                    <li
                      key={item.en}
                      className="flex gap-3 text-sm leading-relaxed"
                    >
                      <Check
                        className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                      {copyFor(item, language)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t-4 border-amber-600 bg-card p-7 md:p-9">
                <h2 className="text-2xl font-medium">
                  {language === "he"
                    ? "לא כלול אלא אם אושר"
                    : "Not included unless confirmed"}
                </h2>
                <ul className="mt-6 space-y-4">
                  {content.excluded.map(item => (
                    <li
                      key={item.en}
                      className="flex gap-3 text-sm leading-relaxed"
                    >
                      <X
                        className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                        aria-hidden="true"
                      />
                      {copyFor(item, language)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 grid gap-8 border border-border bg-primary p-7 text-white md:grid-cols-[0.65fr_1.35fr] md:p-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
                  {language === "he" ? "מחיר התחלתי" : "Starting price"}
                </p>
                <p className="mt-3 text-2xl font-medium">
                  {copyFor(content.startingPrice, language)}
                </p>
              </div>
              <div className="border-t border-white/20 pt-6 md:border-s md:border-t-0 md:ps-8 md:pt-0">
                <div className="flex items-center gap-2 text-accent">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.18em]">
                    {language === "he"
                      ? "גבולות התכנון"
                      : "Planning boundaries"}
                  </h2>
                </div>
                <p className="mt-4 leading-relaxed text-white/80">
                  {copyFor(content.planningBoundary, language)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
                {language === "he" ? "מסלולים אמיתיים" : "Real route details"}
              </p>
              <h2 className="mt-3 text-3xl font-medium">
                {language === "he"
                  ? "בדקו את פרטי הטיול"
                  : "Inspect the tour before you ask"}
              </h2>
              <div className="mt-6 flex flex-col items-start gap-3">
                {content.relatedTours.map(tour => (
                  <Link
                    key={tour.href}
                    href={tour.href}
                    className="inline-flex items-center gap-2 font-semibold text-accent hover:underline"
                  >
                    {copyFor(tour.label, language)}
                    <Arrow className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="border-s border-border ps-7 md:ps-10">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
                {language === "he" ? "הוכחות מהשטח" : "Proof from the trail"}
              </p>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {language === "he"
                  ? "במקום עדויות מומצאות, צפו בתמונות מטיולי WIRO וקראו ביקורות ציבוריות של אורחים."
                  : "Instead of invented testimonials, inspect WIRO trip photography and public guest reviews."}
              </p>
              <div className="mt-5 flex flex-wrap gap-5">
                <Link
                  href="/gallery"
                  className="font-semibold text-accent hover:underline"
                >
                  {language === "he"
                    ? "גלריית טיולים אמיתית"
                    : "View the real trip gallery"}
                </Link>
                <Link
                  href="/reviews"
                  className="font-semibold text-accent hover:underline"
                >
                  {language === "he"
                    ? "ביקורות אורחים ציבוריות"
                    : "Read public guest reviews"}
                </Link>
              </div>
            </div>
          </div>
          <nav
            className="container mt-12 border-t border-border pt-8"
            aria-label={
              language === "he" ? "מדריכי תכנון נוספים" : "More planning guides"
            }
          >
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
              {language === "he"
                ? "תכננו לפי הצורך שלכם"
                : "Plan around another need"}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              {siblingGuides.map(sibling => (
                <Link
                  key={sibling.intent}
                  href={sibling.paths[language]}
                  className="inline-flex items-center gap-2 font-semibold hover:text-accent"
                >
                  {copyFor(sibling.h1, language)}
                  <Arrow className="h-4 w-4 text-accent" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </nav>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function HebrewLandingPage({
  intent,
}: {
  intent: CommercialIntent;
}) {
  return <CommercialLandingPage intent={intent} forcedLanguage="he" />;
}
