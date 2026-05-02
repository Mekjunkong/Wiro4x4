import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { OptimizedImage } from "@/components/OptimizedImage";
import {
  Award,
  MessageSquare,
  Calendar,
  Users,
  MapPin,
  Heart,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

export function TrustAndKosher() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });
  const [kosherOpen, setKosherOpen] = useState(true);

  const trustPoints = [
    {
      icon: Award,
      en: "First Kosher 4x4 Company",
      he: "חברת 4x4 כשרה ראשונה",
      descEn: "Pioneer of kosher off-road in Chiang Mai",
      descHe: "חלוצי טיולי השטח הכשרים בצ'יאנג מאי",
    },
    {
      icon: MessageSquare,
      en: "Hebrew Speaking Guides",
      he: "מדריכים דוברי עברית",
      descEn: "Full Hebrew support throughout your trip",
      descHe: "תמיכה מלאה בעברית לאורך כל הטיול",
    },
    {
      icon: Calendar,
      en: "Shabbat Friendly",
      he: "מותאם לשבת",
      descEn: "Scheduling that respects Shabbat",
      descHe: "לוח זמנים המכבד את השבת",
    },
    {
      icon: Users,
      en: "Private Tours",
      he: "טיולים פרטיים",
      descEn: "Premium 4x4 experience, just your group",
      descHe: "חוויית 4x4 מפנקת, רק הקבוצה שלכם",
    },
    {
      icon: MapPin,
      en: "Real Off-Road",
      he: "שטח אמיתי",
      descEn: "Authentic trails, not tourist traps",
      descHe: "שבילים אותנטיים, לא מלכודות תיירים",
    },
    {
      icon: Heart,
      en: "WhatsApp Support",
      he: "תמיכה בוואטסאפ",
      descEn: "Quick responses, always available",
      descHe: "מענה מהיר, תמיד זמינים",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="why-wiro"
      className="py-16 md:py-20 bg-card overflow-hidden"
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Image */}
          <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full min-h-[400px] rounded-sm overflow-hidden">
            <OptimizedImage
              src="wiro_with_vehicle"
              alt={t("WIRO guide with 4x4 vehicle", "מדריך WIRO עם רכב שטח")}
              width={800}
              height={1000}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="w-full h-full object-cover"
            />
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

            {/* Trust Points — 2x3 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trustPoints.map(point => (
                <div
                  key={point.en}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <point.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {t(point.en, point.he)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t(point.descEn, point.descHe)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Kosher proof — visible before the details accordion */}
            <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm leading-relaxed text-foreground">
              <div className="mb-2 flex items-center gap-2 font-heading text-lg font-bold">
                <ShieldCheck className="h-5 w-5 text-accent" />
                {t(
                  "Kosher support is built into the trip",
                  "הכשרות מובנית בתוך הטיול"
                )}
              </div>
              <p className="text-muted-foreground">
                {t(
                  "Meals are planned in advance with sealed packaging, separate handling, and route timing that can respect Shabbat needs.",
                  "הארוחות מתוכננות מראש עם אריזות סגורות, טיפול נפרד ותזמון מסלול שיכול להתחשב בצרכי שבת."
                )}
              </p>
            </div>

            {/* Kosher Accordion */}
            <div id="kosher" className="mt-8 border-t border-accent/30 pt-6">
              <button
                onClick={() => setKosherOpen(!kosherOpen)}
                className="flex items-center gap-2 w-full text-left font-heading text-xl font-bold"
              >
                <ShieldCheck className="w-6 h-6 text-accent" />
                {t("Kosher Standards & Logistics", "תקני כשרות ולוגיסטיקה")}
                <ChevronDown
                  className={`w-5 h-5 ml-auto transition-transform ${kosherOpen ? "rotate-180" : ""}`}
                />
              </button>
              {kosherOpen && (
                <div className="mt-4 text-muted-foreground leading-relaxed animate-fade-in">
                  <p>
                    {t(
                      "Certified ingredient sourcing, dedicated kosher kitchen, sealed packaging, and strict separation. We accommodate all levels — from basic kosher to mehadrin standards. Non-kosher guests welcome too.",
                      "חומרי גלם מוסמכים, מטבח כשר ייעודי, אריזות אטומות והפרדה מלאה. מתאימים לכל רמות הכשרות — מכשרות רגילה ועד מהדרין. גם מי שלא שומר כשרות מוזמן."
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
