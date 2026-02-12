import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { CostCalculator } from "@/components/CostCalculator";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Calculator, Shield, Clock, Utensils } from "lucide-react";

export default function Estimate() {
  const { t } = useLanguage();
  usePageMeta(
    "Trip Cost Estimator",
    "Estimate the cost of your WIRO 4x4 kosher off-road tour in Chiang Mai. Select tours, group size, dates, and services for an instant price breakdown."
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 mt-20 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Calculator className="w-4 h-4" />
                {t("Instant Estimate", "הערכה מיידית")}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("Trip Cost Estimator", "מחשבון עלות טיול")}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {t(
                  "Build your dream trip and get an instant price estimate. Select tours, group size, and services below.",
                  "בנו את הטיול החלומי שלכם וקבלו הערכת מחיר מיידית. בחרו טיולים, גודל קבוצה ושירותים למטה."
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>{t("No commitment", "ללא התחייבות")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{t("Instant results", "תוצאות מיידיות")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  <span>{t("All-inclusive pricing", "מחיר כולל הכל")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section className="py-12 md:py-16">
          <div className="container max-w-2xl">
            <CostCalculator />
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
