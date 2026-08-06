import { Breadcrumb } from "@/components/Breadcrumb";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { Footer } from "@/components/Footer";
import { GoldDivider } from "@/components/GoldDivider";
import { Header } from "@/components/Header";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WHATSAPP_URL } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  Calendar,
  Languages,
  Map,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { Link } from "wouter";

const ABOUT_DESCRIPTION =
  "Meet Wiro, founder and primary guide of WIRO 4x4. A fluent Hebrew speaker with extensive experience guiding Israeli travelers on private Chiang Mai 4x4 tours.";

const ABOUT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://www.wiro4x4indochina.com/about#webpage",
  url: "https://www.wiro4x4indochina.com/about",
  name: "About Wiro — Local Chiang Mai 4x4 Guide",
  description: ABOUT_DESCRIPTION,
  isPartOf: {
    "@id": "https://www.wiro4x4indochina.com/#website",
  },
  about: {
    "@id": "https://www.wiro4x4indochina.com/about#wiro",
  },
  inLanguage: ["en", "he"],
  mainEntity: {
    "@type": "Person",
    "@id": "https://www.wiro4x4indochina.com/about#wiro",
    name: "Wiro",
    jobTitle: "Founder & Primary Guide",
    knowsLanguage: ["he"],
    worksFor: {
      "@id": "https://www.wiro4x4indochina.com/#organization",
    },
  },
};

