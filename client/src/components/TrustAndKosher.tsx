import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { WHATSAPP_URL } from "@/const";
import {
  ShieldCheck,
  ChevronDown,
  Compass,
  MessageSquare,
  Calendar,
  Users,
} from "lucide-react";

export function TrustAndKosher() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });
  const [kosherOpen, setKosherOpen] = useState(false);

  const trustPoints = [
    {
      icon: Compass,
      en: "A route with a point of view",
      he: "מסלול עם כיוון ברור",
      descEn:
        "Scenic off-road days shaped around your pace, not a rigid timetable.",
      descHe: "ימי שטח יפים שנבנים סביב הקצב שלכם, לא סביב לוח זמנים נוקשה.",
    },
    {
      icon: MessageSquare,
      en: "One conversation, start to finish",
      he: "שיחה אחת מההתחלה ועד הסוף",
      descEn: "Plan in English or Hebrew without having to repeat the details.",
      descHe: "מתכננים בעברית או באנגלית בלי לחזור על אותם פרטים שוב ושוב.",
    },
    {
      icon: Calendar,
      en: "Timing that works in real life",
      he: "תזמון שמתאים לחיים האמיתיים",
      descEn: "Pickup, meals, and breaks are coordinated ahead of time.",
      descHe: "איסוף, ארוחות והפסקות מתואמים מראש.",
    },
    {
      icon: Users,
      en: "Private, polished, personal",
      he: "פרטי, מוקפד, אישי",
      descEn:
        "Designed for families, couples, and small groups who want an easy day.",
      descHe: "מותאם למשפחות, זוגות וקבוצות קטנות שרוצות יום נוח וזורם.",
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
              <h2 className="type-headline text-foreground mb-4">
                {t("Why WIRO 4×4?", "?למה WIRO 4×4")}
              </h2>
              <GoldDivider />
              <p className="type-lede text-muted-foreground">
                {t(
                  "A private 4x4 journey built around smooth planning, local insight, and the kind of attention that makes the day feel effortless.",
                  "טיול 4x4 פרטי שנבנה סביב תכנון חלק, היכרות מקומית ותשומת לב שהופכת את היום לקל ונעים."
                )}
              </p>
              <div className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-foreground">
                    {t("Local office:", "משרד מקומי:")}
                  </span>{" "}
                  {t(
                    "Chang Klan Road, Chiang Mai",
                    "דרך צ'אנג קלאן, צ'יאנג מאי"
                  )}
                </p>
                <p>
                  <span className="font-semibold text-foreground">
                    {t("Before booking:", "לפני ההזמנה:")}
                  </span>{" "}
                  {t(
                    "route, meals, pickup, inclusions, and price are confirmed clearly.",
                    "מסלול, ארוחות, איסוף, מה כלול ומחיר מאושרים בצורה ברורה."
                  )}
                </p>
              </div>
            </div>

            {/* Trust Points — story-driven grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trustPoints.map(point => (
                <div
                  key={point.en}
                  className="flex items-start gap-3 p-4 rounded-xl bg-background/70 border border-border/60"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <point.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="type-title text-[1rem]">
                      {t(point.en, point.he)}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-[1.55]">
                      {t(point.descEn, point.descHe)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quiet reassurance */}
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 text-sm leading-relaxed text-foreground">
              <div className="mb-2 flex items-center gap-2 font-heading text-xl font-normal leading-tight">
                <ShieldCheck className="h-5 w-5 text-accent" />
                {t(
                  "Logistics handled quietly in the background",
                  "הלוגיסטיקה מטופלת בשקט מאחורי הקלעים"
                )}
              </div>
              <p className="text-muted-foreground">
                {t(
                  "Meals, sealed handling, and route timing are coordinated ahead of time so the trip feels polished from the first stop to the last.",
                  "הארוחות, הטיפול הנפרד ותזמון המסלול מתואמים מראש, כך שהטיול מרגיש מוקפד מהעצירה הראשונה ועד האחרונה."
                )}
              </p>
            </div>

            {/* Kosher details */}
            <div id="kosher" className="mt-8 border-t border-accent/30 pt-6">
              <button
                onClick={() => setKosherOpen(!kosherOpen)}
                className="flex items-center gap-2 w-full text-left font-heading text-2xl font-normal leading-tight"
              >
                <ShieldCheck className="w-6 h-6 text-accent" />
                {t("Kosher logistics", "לוגיסטיקת כשרות")}
                <ChevronDown
                  className={`w-5 h-5 ml-auto transition-transform ${kosherOpen ? "rotate-180" : ""}`}
                />
              </button>
              {kosherOpen && (
                <div className="mt-4 text-muted-foreground leading-relaxed animate-fade-in">
                  <p>
                    {t(
                      "We can coordinate ingredient sourcing, dedicated preparation, sealed packaging, and timing for guests who need kosher or mehadrin-level planning. Non-kosher guests are welcome too.",
                      "אנחנו יכולים לתאם מקורות חומרי גלם, הכנה ייעודית, אריזות אטומות ותזמון לאורחים הזקוקים לתכנון כשר או מהדרין. גם אורחים שאינם שומרי כשרות מוזמנים."
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild size="lg">
                <a href="#inquiry">{t("Plan your trip", "תכננו את הטיול")}</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  {t("Chat on WhatsApp", "כתבו לנו בוואטסאפ")}
                </a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              {t(
                "A short message is enough to start shaping the route.",
                "הודעה קצרה מספיקה כדי להתחיל לעצב את המסלול."
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
