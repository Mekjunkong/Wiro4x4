import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { OptimizedImage } from "@/components/OptimizedImage";
import {
  Award,
  MessageSquare,
  MapPin,
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
      en: "Kosher-Aware 4x4 Planning",
      he: "תכנון 4x4 מודע כשרות",
      descEn: "Food and Shabbat logistics are agreed before route confirmation",
      descHe: "לוגיסטיקת אוכל ושבת נסגרת לפני אישור המסלול",
    },
    {
      icon: MessageSquare,
      en: "Hebrew Speaking Guides",
      he: "מדריכים דוברי עברית",
      descEn: "Plan and travel with Hebrew support when requested",
      descHe: "תכנון וטיול עם תמיכה בעברית לפי בקשה",
    },
    {
      icon: MapPin,
      en: "Private, Real Off-Road Routes",
      he: "מסלולי שטח אמיתיים ופרטיים",
      descEn: "Your vehicle, your group, and routes beyond standard tour stops",
      descHe: "הרכב והקבוצה שלכם, במסלולים שמעבר לתחנות התיירות הרגילות",
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
              <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
                {t("Why WIRO 4×4?", "?למה WIRO 4×4")}
              </h2>
              <GoldDivider className="mx-0 my-5" />
              <p className="text-lg text-muted-foreground">
                {t(
                  "Authentic off-road adventures with the comfort and cultural understanding Israeli travelers deserve.",
                  "הרפתקאות שטח אמיתיות עם הנוחות וההבנה התרבותית שמגיעה למטיילים ישראלים."
                )}
              </p>
            </div>

            <div className="border-y border-border divide-y divide-border">
              {trustPoints.map(point => (
                <div
                  key={point.en}
                  className="grid grid-cols-[2.75rem_1fr] gap-4 py-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center border border-accent/30 text-accent">
                    <point.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">
                      {t(point.en, point.he)}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t(point.descEn, point.descHe)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-sm border border-accent/35 bg-accent/10 p-5 text-sm leading-relaxed text-foreground">
              <div className="mb-2 flex items-center gap-2 font-heading text-lg font-bold">
                <ShieldCheck className="h-5 w-5 text-accent" />
                {t(
                  "Kosher support is built into the trip",
                  "הכשרות מובנית בתוך הטיול"
                )}
              </div>
              <p className="text-muted-foreground">
                {t(
                  "Meal logistics are confirmed before the trip: sourcing, packaging, handling, timing, and any Shabbat-sensitive routing are discussed with your group.",
                  "לוגיסטיקת הארוחות מאושרת לפני הטיול: מקור, אריזה, טיפול, תזמון וכל התאמת מסלול רגישה לשבת נבדקים מול הקבוצה."
                )}
              </p>
            </div>

            <div id="kosher" className="mt-8 border-t border-accent/30 pt-6">
              <button
                type="button"
                onClick={() => setKosherOpen(!kosherOpen)}
                aria-expanded={kosherOpen}
                aria-controls="kosher-logistics-details"
                className="flex items-center gap-2 w-full text-left font-heading text-xl font-bold focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-md"
              >
                <ShieldCheck className="w-6 h-6 text-accent" />
                {t("Kosher Standards & Logistics", "תקני כשרות ולוגיסטיקה")}
                <ChevronDown
                  className={`w-5 h-5 ml-auto transition-transform ${kosherOpen ? "rotate-180" : ""}`}
                />
              </button>
              {kosherOpen && (
                <div
                  id="kosher-logistics-details"
                  className="mt-4 text-muted-foreground leading-relaxed animate-fade-in"
                >
                  <p>
                    {t(
                      "Before confirming a route, we discuss your kosher level, food source, packaging, handling, serving plan, and Shabbat timing. Tell us what you require and we will confirm what is possible for that itinerary.",
                      "לפני אישור מסלול אנחנו בודקים את רמת הכשרות, מקור האוכל, האריזה, הטיפול, אופן ההגשה ותזמון שבת. ספרו לנו מה נדרש ונאשר מה אפשרי במסלול."
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
