import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactOptions } from "@/components/ContactOptions";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Link } from "wouter";
export default function Pricing() {
  const { t, language } = useLanguage();
  usePageMeta({
    title: t("Plan your trip", "תכננו את הטיול שלכם"),
    description: t(
      "Tell WIRO your dates, group size and interests for a personally planned Northern Thailand adventure.",
      "ספרו ל-WIRO על התאריכים, מספר המטיילים ותחומי העניין שלכם לתכנון אישי של הרפתקה בצפון תאילנד."
    ),
    canonicalPath: "/pricing",
  });
  return (
    <>
      <Header />
      <main
        id="main-content"
        dir={language === "he" ? "rtl" : "ltr"}
        className="container max-w-3xl pt-32 pb-20"
      >
        <h1 className="text-4xl font-heading mb-6">
          {t("A trip planned around you", "טיול שמתוכנן סביבכם")}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {t(
            "Every journey is different. Share your dates, group size, preferred route and any meal or accommodation needs. Our team will confirm availability and send a personalized proposal before you book.",
            "כל מסע שונה. שתפו אותנו בתאריכים, במספר המטיילים, במסלול המועדף ובצרכי הארוחות והלינה. הצוות יאשר זמינות וישלח הצעה אישית לפני ההזמנה."
          )}
        </p>
        <ContactOptions />
        <Link href="/tours" className="inline-block underline mt-8">
          {t("Explore our tours", "גלו את הטיולים שלנו")}
        </Link>
      </main>
      <Footer />
    </>
  );
}
