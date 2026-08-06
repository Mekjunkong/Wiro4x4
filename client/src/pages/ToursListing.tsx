import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { Tours } from "@/components/Tours";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function ToursListing() {
  const { t } = useLanguage();

  usePageMeta({
    title: t("Chiang Mai 4x4 Tours", "טיולי 4x4 בצ'יאנג מאי"),
    description: t(
      "Choose from 6 unique off-road day tours in Chiang Mai. Doi Inthanon, Mae Kampong, Sticky Waterfalls, Doi Suthep, Mae Wang, and Samoeng Loop.",
      "בחרו מ-6 טיולי שטח ייחודיים ביום אחד בצ'יאנג מאי. דוי אינטנון, מאה קמפונג, מפלים דביקים, דוי סוטפ, מאה וואנג ולולאת סמואנג."
    ),
    canonicalPath: "/tours",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "https://www.wiro4x4indochina.com/tours#webpage",
      url: "https://www.wiro4x4indochina.com/tours",
      name: "Chiang Mai 4x4 Tours",
      description:
        "Private 4x4 day tours from Chiang Mai to mountain, jungle, waterfall, and village destinations across Northern Thailand.",
      isPartOf: {
        "@id": "https://www.wiro4x4indochina.com/#website",
      },
      about: {
        "@id": "https://www.wiro4x4indochina.com/#organization",
      },
      inLanguage: ["en", "he"],
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-background to-white dark:from-background dark:to-card pt-36 pb-8">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <Breadcrumb items={[{ label: t("One-Day Tours", "טיולי יום") }]} />
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-accent hover:underline mt-2 mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t("All Adventures", "כל ההרפתקאות")}
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary dark:text-primary-foreground">
              {t("Chiang Mai 4x4 Tours", "טיולי 4x4 בצ'יאנג מאי")}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
              {t(
                "Explore Northern Thailand on a private Chiang Mai 4x4 tour, with mountain, jungle, waterfall, and village routes for different interests and group needs.",
                "גלו את צפון תאילנד בטיול 4x4 פרטי מצ'יאנג מאי, עם מסלולי הרים, ג'ונגל, מפלים וכפרים שמתאימים לתחומי עניין ולקבוצות שונות."
              )}
            </p>
            <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
              {t(
                "Start with the high mountain landscapes of ",
                "התחילו בנופי ההרים הגבוהים של "
              )}
              <Link
                href="/tours/doi-inthanon-roof-of-thailand"
                className="text-accent font-medium hover:underline"
              >
                {t("Doi Inthanon", "דוי אינתנון")}
              </Link>
              {t(
                " or compare them with the jungle and river route in ",
                " או השוו אותם למסלול הג'ונגל והנהרות של "
              )}
              <Link
                href="/tours/mae-wang-jungle-wilderness"
                className="text-accent font-medium hover:underline"
              >
                {t("Mae Wang", "מאה וואנג")}
              </Link>
              {t(".", ".")}
            </p>
          </div>
        </section>

        {/* Tours grid */}
        <Tours />
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
