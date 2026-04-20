import { useLanguage } from "@/contexts/LanguageContext";
import { Check, X, Zap, Mountain, Trophy } from "lucide-react";

const PLANS = [
  {
    id: "explorer",
    icon: Zap,
    nameEn: "Explorer Run",
    nameTh: "เอ็กซ์พลอเรอร์ รัน",
    nameHe: "ריצת המגלה",
    taglineEn: "Perfect for first-timers",
    taglineTh: "เหมาะสำหรับมือใหม่",
    taglineHe: "מושלם למתחילים",
    priceEn: "฿2,900",
    priceTh: "฿2,900",
    priceHe: "₪2,900",
    unitEn: "per person",
    unitTh: "ต่อคน",
    unitHe: "לאדם",
    descriptionEn:
      "A full-day off-road adventure through Chiang Mai's best trails. Waterfalls, mountain views, and authentic local experiences.",
    descriptionTh:
      "ผจญภัยขับขี่ออฟรอดเต็มวันผ่านเส้นทางที่ดีที่สุดของเชียงใหม่ ชมน้ำตก วิวภูเขา และสัมผัสวิถีชีวิตท้องถิ่น",
    descriptionHe:
      "הרפתקת שטח מלאה ביום אחד דרך המסלולים הטובים ביותר של צ'יאנג מאי. מפלים, נופי הרים וחוויות מקומיות אותנטיות.",
    features: [
      {
        textEn: "Private 4x4 vehicle",
        textTh: "รถ 4x4 ส่วนตัวพร้อมไดรเวอร์",
        textHe: "רכב 4x4 פרטי עם נהג",
        included: true,
      },
      {
        textEn: "Hebrew-speaking guide",
        textTh: "ไกด์พูดภาษา Hebrew",
        textHe: "מדריך דובר עברית",
        included: true,
      },
      {
        textEn: "Kosher packed lunch",
        textTh: "อาหารกลางวันเคเชอร์แบบเดินทาง",
        textHe: "ארוחת צהריים כשרה ארוזה",
        included: true,
      },
      {
        textEn: "Water & snacks",
        textTh: "น้ำและขนม",
        textHe: "מים וחטיפים",
        included: true,
      },
      {
        textEn: "Insurance coverage",
        textTh: "ประกันภัย",
        textHe: "כיסוי ביטוחי",
        included: true,
      },
      {
        textEn: "Photo stops",
        textTh: "จุดถ่ายรูป",
        textHe: "עצירות צילום",
        included: true,
      },
      {
        textEn: "Overnight stay",
        textTh: "ที่พักค้างคืน",
        textHe: "לינה לילה",
        included: false,
      },
      {
        textEn: "Multi-day routes",
        textTh: "เส้นทางหลายวัน",
        textHe: "מסלולים רב-יומיים",
        included: false,
      },
    ],
    ctaEn: "Book Explorer Run",
    ctaTh: "จอง Explorer Run",
    ctaHe: "הזמינו Explorer Run",
    popular: false,
    accent: "from-slate-500 to-gray-600",
    accentBg: "bg-slate-50 dark:bg-slate-950/30",
    accentBorder: "border-slate-200 dark:border-slate-800",
    accentText: "text-slate-600 dark:text-slate-300",
  },
  {
    id: "barbarian",
    icon: Mountain,
    nameEn: "Barbarian Run",
    nameTh: "บาร์บาเรียน รัน",
    nameHe: "ריצת הברברי",
    taglineEn: "Most popular choice",
    taglineTh: "ตัวเลือกยอดนิยม",
    taglineHe: "הבחירה הפופולרית ביותר",
    priceEn: "฿8,900",
    priceTh: "฿8,900",
    priceHe: "₪8,900",
    unitEn: "per person",
    unitTh: "ต่อคน",
    unitHe: "לאדם",
    descriptionEn:
      "2-day / 1-night extreme off-road experience. River crossings, mountain passes, and campfire dinner under the stars.",
    descriptionTh:
      "ประสบการณ์ออฟรอดหนัก 2 วัน 1 คืน ข้ามแม่น้ำ ลุยผ่านสันเขา และดินเนอร์รอบไฟแคมป์ใต้แสงดาว",
    descriptionHe:
      "חוויית שטח קיצונית 2 ימים / לילה 1. חציית נהרות, מעברי הרים וארוחת ערב ליד המדורה תחת כוכבים.",
    features: [
      {
        textEn: "Private 4x4 vehicle",
        textTh: "รถ 4x4 ส่วนตัวพร้อมไดรเวอร์",
        textHe: "רכב 4x4 פרטי עם נהג",
        included: true,
      },
      {
        textEn: "Hebrew-speaking guide",
        textTh: "ไกด์พูดภาษา Hebrew",
        textHe: "מדריך דובר עברית",
        included: true,
      },
      {
        textEn: "Kosher meals (breakfast + dinner)",
        textTh: "อาหารเคเชอร์ (เช้า + เย็น)",
        textHe: "ארוחות כשרות (בוקר + ערב)",
        included: true,
      },
      {
        textEn: "Water & snacks all day",
        textTh: "น้ำและขนมตลอดวัน",
        textHe: "מים וחטיפים כל היום",
        included: true,
      },
      {
        textEn: "Insurance coverage",
        textTh: "ประกันภัย",
        textHe: "כיסוי ביטוחי",
        included: true,
      },
      {
        textEn: "Photo stops + drone moments",
        textTh: "จุดถ่ายรูป + ถ่ายดรอน",
        textHe: "עצירות צילום + רגעי דרון",
        included: true,
      },
      {
        textEn: "Overnight at mountain lodge",
        textTh: "ค้างคืนที่ลอดจ์บนภูเขา",
        textHe: "לינה בלודג' הררי",
        included: true,
      },
      {
        textEn: "Multi-day routes",
        textTh: "เส้นทางหลายวัน",
        textHe: "מסלולים רב-יומיים",
        included: false,
      },
    ],
    ctaEn: "Book Barbarian Run",
    ctaTh: "จอง Barbarian Run",
    ctaHe: "הזמינו Barbarian Run",
    popular: true,
    accent: "from-amber-500 to-orange-600",
    accentBg: "bg-amber-50 dark:bg-amber-950/30",
    accentBorder: "border-amber-300 dark:border-amber-800",
    accentText: "text-amber-700 dark:text-amber-300",
  },
  {
    id: "summit",
    icon: Trophy,
    nameEn: "Summit Expedition",
    nameTh: "ซัมมิท เอ็กซ์พีดิชั่น",
    nameHe: "מסע הפסגה",
    taglineEn: "The ultimate adventure",
    taglineTh: "การผจญภัยสุดยอด",
    taglineHe: "ההרפתקה האולטימטיבית",
    priceEn: "฿18,900",
    priceTh: "฿18,900",
    priceHe: "₪18,900",
    unitEn: "per person",
    unitTh: "ต่อคน",
    unitHe: "לאדם",
    descriptionEn:
      "3-day / 2-night expedition deep into Northern Thailand's most remote trails. Chiang Rai temples, mountain peaks, and border crossings.",
    descriptionTh:
      "การเดินทาง 3 วัน 2 คืนเข้าสู่เส้นทางห่างไกลที่สุดของเหนือประเทศไทย วัดในเชียงราย ยอดเขา และข้ามพรมแดน",
    descriptionHe:
      "מסע של 3 ימים / 2 לילות אל תוך השבילים המרוחקים ביותר של צפון תאילנד. מקדשי צ'יאנג ראי, פסגות הרים וחציית גבולות.",
    features: [
      {
        textEn: "Private 4x4 vehicle",
        textTh: "รถ 4x4 ส่วนตัวพร้อมไดรเวอร์",
        textHe: "רכב 4x4 פרטי עם נהג",
        included: true,
      },
      {
        textEn: "Hebrew-speaking guide",
        textTh: "ไกด์พูดภาษา Hebrew",
        textHe: "מדריך דובר עברית",
        included: true,
      },
      {
        textEn: "All kosher meals included",
        textTh: "อาหารเคเชอร์ทุกมื้อ",
        textHe: "כל הארוחות כשרות",
        included: true,
      },
      {
        textEn: "Premium accommodation",
        textTh: "ที่พักระดับพรีเมียม",
        textHe: "לינה פרימיום",
        included: true,
      },
      {
        textEn: "Insurance + emergency support",
        textTh: "ประกัน + สนับสนุนฉุกเฉิน",
        textHe: "ביטוח + תמיכה חירום",
        included: true,
      },
      {
        textEn: "Photo + video documentation",
        textTh: "ถ่ายภาพ + วิดีโอ",
        textHe: "תיעוד תמונות + וידאו",
        included: true,
      },
      {
        textEn: "Border crossing experience",
        textTh: "ประสบการณ์ข้ามพรมแดน",
        textHe: "חוויית חציית גבול",
        included: true,
      },
      {
        textEn: "Multi-day routes",
        textTh: "เส้นทางหลายวัน",
        textHe: "מסלולים רב-יומיים",
        included: true,
      },
    ],
    ctaEn: "Book Summit Expedition",
    ctaTh: "จอง Summit Expedition",
    ctaHe: "הזמינו Summit Expedition",
    popular: false,
    accent: "from-emerald-500 to-teal-600",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/30",
    accentBorder: "border-emerald-200 dark:border-emerald-800",
    accentText: "text-emerald-700 dark:text-emerald-300",
  },
];

