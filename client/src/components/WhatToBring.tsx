import { useLanguage } from "@/contexts/LanguageContext";
import {
  Backpack,
  Sun,
  Cloud,
  Umbrella,
  Wind,
  Shirt,
  Moon,
  Camera,
  Zap,
  Utensils,
  Shield,
  Droplets,
  DollarSign,
  Smartphone,
} from "lucide-react";

const CATEGORIES = [
  {
    id: "day",
    icon: Sun,
    labelEn: "Day Tour Essentials",
    labelTh: "อุปกรณ์จำเป็นสำหรับเที่ยววัน",
    labelHe: "ציוד חובה לטיול יום",
    items: [
      {
        icon: Shirt,
        textEn: "Light breathable clothing",
        textTh: "เสื้อผ้าสบายๆ ระบายอากาศดี",
        textHe: "בגדים קלים נושמים",
        essential: true,
      },
      {
        icon: Backpack,
        textEn: "Small daypack or waist bag",
        textTh: "กระเป๋าเป้หรือกระเป๋าเอว",
        textHe: "תיק גב קטן או תיק מותניים",
        essential: true,
      },
      {
        icon: Droplets,
        textEn: "2–3 liters of water",
        textTh: "น้ำ 2–3 ลิตร",
        textHe: "2–3 ליטר מים",
        essential: true,
      },
      {
        icon: Sun,
        textEn: "Sunscreen SPF 50+",
        textTh: "ครีมกันแดด SPF 50+",
        textHe: "קרם הגנה SPF 50+",
        essential: true,
      },
      {
        icon: Camera,
        textEn: "Camera or smartphone",
        textTh: "กล้องหรือมือถือ",
        textHe: "מצלמה או טלפון",
        essential: false,
      },
      {
        icon: DollarSign,
        textEn: "Cash (small bills) for tips",
        textTh: "เงินสด (ธนบัตรเล็ก) ให้ทิป",
        textHe: "מזומן (שטרות קטנים) לטיפים",
        essential: false,
      },
    ],
  },
  {
    id: "overnight",
    icon: Moon,
    labelEn: "2–3 Day Adventure",
    labelTh: "ผจญภัย 2–3 วัน",
    labelHe: "הרפתקת 2–3 ימים",
    items: [
      {
        icon: Shirt,
        textEn: "Quick-dry adventure clothes (3 sets)",
        textTh: "เสื้อผ้าแห้งเร็ว (3 ชุด)",
        textHe: "בגדי הרפתקה מייבשים מהר (3 סטים)",
        essential: true,
      },
      {
        icon: Wind,
        textEn: "Light rain jacket",
        textTh: "เสื้อกันฝนเบา",
        textHe: "מעיל גשם קל",
        essential: true,
      },
      {
        icon: Moon,
        textEn: "Comfortable sleepwear",
        textTh: "ชุดนอนสบายๆ",
        textHe: "בגדי שינה נוחים",
        essential: true,
      },
      {
        icon: Smartphone,
        textEn: "Power bank + Universal adapter",
        textTh: "แบตเตอร์สำรอง + อะแดปเตอร์สากล",
        textHe: "פאוורבנק + מתאם אוניברסלי",
        essential: true,
      },
      {
        icon: Shield,
        textEn: "Personal medication",
        textTh: "ยาส่วนตัว",
        textHe: "תרופות אישיות",
        essential: true,
      },
      {
        icon: Umbrella,
        textEn: "Compact travel umbrella",
        textTh: "ร่มเดินทางขนาดเล็ก",
        textHe: "מטרייה קומפקטית לנסיעה",
        essential: false,
      },
    ],
  },
  {
    id: "expedition",
    icon: Zap,
    labelEn: "Multi-Day Expedition",
    labelTh: "เดินทางหลายวัน",
    labelHe: "מסע רב-יומי",
    items: [
      {
        icon: Utensils,
        textEn: "Reusable water bottle (1.5L+)",
        textTh: "ขวดน้ำใช้ซ้ำ (1.5L+)",
        textHe: "בקבוק מים רב-פעמי (1.5L+)",
        essential: true,
      },
      {
        icon: Shield,
        textEn: "Travel insurance printout",
        textTh: "พิมพ์ประกันเดินทาง",
        textHe: "הדפסת ביטוח נסיעה",
        essential: true,
      },
      {
        icon: Cloud,
        textEn: "Weather-appropriate layers",
        textTh: "เสื้อผ้าหลายชั้นตามอากาศ",
        textHe: "שכבות מתאימות למזג האוויר",
        essential: true,
      },
      {
        icon: Smartphone,
        textEn: "Offline maps downloaded",
        textTh: "แผนที่ออฟไลน์ดาวน์โหลดไว้",
        textHe: "מפות אופליין מו�ורדות",
        essential: true,
      },
      {
        icon: Sun,
        textEn: "Lip balm + moisturizer",
        textTh: "ลิปบาล์ม + ครีมบำรุง",
        textHe: "במסקרה לשפתיים + לחות",
        essential: false,
      },
      {
        icon: Camera,
        textEn: "Action camera (GoPro style)",
        textTh: "กล้องแอคชัน (GoPro)",
        textHe: "מצלמת אקשן (סגנון GoPro)",
        essential: false,
      },
    ],
  },
];

