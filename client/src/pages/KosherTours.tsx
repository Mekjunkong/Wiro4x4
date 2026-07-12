import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { GoldDivider } from "@/components/GoldDivider";
import { Breadcrumb } from "@/components/Breadcrumb";
import { OptimizedImage } from "@/components/OptimizedImage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
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
    title: ["Kosher Meal Coordination", "תיאום ארוחות כשרות"],
    desc: [
      "Tell us your kashrut level in advance. We coordinate realistic kosher-friendly meal options in Chiang Mai before confirming the route.",
      "ספרו לנו מראש את רמת הכשרות שלכם. נתאם אפשרויות אוכל ידידותיות לכשרות בצ׳אנג מאי לפני סגירת המסלול.",
    ],
  },
  {
    icon: Calendar,
    title: ["Shabbat-Friendly Scheduling", "תזמון שבת-ידידותי"],
    desc: [
      "We help plan around Shabbat timing and can share practical information about local Jewish services so your weekend logistics are clear.",
      "נעזור לתכנן סביב זמני שבת ונוכל לשתף מידע פרקטי על שירותים יהודיים מקומיים כדי שהלוגיסטיקה של סוף השבוע תהיה ברורה.",
    ],
  },
  {
    icon: Shield,
    title: ["Halachic Sensitivity", "רגישות הלכתית"],
    desc: [
      "Our team understands kashrut, modesty considerations, and prayer-time logistics. Share your needs so we can plan a suitable private day.",
      "הצוות שלנו מבין כשרות, שיקולי צניעות ולוגיסטיקה של זמני תפילה. שתפו את הצרכים שלכם כדי שנוכל לתכנן יום פרטי מתאים.",
    ],
  },
  {
    icon: Users,
    title: ["Private Groups Only", "קבוצות פרטיות בלבד"],
    desc: [
      "Private 4x4 days make kosher-friendly logistics easier: your family or group, your pace, and stops that fit your plan.",
      "טיולי 4x4 פרטיים מקלים על לוגיסטיקה ידידותית לכשרות: המשפחה או הקבוצה שלכם, הקצב שלכם ועצירות שמתאימות לתכנון.",
    ],
  },
];

const KOSHER_SEARCH_INTENTS = [
  {
    question: [
      "Looking for a kosher tour in Chiang Mai?",
      "מחפשים טיול כשר בצ׳אנג מאי?",
    ],
    answer: [
      "Start with WhatsApp: dates, group size, children or grandparents, kashrut level, and whether you prefer Hebrew or English planning. We confirm what is realistic before you commit.",
      "התחילו בוואטסאפ: תאריכים, גודל קבוצה, ילדים או סבים, רמת כשרות והאם אתם מעדיפים תכנון בעברית או באנגלית. נאשר מה ריאלי לפני שמתחייבים.",
    ],
  },
  {
    question: [
      "Need a 4x4 trip in Northern Thailand with kosher-friendly logistics?",
      "צריכים טיול 4x4 בצפון תאילנד עם לוגיסטיקה ידידותית לכשרות?",
    ],
    answer: [
      "Private routing gives more control over timing, food stops, prayer breaks, and pickup area than a shared bus-style tour.",
      "מסלול פרטי נותן יותר שליטה על זמנים, עצירות אוכל, הפסקות תפילה ואזור איסוף מאשר טיול משותף בסגנון אוטובוס.",
    ],
  },
];