export function PricingSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-accent text-xs font-bold tracking-[0.3em] uppercase block mb-3">
            {t(
              "Choose Your Experience",
              "เลือกประสบการณ์ของคุณ",
              "בחרו את החוויה שלכם"
            )}
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground dark:text-white">
            {t("Off-Road Adventures", "ผจญภัยออฟรอด", "הרפתקאות שטח")}
          </h2>
          <div className="w-16 h-[3px] bg-accent mx-auto mt-4 mb-6" />
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            {t(
              "Three tiers of adventure — from a single-day thrill to the ultimate multi-day expedition. All include private 4x4, Hebrew guide, and kosher meals.",
              "สามระดับของการผจญภัย — ตั้งแต่ความตื่นเต้นวันเดียวจนถึงการเดินทางหลายวันสุดพิเศษ ทั้งหมดมีรถ 4x4 ส่วนตัว ไกด์ Hebrew และอาหารเคเชอร์",
              "שלוש רמות של הרפתקה — מריגוש של יום אחד ועד מסע רב-יומי אולטימטיבי. הכל כולל רכב 4x4 פרטי, מדריך דובר עברית וארוחות כשרות."
            )}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {PLANS.map(plan => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 overflow-hidden flex flex-col ${
                  plan.popular
                    ? "border-accent shadow-xl shadow-accent/10 dark:border-amber-400 dark:shadow-amber-400/10"
                    : `${plan.accentBorder} shadow-sm`
                } ${plan.accentBg}`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 text-center tracking-widest uppercase">
                    {t("Most Popular", "ยอดนิยม", "הכי פופולרי")}
                  </div>
                )}

                {/* Plan header */}
                <div className="p-6 lg:p-8">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.accent} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="mb-1">
                    <span
                      className={`text-xs font-bold tracking-widest uppercase ${plan.accentText}`}
                    >
                      {t(plan.taglineEn, plan.taglineTh, plan.taglineHe)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-foreground dark:text-white mb-3">
                    {t(plan.nameEn, plan.nameTh, plan.nameHe)}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-4xl font-heading font-black text-foreground dark:text-white">
                      {t(plan.priceEn, plan.priceTh, plan.priceHe)}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      / {t(plan.unitEn, plan.unitTh, plan.unitHe)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(
                      plan.descriptionEn,
                      plan.descriptionTh,
                      plan.descriptionHe
                    )}
                  </p>
                </div>

                {/* Divider */}
                <div
                  className={`h-px mx-6 ${plan.popular ? "bg-amber-200 dark:bg-amber-700" : "bg-border"}`}
                />

                {/* Features */}
                <div className="p-6 lg:p-8 flex-1 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          feature.included
                            ? "bg-emerald-100 dark:bg-emerald-900/40"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        {feature.included ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <X className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-foreground dark:text-white"
                            : "text-muted-foreground/50 line-through"
                        }`}
                      >
                        {t(feature.textEn, feature.textTh, feature.textHe)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="p-6 lg:p-8 pt-0">
                  <a
                    href={`https://wa.me/66929894495?text=${encodeURIComponent(
                      t(
                        `Hi WIRO 4x4! I'm interested in the ${plan.nameEn} (${plan.priceEn}/person). Can you tell me more?`,
                        `สวัสดี WIRO 4x4! สนใจ ${plan.nameTh} (${plan.priceTh}/คน) บอกรายละเอียดหน่อยได้ไหม?`,
                        `היי WIRO 4x4! מתעניין ב${plan.nameHe} (${plan.priceHe}/אדם). אפשר פרטים?`
                      )
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center font-bold py-3.5 px-6 rounded-xl transition-all duration-300 ${
                      plan.popular
                        ? "bg-accent-cta hover:bg-accent-cta-hover text-white shadow-lg hover:shadow-xl"
                        : "bg-foreground dark:bg-white text-background hover:bg-accent-cta hover:text-white"
                    }`}
                  >
                    {t(plan.ctaEn, plan.ctaTh, plan.ctaHe)}
                  </a>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    {t(
                      "Free cancellation up to 48h before",
                      "ยกเลิกฟรีภายใน 48 ชม. ก่อนออกเดินทาง",
                      "ביטול חינם עד 48 שעות לפני"
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground mt-10 max-w-2xl mx-auto">
          {t(
            "All prices in THB. Prices may vary during peak season (Nov–Feb) and Jewish holidays. Private group bookings (2–7 guests) — no sharing with strangers.",
            "ราคาทั้งหมดเป็น THB ราคาอาจเปลี่ยนแปลงในช่วงไฮซีซั่น (พ.ย.–ก.พ.) และเทศกาลของชาวยิว รับจองกลุ่มส่วนตัว (2–7 คน) — ไม่รับแขกร่วม",
            "כל המחירים ב-THB. המחירים עשויים להשתנות בעונה הגבוהה (נוב–פבר) ובחגים יהודיים. הזמנות קבוצה פרטית (2–7 אורחים) — ללא שיתוף עם זרים."
          )}
        </p>
      </div>
    </section>
  );
}
