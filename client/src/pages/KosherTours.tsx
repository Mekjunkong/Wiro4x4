import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { GoldDivider } from "@/components/GoldDivider";
import { Breadcrumb } from "@/components/Breadcrumb";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Utensils,
  Shield,
  Clock,
  Users,
  MessageCircle,
  Calendar,
  Check,
  Star,
} from "lucide-react";

const TOUR_CARDS = [
  {
    slug: "doi-inthanon-roof-of-thailand",
    name: "Doi Inthanon — Roof of Thailand",
    nameHe: "דוי אינתנון — גג תאילנד",
    image: "/images/optimized/mountain_sunset.jpg",
    duration: "7-8 hours",
    price: 5000,
    kosher: true,
    shabbat: true,
  },
  {
    slug: "mae-kampong-hidden-village",
    name: "Mae Kampong — Hidden Mountain Village",
    nameHe: "מאה קמפונג — הכפר הנסתר בהרים",
    image: "/images/optimized/mountain_village_view.jpg",
    duration: "5-7 hours",
    price: 3500,
    kosher: true,
    shabbat: true,
  },
  {
    slug: "maerim-sticky-waterfalls",
    name: "Maerim & Sticky Waterfalls",
    nameHe: "מאה רים ומפלים דביקים",
    image: "/images/optimized/sticky_waterfalls.jpg",
    duration: "7-8 hours",
    price: 4500,
    kosher: true,
    shabbat: true,
  },
  {
    slug: "doi-suthep-pui-beyond-temple",
    name: "Doi Suthep-Pui — Beyond the Temple",
    nameHe: "דוי סוטפ-פוי — מעבר למקדש",
    image: "/images/optimized/doi_suthep_golden_chedi.jpg",
    duration: "5-7 hours",
    price: 3500,
    kosher: true,
    shabbat: true,
  },
  {
    slug: "mae-wang-jungle-wilderness",
    name: "Mae Wang — Jungle & River Wilderness",
    nameHe: "מאה וואנג — ג'ונגל ונהרות פראיים",
    image: "/images/optimized/elephant_encounter.jpg",
    duration: "8-9 hours",
    price: 5500,
    kosher: true,
    shabbat: false,
  },
  {
    slug: "samoeng-loop-mountain-circuit",
    name: "Samoeng Loop — The Mountain Circuit",
    nameHe: "לולאת סמאנג — המעגל ההררי",
    image: "/images/optimized/chiang_mai_valley.jpg",
    duration: "8-10 hours",
    price: 5000,
    kosher: true,
    shabbat: true,
  },
];

const KOSHER_FEATURES = [
  {
    icon: Utensils,
    title: ["Certified Kosher Meals", "ארוחות כשרות מאושרות"],
    desc: [
      "Every meal on our tours is prepared with kosher ingredients. We coordinate with certified kosher restaurants and caterers in Chiang Mai.",
      "כל ארוחה בטיולים שלנו מוכנה מחומרי גלם כשרים. אנחנו מתאמים עם מסעדות וקייטרינג בעלי הכשר בצ'יאנג מאי.",
    ],
  },
  {
    icon: Calendar,
    title: ["Shabbat-Friendly Scheduling", "תזמון שבת-ידידותי"],
    desc: [
      "We never schedule tours on Shabbat. We can arrange Shabbat accommodations near the local Chabad house and help plan your entire weekend.",
      'אנחנו לעולם לא מתזמנים טיולים בשבת. נסדר לינה ליד בית חב"ד המקומי ונעזור לתכנן את כל סוף השבוע.',
    ],
  },
  {
    icon: Shield,
    title: ["Halachic Sensitivity", "רגישות הלכתית"],
    desc: [
      "Our guides understand kashrut requirements, modesty considerations, and prayer schedules. We adapt every tour to your observance level.",
      "המדריכים שלנו מבינים דרישות כשרות, שיקולי צניעות ולוחות זמני תפילה. נתאים כל טיול לרמת השמירה שלכם.",
    ],
  },
  {
    icon: Users,
    title: ["Private Groups Only", "קבוצות פרטיות בלבד"],
    desc: [
      "Every WIRO 4x4 tour is private for your group. No mixing with strangers. Your family, your pace, your rules.",
      "כל טיול של WIRO 4x4 הוא פרטי לקבוצה שלכם. בלי ערבוב עם זרים. המשפחה שלכם, הקצב שלכם, הכללים שלכם.",
    ],
  },
];

