import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { GoldDivider } from "@/components/GoldDivider";
import { CostCalculator } from "@/components/CostCalculator";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Calculator, Shield, Clock, Utensils } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PackageBuilder } from "@/components/PackageBuilder";

export default function Estimate() {
  const { t } = useLanguage();
  usePageMeta({
    title: "Trip Cost Estimator",
    description:
      "Estimate the cost of your WIRO 4x4 kosher off-road tour in Chiang Mai. Select tours, group size, dates, and services for an instant price breakdown.",
    canonicalPath: "/estimate",
  });

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb
        items={[
          {
            label: t(
              "Cost Estimator",
              "\u05DE\u05D7\u05E9\u05D1\u05D5\u05DF \u05E2\u05DC\u05D5\u05D9\u05D5\u05EA"
            ),
          },
        ]}
      />
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 mt-20 bg-gradient-to-br from-accent/5 to-accent/10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Calculator className="w-4 h-4" />
                {t("Instant Estimate", "הערכה מיידית")}
              </div>
              <h1 className="text-4xl md:text-5xl font-medium mb-4">
                {t("Trip Cost Estimator", "מחשבון עלות טיול")}
              </h1>
              <GoldDivider />
              <p className="text-lg text-muted-foreground mb-6">
                {t(
                  "Build your dream trip and get an instant price estimate. Select tours, group size, and services below.",
                  "בנו את הטיול החלומי שלכם וקבלו הערכת מחיר מיידית. בחרו טיולים, גודל קבוצה ושירותים למטה."
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  <span>{t("No commitment", "ללא התחייבות")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  <span>{t("Instant results", "תוצאות מיידיות")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-accent" />
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

        {/* Package Builder */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <PackageBuilder />
        </div>
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
