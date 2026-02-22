import { useLanguage } from "@/contexts/LanguageContext";
import { Star, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GoldDivider } from "@/components/GoldDivider";

export function Testimonials() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });

  const testimonials = [
    {
      name: "David & Sarah Cohen",
      location: t("Tel Aviv, Israel", "תל אביב, ישראל"),
      rating: 5,
      text: t(
        "WIRO 4x4 exceeded all expectations! The kosher meals were fresh and delicious, our guide spoke perfect Hebrew, and the waterfalls were absolutely stunning. Highly recommend!",
        "WIRO 4x4 עלו על כל הציפיות! האוכל הכשר היה טרי וטעים, המדריך דיבר עברית מושלמת, והמפלים היו פשוט מדהימים. ממליצים בחום!"
      ),
      lang: "en",
    },
    {
      name: "משפחת לוי",
      location: t("Jerusalem, Israel", "ירושלים, ישראל"),
      rating: 5,
      text: t(
        "Perfect for families! They scheduled our tour to finish before Shabbat, provided mehadrin kosher food, and the kids loved the elephant sanctuary. Professional and caring service.",
        "מושלם למשפחות! תיאמו לנו את הטיול כך שנסיים לפני שבת, סיפקו אוכל כשר מהדרין, והילדים התלהבו מהפילים. שירות מקצועי ואכפתי."
      ),
      lang: "he",
    },
    {
      name: "Yossi Mizrahi",
      location: t("Haifa, Israel", "חיפה, ישראל"),
      rating: 5,
      text: t(
        "Best off-road experience in Thailand! Real trails, not tourist traps. The guide knew every hidden spot and the 4x4 vehicles were top quality. Will definitely come back!",
        "חוויית השטח הכי טובה בתאילנד! שבילים אמיתיים, לא מלכודות תיירים. המדריך הכיר כל פינה חבויה והג'יפים היו ברמה גבוהה. בהחלט נחזור!"
      ),
      lang: "en",
    },
    {
      name: "Rachel & Avi Goldstein",
      location: t("Netanya, Israel", "נתניה, ישראל"),
      rating: 5,
      text: t(
        "The attention to kosher details was impressive. Sealed packaging, dedicated utensils, and they even helped us find a minyan in Chiang Mai. True cultural understanding!",
        "תשומת הלב לפרטי הכשרות הייתה מרשימה. אריזה אטומה, כלים ייעודיים, והם אפילו עזרו לנו למצוא מניין בצ'יאנג מאי. הבנה תרבותית אמיתית!"
      ),
      lang: "he",
    },
    {
      name: "Michael Ben-David",
      location: t("Ramat Gan, Israel", "רמת גן, ישראל"),
      rating: 5,
      text: t(
        "Incredible rice field landscapes and authentic hill tribe villages. The WhatsApp support was instant and helpful. WIRO 4x4 made our Thailand trip unforgettable!",
        "שדות אורז מדהימים וכפרי שבטים אותנטיים. התמיכה בוואטסאפ הייתה מיידית. WIRO 4x4 הפכו לנו את הטיול לתאילנד לבלתי נשכח!"
      ),
      lang: "en",
    },
    {
      name: "שרה ויעקב כהן",
      location: t("Ashdod, Israel", "אשדוד, ישראל"),
      rating: 5,
      text: t(
        "From booking to the end of the tour, everything was perfect. They understand Israeli travelers and go above and beyond. The jungle expedition was the highlight of our trip!",
        "מההזמנה ועד סוף הטיול, הכל היה מושלם. הם מבינים מטיילים ישראלים ונותנים שירות מעל ומעבר. טיול הג'ונגל היה השיא!"
      ),
      lang: "he",
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-4xl md:text-5xl font-medium mb-6">
            {t("What Our Travelers Say", "מה המטיילים שלנו אומרים")}
          </h2>
          <GoldDivider />
          <p className="text-lg text-muted-foreground mb-4">
            {t(
              "Real experiences from Israeli travelers who explored Northern Thailand with WIRO 4x4.",
              "חוויות אמיתיות של מטיילים ישראלים שחקרו את צפון תאילנד עם WIRO 4x4."
            )}
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]"
                />
              ))}
            </div>
            <span className="text-lg font-bold">5.0</span>
            <span className="text-muted-foreground">
              {t("from 120+ travelers", "מ-120+ מטיילים")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`py-6 ${
                index < testimonials.length - 1
                  ? "border-b border-[#E8E2DA]"
                  : ""
              } ${testimonial.lang === "he" ? "rtl" : ""}`}
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <span className="text-6xl text-[#D4AF37] leading-none">
                    {"\u201C"}
                  </span>
                </div>

                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]"
                    />
                  ))}
                </div>

                <p className="italic text-xl md:text-2xl leading-relaxed text-muted-foreground mb-4 flex-grow">
                  {testimonial.text}
                </p>

                <div
                  className={`flex items-center gap-3 ${testimonial.lang === "he" ? "flex-row-reverse text-right" : ""}`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#1C1C1C] flex items-center justify-center font-bold text-sm shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/reviews">
            <span className="inline-flex items-center gap-2 text-[#D4AF37] font-semibold hover:underline cursor-pointer">
              {t("See All Reviews", "לכל חוות הדעת")}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