export default function KosherTours() {
  const { t } = useLanguage();

  usePageMeta({
    title: "Kosher Tours Chiang Mai",
    description:
      "Premium kosher-friendly 4x4 tours in Chiang Mai, Thailand. Certified kosher meals, Shabbat-friendly scheduling, Hebrew-speaking guides, and private groups.",
    ogTitle: "Kosher Tours Chiang Mai | WIRO 4x4",
    ogDescription:
      "Certified kosher meals, Shabbat scheduling, Hebrew guides. 6 off-road adventures in Northern Thailand designed for observant Jewish travelers.",
    canonicalPath: "/kosher-tours",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: "Kosher Off-Road Tours in Chiang Mai",
      description:
        "Premium kosher-friendly 4x4 tours in Chiang Mai with certified kosher meals, Shabbat scheduling, and Hebrew-speaking guides.",
      touristType: [
        "Jewish travelers",
        "Kosher travelers",
        "Frum travelers",
        "Orthodox Jewish travelers",
      ],
      provider: {
        "@type": "Organization",
        name: "WIRO 4x4",
        url: "https://www.wiro4x4indochina.com",
      },
    },
  });

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      t(
        "Hi WIRO 4x4! I'm interested in your kosher tours in Chiang Mai. Can you share availability and pricing?",
        "היי WIRO 4x4! מתעניין/ת בטיולים הכשרים שלכם בצ'יאנג מאי. אפשר לשמוע על זמינות ומחירים?"
      )
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb items={[{ label: t("Kosher Tours", "טיולים כשרים") }]} />
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative min-h-[50vh] overflow-hidden">
          <img
            src="/images/optimized/mountain_sunset.jpg"
            alt={t(
              "Kosher off-road tour in Chiang Mai mountains with WIRO 4x4",
              "טיול שטח כשר בהרי צ'יאנג מאי עם WIRO 4x4"
            )}
            className="w-full h-full absolute inset-0 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Utensils className="w-4 h-4" />
                {t("100% Kosher Certified", "100% כשרות מאושרת")}
              </div>
              <h1 className="text-4xl md:text-5xl font-medium text-white mb-4">
                {t("Kosher Tours in Chiang Mai", "טיולים כשרים בצ'יאנג מאי")}
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                {t(
                  "Premium off-road adventures designed for observant Jewish travelers. Certified kosher meals, Shabbat-friendly scheduling, and Hebrew-speaking guides.",
                  "הרפתקאות שטח פרמיום שתוכננו למטיילים יהודים שומרי מצוות. ארוחות כשרות מאושרות, תזמון שבת-ידידותי ומדריכים דוברי עברית."
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Why Kosher Touring is Different */}
        <section className="py-16 md:py-24">
          <div className="container max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t(
                  "Why Kosher Touring is Different",
                  "למה טיולים כשרים זה שונה"
                )}
              </h2>
              <GoldDivider />
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t(
                  "Standard tour companies don't understand kashrut, Shabbat schedules, or the unique needs of observant travelers. We do.",
                  "חברות תיירות רגילות לא מבינות כשרות, לוחות שבת או הצרכים הייחודיים של מטיילים שומרי מצוות. אנחנו כן."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {KOSHER_FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={idx}
                    className="p-6 rounded-sm border-border hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {t(feature.title[0], feature.title[1])}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {t(feature.desc[0], feature.desc[1])}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* All Tours with Kosher Badges */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t("Our Kosher Tours", "הטיולים הכשרים שלנו")}
              </h2>
              <GoldDivider />
              <p className="text-muted-foreground text-lg">
                {t(
                  "All 6 tours include kosher meal options and Hebrew-speaking guides",
                  "כל 6 הטיולים כוללים אפשרויות ארוחות כשרות ומדריכים דוברי עברית"
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TOUR_CARDS.map(tour => (
                <Link key={tour.slug} href={`/tours/${tour.slug}`}>
                  <Card className="overflow-hidden rounded-sm hover:shadow-premium transition-shadow cursor-pointer group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={tour.image}
                        alt={t(
                          `${tour.name} - Kosher off-road tour in Chiang Mai`,
                          `${tour.nameHe} - טיול שטח כשר בצ'יאנג מאי`
                        )}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {tour.kosher && (
                          <span className="bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Utensils className="w-3 h-3" />
                            {t("Kosher", "כשר")}
                          </span>
                        )}
                        {tour.shabbat && (
                          <span className="bg-white/90 text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                            {t("Shabbat OK", "שבת")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-2">
                        {t(tour.name, tour.nameHe)}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {tour.duration}
                        </span>
                        <span className="text-accent font-bold">
                          &#3647;{tour.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Kosher Food Details */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t("Our Kosher Commitment", "המחויבות שלנו לכשרות")}
              </h2>
              <GoldDivider />
            </div>

            <div className="space-y-4">
              {[
                {
                  en: "We work with certified kosher restaurants in Chiang Mai, including Chabad-affiliated options",
                  he: "אנחנו עובדים עם מסעדות כשרות מאושרות בצ'יאנג מאי, כולל אפשרויות שקשורות לחב\"ד",
                },
                {
                  en: "Advance notice allows us to arrange mehadrin-level meals",
                  he: "הודעה מראש מאפשרת לנו לארגן ארוחות ברמת מהדרין",
                },
                {
                  en: "We can accommodate vegetarian, vegan, and allergy requirements alongside kashrut",
                  he: "אנחנו יכולים להתאים לצמחונים, טבעונים ואלרגיות לצד כשרות",
                },
                {
                  en: "Village-based lunches use fresh fruits, vegetables, and sealed packaged items",
                  he: "ארוחות צהריים כפריות משתמשות בפירות טריים, ירקות ומוצרים ארוזים",
                },
                {
                  en: "Our guides carry emergency kosher snack packs on every tour",
                  he: "המדריכים שלנו נושאים חבילות חטיפים כשרים לחירום בכל טיול",
                },
                {
                  en: "We provide information about Chabad Chiang Mai services, Shabbat meals, and Friday night dinners",
                  he: "אנחנו מספקים מידע על שירותי חב\"ד צ'יאנג מאי, ארוחות שבת וסעודות ליל שישי",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-sm bg-accent/5"
                >
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">
                    {t(item.en, item.he)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Highlight */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-3xl text-center">
            <Star className="w-10 h-10 text-accent mx-auto mb-4" />
            <blockquote className="text-xl md:text-2xl italic text-foreground mb-4 leading-relaxed">
              {t(
                '"WIRO 4x4 understood exactly what we needed as a religious family. The kosher meals were excellent, and they planned everything around Shabbat. We felt completely taken care of."',
                '"WIRO 4x4 הבינו בדיוק מה אנחנו צריכים כמשפחה דתית. הארוחות הכשרות היו מצוינות, והם תכננו הכל סביב השבת. הרגשנו שמטפלים בנו לגמרי."'
              )}
            </blockquote>
            <p className="text-muted-foreground">
              {t("- The Cohen Family, Jerusalem", "- משפחת כהן, ירושלים")}
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-white">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              {t("Ready for a Kosher Adventure?", "מוכנים להרפתקה כשרה?")}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {t(
                "Tell us your dates, group size, and kashrut level. We'll build a custom kosher itinerary just for you.",
                "ספרו לנו את התאריכים, גודל הקבוצה ורמת הכשרות. נבנה מסלול כשר מותאם אישית רק בשבילכם."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleWhatsApp}
                size="lg"
                className="gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white"
              >
                <MessageCircle className="w-5 h-5" />
                {t("Chat on WhatsApp", "שלחו הודעה בוואטסאפ")}
              </Button>
              <Link href="/book">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <Calendar className="w-5 h-5" />
                  {t("Book Online", "הזמינו אונליין")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
