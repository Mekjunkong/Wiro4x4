import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  ShoppingBasket,
  Package,
  Shield,
  Utensils,
  CheckCircle2,
  Info,
} from "lucide-react";

export function KosherInfo() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });

  const kosherFeatures = [
    {
      icon: ShoppingBasket,
      title: t("Ingredient Sourcing", "חומרי גלם מוסמכים"),
      description: t(
        "All ingredients are sourced from certified suppliers and carefully selected for kosher compliance.",
        "כל חומרי הגלם מגיעים מספקים בעלי הכשר ונבחרים בקפידה."
      ),
    },
    {
      icon: Utensils,
      title: t("Meal Preparation", "הכנת ארוחות"),
      description: t(
        "Meals are prepared in dedicated kosher facilities with strict separation and supervision.",
        "הארוחות מוכנות במטבחים כשרים ייעודיים, עם הפרדה מלאה ופיקוח קפדני."
      ),
    },
    {
      icon: Package,
      title: t("Storage & Packaging", "אחסון ואריזה"),
      description: t(
        "Sealed packaging and proper storage systems maintain kosher integrity throughout the journey.",
        "אריזות אטומות ואחסון מוקפד שומרים על הכשרות לאורך כל הטיול."
      ),
    },
    {
      icon: Shield,
      title: t("Contamination Prevention", "מניעת עירוב"),
      description: t(
        "Strict protocols ensure no cross-contamination with non-kosher items during transport and serving.",
        "נהלים קפדניים מבטיחים שאין עירוב עם מאכלים שאינם כשרים -- בהובלה ובהגשה."
      ),
    },
    {
      icon: CheckCircle2,
      title: t("Observance Levels", "כל רמות הכשרות"),
      description: t(
        "We accommodate different levels of observance - from basic kosher to mehadrin standards.",
        "מתאימים לכל רמות השמירה -- מכשרות רגילה ועד למהדרין."
      ),
    },
    {
      icon: Info,
      title: t("Non-Kosher Guests Welcome", "גם למי שלא שומר כשרות"),
      description: t(
        "Our fresh, clean, and disciplined kitchen serves high-quality meals for all dietary preferences.",
        "המטבח שלנו טרי, נקי ומקפיד -- ומגיש ארוחות ברמה גבוהה שמתאימות לכולם."
      ),
    },
  ];

  return (
    <section ref={sectionRef} id="kosher" className="py-24 md:py-32 bg-card">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-4xl md:text-5xl font-medium mb-6">
            {t("Kosher Logistics & Transparency", "כשרות -- איך זה עובד")}
          </h2>
          <GoldDivider />
          <p className="text-lg text-muted-foreground">
            {t(
              "We take kosher seriously. Here is exactly how we maintain kosher standards throughout your adventure.",
              "הכשרות חשובה לנו. כך אנחנו שומרים על הרמה לאורך כל הטיול."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {kosherFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-premium transition-all duration-300 bg-card"
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
                      <Icon className="h-6 w-6 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
