import { useLanguage } from "@/contexts/LanguageContext";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  Award,
  MessageSquare,
  Calendar,
  Users,
  MapPin,
  Shield,
  Heart,
} from "lucide-react";

export function TrustAndKosher() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });

  const trustPoints = [
    {
      icon: Award,
      text: t(
        "First kosher-focused off-road company in Chiang Mai",
        "חברת טיולי השטח הכשרה הראשונה בצ'יאנג מאי"
      ),
    },
    {
      icon: MessageSquare,
      text: t(
        "Hebrew-speaking guides and support",
        "מדריכים דוברי עברית ותמיכה בעברית"
      ),
    },
    {
      icon: Calendar,
      text: t("Shabbat-friendly scheduling", "לוח זמנים מותאם לשומרי שבת"),
    },
    {
      icon: Users,
      text: t("Private premium 4x4 tours", "טיולי 4x4 פרטיים ומפנקים"),
    },
    {
      icon: MapPin,
      text: t(
        "Authentic trails, not tourist traps",
        "שבילים אותנטיים, לא מלכודות תיירים"
      ),
    },
    {
      icon: Heart,
      text: t(
        "Trusted by 120+ Israeli travelers",
        "מומלצים בקרב 120+ מטיילים ישראלים"
      ),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-background overflow-hidden"
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Image */}
          <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full min-h-[400px] rounded-sm overflow-hidden">
            <picture>
              <source
                srcSet="/images/optimized/1000000135.webp"
                type="image/webp"
              />
              <img
                src="/images/1000000135.jpg"
                alt={t("WIRO 4x4 off-road adventure", "הרפתקת שטח עם WIRO 4x4")}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </picture>
          </div>

          {/* Right: Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-foreground mb-4">
                {t("Why WIRO 4×4?", "?למה WIRO 4×4")}
              </h2>
              <GoldDivider />
              <p className="text-lg text-muted-foreground">
                {t(
                  "Authentic off-road adventures with the comfort and cultural understanding Israeli travelers deserve.",
                  "הרפתקאות שטח אמיתיות עם הנוחות וההבנה התרבותית שמגיעה למטיילים ישראלים."
                )}
              </p>
            </div>

            {/* Trust Points */}
            <div className="space-y-4">
              {trustPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-2 bg-[#D4AF37]/10 rounded-full">
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <span className="text-foreground">{point.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Kosher Summary */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-5 w-5 text-[#D4AF37]" />
                <h3 className="text-xl font-medium text-foreground">
                  {t("Kosher Standards", "סטנדרטים כשרים")}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  "Certified ingredient sourcing, dedicated kosher kitchen, sealed packaging, and strict separation. We accommodate all levels — from basic kosher to mehadrin standards. Non-kosher guests welcome too.",
                  "חומרי גלם מוסמכים, מטבח כשר ייעודי, אריזות אטומות והפרדה מלאה. מתאימים לכל רמות הכשרות — מכשרות רגילה ועד מהדרין. גם מי שלא שומר כשרות מוזמן."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
