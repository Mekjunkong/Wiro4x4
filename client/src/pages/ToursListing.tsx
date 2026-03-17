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
    title: t(
      "One-Day Tours in Chiang Mai | WIRO 4x4",
      "טיולי יום בצ'יאנג מאי | WIRO 4x4"
    ),
    description: t(
      "Choose from 6 unique off-road day tours in Chiang Mai. Doi Inthanon, Mae Kampong, Sticky Waterfalls, Doi Suthep, Mae Wang, and Samoeng Loop.",
      "בחרו מ-6 טיולי שטח ייחודיים ביום אחד בצ'יאנג מאי. דוי אינטנון, מאה קמפונג, מפלים דביקים, דוי סוטפ, מאה וואנג ולולאת סמואנג."
    ),
    canonicalPath: "/tours",
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
              {t("One-Day Adventures", "טיולי יום")}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
              {t(
                "Explore Chiang Mai's most stunning destinations in a full day of off-road adventure. Each tour departs early morning and returns by evening.",
                "חקרו את היעדים המרהיבים ביותר של צ'יאנג מאי ביום שלם של הרפתקת שטח. כל טיול יוצא מוקדם בבוקר וחוזר עד הערב."
              )}
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
