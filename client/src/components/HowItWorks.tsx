import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle, Map, Compass, Heart } from "lucide-react";

const STEPS = [
  {
    icon: MessageCircle,
    stepEn: "Message",
    stepTh: "ส่งข้อความ",
    stepHe: "שלחו הודעה",
    titleEn: "Send Us a Message",
    titleTh: "ติดต่อเรา",
    titleHe: "צרו איתנו קשר",
    descEn:
      "Tell us your travel dates, group size, and what you want to experience. We'll get back to you within 24 hours.",
    descTh:
      "บอกเราถึงวันที่เดินทาง จำนวนคน และสิ่งที่คุณอยากสัมผัส เราจะตอบกลับภายใน 24 ชั่วโมง",
    descHe:
      "ספרו לנו על תאריכי הנסיעה, גודל הקבוצה ומה תרצו לחוות. נחזור אליכם תוך 24 שעות.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-500",
  },
  {
    icon: Map,
    stepEn: "Plan",
    stepTh: "วางแผน",
    stepHe: "תכנון",
    titleEn: "We Plan Your Adventure",
    titleTh: "เราวางแผนให้คุณ",
    titleHe: "אנחנו מתכננים את ההרפתקה",
    descEn:
      "Custom itinerary based on your preferences. Hebrew-speaking guide, kosher meals, and all logistics handled for you.",
    descTh:
      "ออกแบบเส้นทางตามความต้องการของคุณ มีไกด์พูดภาษา Hebrew เนื้อหาทัวร์ถูกจัดการครบ",
    descHe:
      "מסלול מותאם אישית לפי העדפותיכם. מדריך דובר עברית, ארוחות כשרות וכל הלוגיסטיקה מטופלים עבורכם.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-500",
  },
  {
    icon: Compass,
    stepEn: "Adventure",
    stepTh: "ผจญภัย",
    stepHe: "הרפתקה",
    titleEn: "Hit the Trail",
    titleTh: "ออกเดินทาง",
    titleHe: "צאו לדרך",
    descEn:
      "Private 4x4 adventure through mountains, jungles, and rivers. Just your group — no crowds, no compromises.",
    descTh:
      "ผจญภัย 4x4 นำทางผ่านภูเขา ป่าเขาอันเขียวขจี และแม่น้ำ มีแค่กลุ่มของคุณเท่านั้น",
    descHe:
      "הרפתקת 4x4 פרטית דרך הרים, ג'ונגלים ונהרות. רק הקבוצה שלכם — בלי המונים, בלי פשרות.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-500",
  },
  {
    icon: Heart,
    stepEn: "Remember",
    stepTh: "จดจำ",
    stepHe: "זכרון",
    titleEn: "Take Home Memories",
    titleTh: "กลับบ้านพร้อมความทรงจำ",
    titleHe: "שוב הביתה עם זיכרונות",
    descEn:
      "Photo stops at every stunning viewpoint, authentic local encounters, and stories you'll be telling for years.",
    descTh:
      "หยุดถ่ายรูปทุกจุดชมวิวที่สวยงาม พบปะผู้คนท้องถิ่นอย่างแท้จริง และเรื่องราวที่คุณจะเล่าต่อไปอีกหลายปี",
    descHe:
      "עצירות צילום בכל נקודת תצפית מדהימה, מפגשים מקומיים אותנטיים, וסיפורים שתספרו עוד שנים.",
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    iconColor: "text-rose-500",
  },
];

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-muted/20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-accent text-xs font-bold tracking-[0.3em] uppercase block mb-3">
            {t(
              "Simple Booking Process",
              "ขั้นตอนการจองง่ายๆ",
              "תהליך הזמנה פשוט"
            )}
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground dark:text-white">
            {t("How It Works", "วิธีการจอง", "איך זה עובד")}
          </h2>
          <div className="w-16 h-[3px] bg-accent mx-auto mt-4 mb-6" />
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            {t(
              "From first message to final farewell — four steps to your perfect off-road adventure.",
              "จากข้อความแรกสุดจนถึงอำลาสุดท้าย — สี่ขั้นตอนสู่การผจญภัย 4x4 ที่สมบูรณ์แบบของคุณ",
              "מהודעה ראשונה ועד פרידה אחרונה — ארבעה שלבים להרפתקת השטח המושלמת שלכם."
            )}
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector line (between cards on desktop) */}
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-[2px] bg-gradient-to-r from-accent/40 to-transparent z-0" />
                )}

                <div
                  className={`relative z-10 ${step.bgColor} rounded-2xl p-6 h-full border border-border/50 dark:border-border/30`}
                >
                  {/* Step number badge */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span
                      className={`text-xs font-bold tracking-widest uppercase ${step.iconColor}`}
                    >
                      {t(step.stepEn, step.stepTh, step.stepHe)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-heading font-bold mb-3 text-foreground dark:text-white">
                    {t(step.titleEn, step.titleTh, step.titleHe)}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(step.descEn, step.descTh, step.descHe)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <a
            href="https://wa.me/66929894495?text=Hi!%20I%27m%20interested%20in%20an%20off-road%20tour%20in%20Chiang%20Mai.%20Can%20you%20tell%20me%20more%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-accent-cta hover:bg-accent-cta-hover text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <MessageCircle className="w-5 h-5" />
            {t(
              "Start Your Journey",
              "เริ่มต้นการเดินทาง",
              "התחילו את המסע שלכם"
            )}
          </a>
        </div>
      </div>
    </section>
  );
}