export default function KosherTours() {
  const { t, language } = useLanguage();

  usePageMeta({
    title: "Kosher-Friendly Tours Chiang Mai",
    description:
      "Kosher-friendly private 4x4 tours in Chiang Mai, Thailand. Hebrew/English planning support, Shabbat-aware scheduling, and meal logistics for Jewish travelers.",
    ogTitle: "Kosher-Friendly Tours Chiang Mai | WIRO 4x4",
    ogDescription:
      "Private 4x4 tours in Northern Thailand with kosher-friendly logistics, Hebrew/English support, and WhatsApp planning for Israeli and Jewish travelers.",
    canonicalPath: "/kosher-tours",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Kosher-Friendly Off-Road Tours in Chiang Mai",
      description:
        "Private kosher-friendly 4x4 tours in Chiang Mai with Hebrew/English planning support, Shabbat-aware scheduling, and meal logistics for Jewish travelers.",
      serviceType: "TourOperator",
      audience: {
        "@type": "Audience",
        audienceType:
          "Jewish travelers, Kosher travelers, Orthodox Jewish travelers",
      },
      areaServed: { "@type": "City", name: "Chiang Mai" },
      provider: {
        "@type": "Organization",
        name: "WIRO 4x4",
        url: "https://www.wiro4x4indochina.com",
      },
    },
  });

  const whatsappMessage = t(
    "Hi WIRO 4x4! I'm interested in your kosher tours in Chiang Mai. Can you share availability and pricing?",
    "היי WIRO 4x4! מתעניין/ת בטיולים הכשרים שלכם בצ'יאנג מאי. אפשר לשמוע על זמינות ומחירים?"
  );

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb items={[{ label: t("Kosher Tours", "טיולים כשרים") }]} />
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative min-h-[50vh] overflow-hidden">
          <OptimizedImage
            src="mountain_sunset"
            alt={t(
              "Kosher off-road tour in Chiang Mai mountains with WIRO 4x4",
              "טיול שטח כשר בהרי צ'יאנג מאי עם WIRO 4x4"
            )}
            className="w-full h-full absolute inset-0 object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Utensils className="w-4 h-4" />
                {t("Kosher-Friendly Planning", "תכנון ידידותי לכשרות")}
              </div>
              <h1 className="text-4xl md:text-5xl font-medium text-white mb-4">
                {t("Kosher Tours in Chiang Mai", "טיולים כשרים בצ'יאנג מאי")}
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                {t(
                  "Private 4x4 adventures for Jewish and Israeli travelers who want kosher-friendly meal logistics, Shabbat-aware planning, and Hebrew/English support before the route is confirmed.",
                  "הרפתקאות 4x4 פרטיות למטיילים יהודים וישראלים שרוצים לוגיסטיקה ידידותית לכשרות, תכנון שמתחשב בשבת ותמיכה בעברית או באנגלית לפני סגירת המסלול."
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

        {/* Kosher Israeli search intent */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t(
                  "Kosher 4x4 Planning for Northern Thailand",
                  "תכנון טיול 4x4 כשר בצפון תאילנד"
                )}
              </h2>
              <GoldDivider />
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                {t(
                  "For searches like טיול כשר בצ׳אנג מאי, טיול ג׳יפים בצ׳אנג מאי, or טיול 4x4 בצפון תאילנד, the safest answer is a private plan checked against your dates, food needs, and route conditions.",
                  "לחיפושים כמו טיול כשר בצ׳אנג מאי, טיול ג׳יפים בצ׳אנג מאי או טיול 4x4 בצפון תאילנד, התשובה הבטוחה היא תכנון פרטי שנבדק מול התאריכים, צרכי האוכל ותנאי המסלול שלכם."
                )}
              </p>
            </div>

            <div className="space-y-4">
              {KOSHER_SEARCH_INTENTS.map((item, idx) => (
                <Card key={idx} className="p-6 rounded-sm border-border">
                  <h3 className="font-semibold mb-2">
                    {t(item.question[0], item.question[1])}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(item.answer[0], item.answer[1])}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* All Tours with Kosher Badges */}
        <section className="py-16 md:py-24">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t("Our Kosher Tours", "הטיולים הכשרים שלנו")}
              </h2>
              <GoldDivider />
              <p className="text-muted-foreground text-lg">
                {t(
                  "All 6 tours can be planned with kosher-friendly meal logistics and Hebrew/English support when requested in advance",
                  "את כל 6 הטיולים אפשר לתכנן עם לוגיסטיקה ידידותית לכשרות ותמיכה בעברית או באנגלית כשמבקשים מראש"
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
                  en: "We discuss kosher-friendly options in Chiang Mai before confirming the route",
                  he: "אנחנו בודקים אפשרויות ידידותיות לכשרות בצ׳אנג מאי לפני סגירת המסלול",
                },
                {
                  en: "Advance notice helps us match the plan to your kashrut level and timing",
                  he: "הודעה מראש עוזרת להתאים את התכנון לרמת הכשרות ולזמנים שלכם",
                },
                {
                  en: "We can consider vegetarian, vegan, and allergy requirements alongside kashrut",
                  he: "אפשר להתחשב בצמחונות, טבעונות ואלרגיות לצד דרישות כשרות",
                },
                {
                  en: "Remote village stops can use simple sealed packaged items, fruit, or a packed meal when suitable",
                  he: "בעצירות כפריות מרוחקות אפשר לתכנן מוצרים ארוזים סגורים, פירות או ארוחה ארוזה כשזה מתאים",
                },
                {
                  en: "Private 4x4 routing keeps pickup, breaks, and food stops flexible for families and groups",
                  he: "מסלול 4x4 פרטי שומר על גמישות באיסוף, בהפסקות ובעצירות אוכל למשפחות וקבוצות",
                },
                {
                  en: "Ask on WhatsApp for current local Jewish-service information before your travel dates",
                  he: "שאלו בוואטסאפ על מידע עדכני לגבי שירותים יהודיים מקומיים לפני תאריכי הנסיעה",
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

        {/* WhatsApp planning note */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-3xl text-center">
            <MessageCircle className="w-10 h-10 text-accent mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              {t(
                "Confirm Kosher Logistics Before You Book",
                "אשרו לוגיסטיקת כשרות לפני ההזמנה"
              )}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t(
                "Send your dates, route ideas, group size, pickup area, and kashrut level on WhatsApp. We will explain what can be arranged for Chiang Mai and nearby 4x4 routes before you decide.",
                "שלחו בוואטסאפ תאריכים, רעיונות למסלול, גודל קבוצה, אזור איסוף ורמת כשרות. נסביר מה אפשר לתאם בצ׳אנג מאי ובמסלולי 4x4 קרובים לפני שתחליטו."
              )}
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
              <TrackedWhatsAppLink
                sourceCode={
                  language === "he" ? "KOSHER-PAGE-HE" : "KOSHER-PAGE-EN"
                }
                humanMessage={whatsappMessage}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t("Chat on WhatsApp", "שלחו הודעה בוואטסאפ")}
                </Button>
              </TrackedWhatsAppLink>
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
