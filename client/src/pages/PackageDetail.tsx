import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";

/** Placeholder — replaced in Task 8 with full package detail page. */
export default function PackageDetail() {
  const { t } = useLanguage();

  usePageMeta({
    title: t("Package Details | WIRO 4x4", "פרטי חבילה | WIRO 4x4"),
    description: t(
      "View tour package details and book your Chiang Mai adventure.",
      "צפו בפרטי חבילת הסיור והזמינו את ההרפתקה שלכם בצ'יאנג מאי."
    ),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        id="main-content"
        className="flex-1 container mx-auto px-4 py-16 text-center"
      >
        <h1 className="text-3xl font-bold text-primary mb-4">
          {t("Package Details", "פרטי החבילה")}
        </h1>
        <p className="text-muted-foreground">{t("Coming soon!", "בקרוב!")}</p>
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