export default function About() {
  const { language, t } = useLanguage();

  usePageMeta({
    title: t(
      "About Wiro — Local Chiang Mai 4x4 Guide",
      "אודות וירו — מדריך 4x4 מקומי בצ'יאנג מאי"
    ),
    description: t(
      ABOUT_DESCRIPTION,
      "הכירו את וירו, המייסד והמדריך הראשי של WIRO 4x4, דובר עברית שוטפת ובעל ניסיון רב בהדרכת מטיילים ישראלים בטיולי 4x4 פרטיים בצ'יאנג מאי."
    ),
    canonicalPath: "/about",
    ogImage:
      "https://www.wiro4x4indochina.com/images/optimized/guide_wiro.webp",
    jsonLd: ABOUT_JSON_LD,
  });

  const whatsappMessage = encodeURIComponent(
    t(
      "Hi Wiro! I'd like help planning a private 4x4 tour from Chiang Mai.",
      "היי וירו! אשמח לעזרה בתכנון טיול 4x4 פרטי מצ'יאנג מאי."
    )
  );

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb items={[{ label: t("About", "אודות") }]} />
      <main id="main-content">
        <section className="relative min-h-[55vh] overflow-hidden">
          <OptimizedImage
            src="guide_wiro"
            alt={t(
              "Wiro, founder and primary guide of WIRO 4x4, in a 4x4 vehicle",
              "וירו, המייסד והמדריך הראשי של WIRO 4x4, ברכב 4x4"
            )}
            className="absolute inset-0 h-full w-full object-cover object-center"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/45 to-primary/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <div className="container max-w-4xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent">
                <UserRound className="h-4 w-4" aria-hidden="true" />
                {t("Founder & Primary Guide", "מייסד ומדריך ראשי")}
              </div>
              <h1 className="mb-4 text-4xl font-medium text-white md:text-5xl">
                {t(
                  "About Wiro — Local Chiang Mai 4x4 Guide",
                  "אודות וירו — מדריך 4x4 מקומי בצ'יאנג מאי"
                )}
              </h1>
              <p className="max-w-2xl text-lg text-white/90 md:text-xl">
                {t(
                  "Meet the founder and primary guide for most WIRO 4x4 tours.",
                  "הכירו את המייסד והמדריך הראשי ברוב הטיולים של WIRO 4x4."
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container max-w-5xl">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="mb-3 text-3xl font-medium md:text-4xl">
                  {t("Meet Wiro", "הכירו את וירו")}
                </h2>
                <GoldDivider className="mx-0" />
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  {t(
                    "Wiro founded WIRO 4x4 and serves as the primary guide for most tours. He speaks fluent Hebrew and has extensive experience guiding Israeli travelers, helping Hebrew-speaking guests understand the places and practical details along the route.",
                    "וירו ייסד את WIRO 4x4 ומשמש כמדריך הראשי ברוב הטיולים. הוא דובר עברית שוטפת ובעל ניסיון רב בהדרכת מטיילים ישראלים, ומסייע לאורחים דוברי עברית להבין את המקומות ואת הפרטים המעשיים לאורך המסלול."
                  )}
                </p>
              </div>
              <div className="grid gap-4">
                <Card className="flex items-start gap-4 rounded-sm p-6">
                  <Languages
                    className="mt-1 h-6 w-6 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {t("Fluent Hebrew", "עברית שוטפת")}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t(
                        "Clear communication for Hebrew-speaking travelers throughout the tour.",
                        "תקשורת ברורה למטיילים דוברי עברית לאורך הטיול."
                      )}
                    </p>
                  </div>
                </Card>
                <Card className="flex items-start gap-4 rounded-sm p-6">
                  <Map
                    className="mt-1 h-6 w-6 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {t(
                        "Primary Guide for Most Tours",
                        "המדריך הראשי ברוב הטיולים"
                      )}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t(
                        "Wiro personally serves as the primary guide on most WIRO 4x4 routes.",
                        "וירו משמש באופן אישי כמדריך הראשי ברוב המסלולים של WIRO 4x4."
                      )}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div>
                <h2 className="text-3xl font-medium md:text-4xl">
                  {t("What WIRO 4x4 Stands For", "הדרך של WIRO 4x4")}
                </h2>
                <GoldDivider className="mx-0" />
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t(
                  "WIRO focuses on private tours, Hebrew-first support when requested, and WhatsApp-first planning. Scheduling can account for Shabbat needs; because of its remote location, Mae Wang is the only tour not scheduled on Shabbat.",
                  "WIRO מתמקדת בטיולים פרטיים, בתמיכה בעברית לפי בקשה ובתכנון שמתחיל בוואטסאפ. אפשר להתחשב בצרכי שבת בתכנון; בגלל מיקומו המרוחק, מאה וואנג הוא הטיול היחיד שאינו מתוזמן בשבת."
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container max-w-5xl text-center">
            <h2 className="text-3xl font-medium md:text-4xl">
              {t("Tours Wiro Guides", "הטיולים שוירו מדריך")}
            </h2>
            <GoldDivider />
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {t(
                "Compare the complete Chiang Mai 4x4 tour collection, including the private Doi Inthanon and Mae Wang routes.",
                "השוו בין כל טיולי ה-4x4 בצ'יאנג מאי, כולל המסלולים הפרטיים לדוי אינתנון ולמאה וואנג."
              )}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/tours"
                className="rounded-full border border-accent/40 px-4 py-2 text-sm font-medium hover:bg-accent/10"
              >
                {t("All Chiang Mai 4x4 Tours", "כל טיולי ה-4x4 בצ'יאנג מאי")}
              </Link>
              <Link
                href="/tours/doi-inthanon-roof-of-thailand"
                className="rounded-full border border-accent/40 px-4 py-2 text-sm font-medium hover:bg-accent/10"
              >
                {t("Doi Inthanon", "דוי אינתנון")}
              </Link>
              <Link
                href="/tours/mae-wang-jungle-wilderness"
                className="rounded-full border border-accent/40 px-4 py-2 text-sm font-medium hover:bg-accent/10"
              >
                {t("Mae Wang", "מאה וואנג")}
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card py-16 md:py-20">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl font-medium md:text-4xl">
              {t(
                "Hebrew-Speaking & Israeli Traveler Support",
                "תמיכה בעברית ולמטיילים ישראלים"
              )}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl leading-relaxed text-muted-foreground">
              {t(
                "Learn how to confirm Hebrew-speaking guide availability and coordinate kosher-friendly logistics for your private group.",
                "קראו איך לאשר זמינות של מדריך דובר עברית ולתאם לוגיסטיקה ידידותית לכשרות עבור הקבוצה הפרטית שלכם."
              )}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-6">
              <Link
                href={
                  language === "he"
                    ? "/he/hebrew-guide-chiang-mai"
                    : "/hebrew-guide"
                }
                className="font-semibold text-accent hover:underline"
              >
                {t("Hebrew-guide planning", "תכנון עם מדריך בעברית")}
              </Link>
              <Link
                href={
                  language === "he"
                    ? "/he/kosher-tours-chiang-mai"
                    : "/kosher-tours"
                }
                className="font-semibold text-accent hover:underline"
              >
                {t("Kosher-friendly planning", "תכנון ידידותי לכשרות")}
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-primary py-16 text-primary-foreground md:py-24">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl font-medium md:text-4xl">
              {t("Plan Your Tour with Wiro", "תכננו את הטיול שלכם עם וירו")}
            </h2>
            <p className="mb-8 mt-4 text-lg text-primary-foreground/80">
              {t(
                "Share your group details and route interests to start planning a private Chiang Mai 4x4 tour.",
                "שתפו את פרטי הקבוצה והמסלולים שמעניינים אתכם כדי להתחיל לתכנן טיול 4x4 פרטי בצ'יאנג מאי."
              )}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full gap-2 sm:w-auto"
              >
                <a
                  href={`${WHATSAPP_URL}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  {t("Chat on WhatsApp", "שלחו הודעה בוואטסאפ")}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground sm:w-auto"
              >
                <Link href="/book">
                  <Calendar className="h-5 w-5" aria-hidden="true" />
                  {t("Book a Tour", "הזמינו טיול")}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