const SEASONAL_TIPS = [
  {
    seasonEn: "Nov – Feb (Cool Season)",
    seasonTh: "พ.ย. – ก.พ. (หน้าหนาว)",
    seasonHe: "נוב – פבר (עונה קרירה)",
    tipEn:
      "Pack a light fleece jacket for early morning departures. Temperatures can drop to 12°C in the mountains.",
    tipTh: "เตรียมแจ็คเก็ตบางๆ สำหรับตื่นเช้า อุณหภูมิอาจต่ำถึง 12°C ในภูเขา",
    tipHe:
      "ארזו ז'קט פליס קל ליציאות בוקר מוקדמות. הטמפרטורות יכולות לרדת ל-12°C בהרים.",
    icon: Cloud,
    iconColor: "text-blue-500",
  },
  {
    seasonEn: "Mar – May (Hot Season)",
    seasonTh: "มี.ค. – พ.ค. (หน้าร้อน)",
    seasonHe: "מרץ – מאי (עונה חמה)",
    tipEn:
      "Bring extra water (4L+ per person) and rehydration salts. Temperatures can exceed 40°C on some trails.",
    tipTh:
      "เตรียมน้ำเพิ่ม (4L+ ต่อคน) และเกลือแร่ อุณหภูมิอาจเกิน 40°C ในบางเส้นทาง",
    tipHe:
      "הביאו מים נוספים (4L+ לאדם) ומלחי הרביה. הטמפרטורות יכולות לעלות על 40°C במסלולים מסוימים.",
    icon: Sun,
    iconColor: "text-orange-500",
  },
  {
    seasonEn: "Jun – Oct (Rainy Season)",
    seasonTh: "มิ.ย. – ต.ค. (หน้าฝน)",
    seasonHe: "יוני – אוקט (עונת הגשמים)",
    tipEn:
      "Waterproof everything — your bags, electronics, and camera. Mud trails are part of the fun!",
    tipTh:
      "กันน้ำทุกอย่าง — กระเป๋า อุปกรณ์อิเล็กทรอนิกส์ และกล้อง เส้นทางเลนเป็นส่วนหนึ่งของความสนุก!",
    tipHe:
      "שמרו על הכל מוגן מים — התיקים, האלקטרוניקה והמצלמה. מסלולי בוץ הם חלק מהכיף!",
    icon: Rain,
    iconColor: "text-emerald-500",
  },
];

function Rain(props: React.ComponentProps<typeof Cloud>) {
  return (
    <div className="relative">
      <Cloud {...props} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-blue-400 rounded-full animate-bounce" />
      <div className="absolute bottom-0 left-0 w-1 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
      <div className="absolute bottom-0 right-0 w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
    </div>
  );
}

export function WhatToBring() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-muted/20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-accent text-xs font-bold tracking-[0.3em] uppercase block mb-3">
            {t("Be Prepared", "เตรียมพร้อม", "התכוננו")}
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground dark:text-white">
            {t("What to Bring", "เตรียมอุปกรณ์", "מה להביא")}
          </h2>
          <div className="w-16 h-[3px] bg-accent mx-auto mt-4 mb-6" />
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            {t(
              "Travel light but smart. Here's what you need for each type of adventure.",
              "เดินทางเบาๆ แต่ฉลาด บอกคุณว่าต้องเตรียมอะไรสำหรับแต่ละประเภทการผจญภัย",
              "טיילו קל אבל חכם. הנה מה שאתם צריכים לכל סוג הרפתקה."
            )}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="bg-background dark:bg-card rounded-2xl border border-border/50 dark:border-border/30 overflow-hidden shadow-sm"
              >
                {/* Category header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30 bg-muted/20">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground dark:text-white">
                    {t(cat.labelEn, cat.labelTh, cat.labelHe)}
                  </h3>
                </div>

                {/* Checklist items */}
                <ul className="divide-y divide-border/30">
                  {cat.items.map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-3 px-6 py-3"
                      >
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            item.essential
                              ? "bg-amber-100 dark:bg-amber-900/40"
                              : "bg-muted dark:bg-muted"
                          }`}
                        >
                          <ItemIcon
                            className={`w-3 h-3 ${
                              item.essential
                                ? "text-amber-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm ${item.essential ? "font-medium text-foreground dark:text-white" : "text-muted-foreground"}`}
                          >
                            {t(item.textEn, item.textTh, item.textHe)}
                          </span>
                          {item.essential && (
                            <span className="ml-2 text-[10px] font-bold tracking-wider uppercase text-amber-500">
                              {t("ESSENTIAL", "จำเป็น", "חובה")}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Seasonal Tips */}
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-6 md:p-8 border border-accent/20">
          <h3 className="text-xl font-heading font-bold mb-6 text-foreground dark:text-white flex items-center gap-2">
            <Umbrella className="w-5 h-5 text-accent" />
            {t("Seasonal Tips", "เคล็ดลับตามฤดูกาล", "טיפים עונתיים")}
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {SEASONAL_TIPS.map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <div key={idx} className="flex gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${tip.iconColor} bg-current/10 flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <Icon className={`w-4 h-4 ${tip.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground dark:text-white mb-1">
                      {t(tip.seasonEn, tip.seasonTh, tip.seasonHe)}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(tip.tipEn, tip.tipTh, tip.tipHe)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          {t(
            "Don't worry — WIRO 4x4 provides all safety equipment, water, and snacks. You just need to show up!",
            "ไม่ต้องกังวล — WIRO 4x4 มีอุปกรณ์ความปลอดภัย น้ำ และขนมให้ทั้งหมด คุณแค่ต้องมา!",
            "אל תדאגו — WIRO 4x4 מספקת את כל ציוד הבטיחות, המים והחטיפים. אתם רק צריכים להגיע!"
          )}
        </p>
      </div>
    </section>
  );
}
