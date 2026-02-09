import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import {
  Check,
  Shield,
  Users,
  Calendar,
  MapPin,
  MessageSquare,
  Award,
  Heart,
} from "lucide-react";

export function WhyWiro() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Award,
      title: t(
        "First Kosher-Focused Off-Road Company",
        "חברת טיולי השטח הכשרה הראשונה"
      ),
      description: t(
        "The first and only kosher-focused off-road tour company in Chiang Mai",
        "הראשונים והיחידים שעושים טיולי שטח כשרים בצ'יאנג מאי"
      ),
    },
    {
      icon: MessageSquare,
      title: t("Hebrew Communication", "תקשורת בעברית"),
      description: t(
        "Hebrew-speaking guides and support available throughout your journey",
        "מדריכים דוברי עברית ותמיכה בעברית לכל אורך הטיול"
      ),
    },
    {
      icon: Calendar,
      title: t("Shabbat-Friendly Scheduling", "מותאם לשומרי שבת"),
      description: t(
        "Flexible scheduling that respects Shabbat and Jewish holidays",
        "לוח זמנים גמיש שמתחשב בשבת ובחגים"
      ),
    },
    {
      icon: Users,
      title: t("Private Premium Tours", "טיולים פרטיים ומפנקים"),
      description: t(
        "Exclusive private 4x4 tours tailored to your preferences",
        "טיולי 4x4 פרטיים, מותאמים בדיוק בשבילכם"
      ),
    },
    {
      icon: MapPin,
      title: t("Real Off-Road Adventures", "הרפתקאות שטח אמיתיות"),
      description: t(
        "Authentic trails and hidden gems, not tourist traps",
        "שבילים אותנטיים ואוצרות נסתרים, לא מלכודות תיירים"
      ),
    },
    {
      icon: MessageSquare,
      title: t("Responsive WhatsApp Support", "תמיכה מהירה בוואטסאפ"),
      description: t(
        "Quick responses and real-time support via WhatsApp",
        "מענה מהיר ותמיכה בזמן אמת דרך וואטסאפ"
      ),
    },
    {
      icon: Shield,
      title: t("Certified Guides", "מדריכים מוסמכים"),
      description: t(
        "Professional, certified guides with extensive local knowledge",
        "מדריכים מקצועיים ומוסמכים עם ידע מקומי נרחב"
      ),
    },
    {
      icon: Heart,
      title: t("Trusted by Israeli Travelers", "מטיילים ישראלים סומכים עלינו"),
      description: t(
        "Recommended and trusted by the Israeli travel community",
        "מומלצים בקרב מטיילים ישראלים"
      ),
    },
  ];

  return (
    <section id="why-wiro" className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            {t("Why Choose WIRO 4x4?", "למה לבחור ב-WIRO 4x4?")}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            {t(
              "We combine authentic off-road adventures with the comfort and cultural understanding that Israeli travelers deserve.",
              "משלבים הרפתקאות שטח אמיתיות עם הנוחות וההבנה התרבותית שמגיעה למטיילים ישראלים."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-premium transition-all duration-300 hover:-translate-y-1 bg-card"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
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
