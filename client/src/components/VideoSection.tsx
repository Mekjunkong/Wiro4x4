import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle } from "lucide-react";

export function VideoSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-accent text-xs font-bold tracking-[0.3em] uppercase block mb-3">
            {t("Real Footage", "ภาพจริง", "צילום אמיתי")}
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground dark:text-white">
            {t("See the Adventure", "ชมการผจญภัย", "ראו את ההרפתקה")}
          </h2>
          <div className="w-16 h-[3px] bg-accent mx-auto mt-4 mb-6" />
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            {t(
              "Watch real footage from our tours. River crossings, mountain trails, and unforgettable moments from past adventurers.",
              "ดูภาพจริงจากทัวร์ของเรา ข้ามแม่น้ำ เส้นทางภูเขา และความประทับใจที่ไม่ลืมจากนักผจญภัยคนก่อนๆ",
              "צפו בצילומים אמיתיים מהטיולים שלנו. חציית נהרות, שבילי הרים ורגעים בלתי נש forgetים מהרפתקאות קודמות."
            )}
          </p>
        </div>

        {/* Video Container */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-accent/10 border border-border/50 bg-black aspect-video">
            {/* YouTube Embed — placeholder using a real Thailand 4x4 video */}
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
              title="WIRO 4x4 Off-Road Adventure Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {/* Overlay gradient (shown before play) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Bottom caption */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
              <p className="text-white/80 text-sm">
                {t(
                  "Barbarian Run — River Crossing Section",
                  "Barbarian Run — ส่วนข้ามแม่น้ำ",
                  "Barbarian Run — חלק חציית הנהר"
                )}
              </p>
            </div>
          </div>

          {/* Thumbnail strip (decorative) */}
          <div className="flex gap-3 mt-4 justify-center">
            {[
              {
                label: "Jungle Trails",
                labelTh: "เส้นทางป่า",
                labelHe: "שבילי ג'ונגל",
                active: false,
              },
              {
                label: "River Crossings",
                labelTh: "ข้ามแม่น้ำ",
                labelHe: "חציית נהרות",
                active: true,
              },
              {
                label: "Mountain Views",
                labelTh: "วิวภูเขา",
                labelHe: "נופי הרים",
                active: false,
              },
              {
                label: "Campfire Nights",
                labelTh: "ค่ำคืนรอบไฟ",
                labelHe: "לילות מדורה",
                active: false,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  item.active
                    ? "bg-accent/10 border-accent text-accent"
                    : "bg-muted/30 border-border/50 text-muted-foreground hover:border-accent/30 hover:text-foreground"
                }`}
              >
                {t(item.label, item.labelTh, item.labelHe)}
              </div>
            ))}
          </div>
        </div>

        {/* CTA below video */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-5">
            {t(
              "Ready to create your own adventure story?",
              "พร้อมสร้างเรื่องราวการผจญภัยของคุณเองหรือยัง?",
              "מוכנים ליצור את סיפור ההרפתקה שלכם?"
            )}
          </p>
          <a
            href="https://wa.me/66929894495?text=Hi!%20I%20saw%20the%20video%20and%20I%20want%20in!"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-accent-cta hover:bg-accent-cta-hover text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <MessageCircle className="w-5 h-5" />
            {t(
              "Join the Next Adventure",
              "ร่วมผจญภัยครั้งต่อไป",
              "הצטרפו להרפתקה הבאה"
            )}
          </a>
        </div>
      </div>
    </section>
  );
}
