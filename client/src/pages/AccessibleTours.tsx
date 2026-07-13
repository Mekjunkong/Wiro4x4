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
  MessageCircle,
  Accessibility,
  Shield,
  Car,
  Mountain,
  Check,
  Phone,
  Heart,
} from "lucide-react";

const ACCESSIBILITY_FEATURES = [
  {
    icon: Car,
    title: ["Adapted 4x4 Vehicles", "רכבי 4x4 מותאמים"],
    desc: [
      "Our vehicles can be configured for wheelchair access. Wide doors, sturdy step bars, and ample space for mobility equipment.",
      "הרכבים שלנו ניתנים להתאמה לגישת כיסאות גלגלים. דלתות רחבות, מדרגות יציבות ומקום רחב לציוד ניידות.",
    ],
  },
  {
    icon: Mountain,
    title: ["Customized Itineraries", "מסלולים מותאמים אישית"],
    desc: [
      "We adapt every tour to your mobility level. Boardwalk trails, scenic viewpoints accessible by vehicle, and rest stops as needed.",
      "אנחנו מתאימים כל טיול לרמת הניידות שלכם. שבילי גשר, תצפיות נופיות נגישות ברכב ועצירות מנוחה לפי הצורך.",
    ],
  },
  {
    icon: Heart,
    title: ["Patient, Experienced Guides", "מדריכים סבלניים ומנוסים"],
    desc: [
      "Our guides are trained to work with travelers of all abilities. No rushing, no pressure — your comfort is the priority.",
      "המדריכים שלנו מאומנים לעבוד עם מטיילים בכל רמת יכולת. בלי לחץ, בלי מהירות — הנוחות שלכם היא העדיפות.",
    ],
  },
  {
    icon: Shield,
    title: ["Safety First", "בטיחות קודם"],
    desc: [
      "Full safety equipment, first aid, and vehicles maintained to the highest standards. We plan for every scenario.",
      "ציוד בטיחות מלא, עזרה ראשונה ורכבים שמתוחזקים לסטנדרטים הגבוהים ביותר. אנחנו מתכננים לכל תרחיש.",
    ],
  },
];

const ACCESSIBLE_TOURS = [
  {
    slug: "doi-inthanon-roof-of-thailand",
    name: "Doi Inthanon",
    nameHe: "דוי אינתנון",
    access: [
      "Summit viewpoint accessible by vehicle. Boardwalk at Ang Ka nature trail (360m, flat). Royal Pagodas have paved paths.",
      "תצפית הפסגה נגישה ברכב. גשר עץ בשביל טבע אנג קא (360 מ', שטוח). לפגודות המלכותיות יש שבילים סלולים.",
    ],
    image: "/images/optimized/mountain_sunset.jpg",
  },
  {
    slug: "doi-suthep-pui-beyond-temple",
    name: "Doi Suthep Temple",
    nameHe: "מקדש דוי סוטפ",
    access: [
      "Elevator access to the temple. Scenic viewpoints accessible by vehicle throughout the national park. Coffee village has flat ground.",
      "גישת מעלית למקדש. תצפיות נופיות נגישות ברכב בכל הפארק הלאומי. לכפר הקפה יש קרקע שטוחה.",
    ],
    image: "/images/optimized/doi_suthep_golden_chedi.jpg",
  },
  {
    slug: "samoeng-loop-mountain-circuit",
    name: "Samoeng Loop",
    nameHe: "לולאת סמאנג",
    access: [
      "Mostly a scenic drive with stop-and-view points. Mon Jam has accessible terraces. Reservoir bamboo huts are ground-level.",
      "בעיקר נסיעה נופית עם נקודות עצירה. למון ג'אם יש טרסות נגישות. בקתות הבמבוק על המאגר ברמת הקרקע.",
    ],
    image: "/images/optimized/chiang_mai_valley.jpg",
  },
];

export default function AccessibleTours() {
  const { t, language } = useLanguage();

  usePageMeta({
    title: "Accessible Tours Chiang Mai",
    description:
      "Wheelchair accessible and mobility-friendly 4x4 tours in Chiang Mai, Thailand. Adapted vehicles, customized itineraries, and experienced guides for travelers with disabilities.",
    ogTitle: "Accessible Tours Chiang Mai | WIRO 4x4",
    ogDescription:
      "Adapted 4x4 vehicles, customized itineraries, and patient guides. Experience Chiang Mai regardless of mobility level.",
    canonicalPath: "/accessible-tours",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Accessible & Family-Friendly Tours in Chiang Mai",
      description:
        "Wheelchair accessible and mobility-friendly 4x4 tours in Chiang Mai with adapted vehicles and customized itineraries.",
      serviceType: "TourOperator",
      audience: {
        "@type": "Audience",
        audienceType:
          "Travelers with disabilities, Wheelchair users, Families with children",
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
    "Hi WIRO 4x4! I'd like to discuss accessible tour options in Chiang Mai. Can you help with my specific needs?",
    "היי WIRO 4x4! אשמח לדון באפשרויות טיול נגיש בצ'יאנג מאי. אפשר לעזור עם הצרכים הספציפיים שלי?"
  );

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb items={[{ label: t("Accessible Tours", "טיולים נגישים") }]} />
      <main id="main-content">
        {/* Hero */}
        <section className="relative min-h-[50vh] overflow-hidden">
          <OptimizedImage
            src="chiang_mai_valley"
            alt={t(
              "Accessible off-road tour vehicle overlooking Chiang Mai valley",
              "רכב טיול נגיש משקיף על עמק צ'יאנג מאי"
            )}
            className="w-full h-full absolute inset-0 object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Accessibility className="w-4 h-4" />
                {t("Accessible Adventures", "הרפתקאות נגישות")}
              </div>
              <h1 className="text-4xl md:text-5xl font-medium text-white mb-4">
                {t(
                  "Accessible Tours in Chiang Mai",
                  "טיולים נגישים בצ'יאנג מאי"
                )}
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                {t(
                  "Northern Thailand's natural beauty shouldn't be limited by mobility. We adapt our tours to make it possible for everyone.",
                  "היופי הטבעי של צפון תאילנד לא צריך להיות מוגבל בגלל ניידות. אנחנו מתאימים את הטיולים כדי לאפשר לכולם."
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="py-16 md:py-24">
          <div className="container max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t(
                  "How We Make Tours Accessible",
                  "איך אנחנו הופכים טיולים לנגישים"
                )}
              </h2>
              <GoldDivider />
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t(
                  "Every tour starts with a conversation about your specific needs. We then customize everything to ensure comfort and enjoyment.",
                  "כל טיול מתחיל בשיחה על הצרכים הספציפיים שלכם. אנחנו מתאימים הכל כדי להבטיח נוחות והנאה."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ACCESSIBILITY_FEATURES.map((feature, idx) => {
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

        {/* Recommended Accessible Tours */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t(
                  "Most Accessible Tour Options",
                  "אפשרויות הטיול הנגישות ביותר"
                )}
              </h2>
              <GoldDivider />
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t(
                  "These tours have the most accessible infrastructure, but we can adapt any tour to your needs.",
                  "לטיולים אלה יש את התשתית הנגישה ביותר, אבל אנחנו יכולים להתאים כל טיול לצרכים שלכם."
                )}
              </p>
            </div>

            <div className="space-y-6">
              {ACCESSIBLE_TOURS.map(tour => (
                <Card key={tour.slug} className="overflow-hidden rounded-sm">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-48 md:h-auto">
                      <img
                        src={tour.image}
                        alt={t(
                          `${tour.name} - Accessible tour in Chiang Mai`,
                          `${tour.nameHe} - טיול נגיש בצ'יאנג מאי`
                        )}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 md:w-2/3">
                      <div className="flex items-center gap-2 mb-2">
                        <Accessibility className="w-5 h-5 text-accent" />
                        <h3 className="text-xl font-semibold">
                          {t(tour.name, tour.nameHe)}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {t(tour.access[0], tour.access[1])}
                      </p>
                      <Link href={`/tours/${tour.slug}`}>
                        <span className="text-accent text-sm font-medium hover:underline cursor-pointer">
                          {t("View Full Tour Details", "ראו פרטי טיול מלאים")}{" "}
                          &rarr;
                        </span>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What We Need to Know */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t("Tell Us About Your Needs", "ספרו לנו על הצרכים שלכם")}
              </h2>
              <GoldDivider />
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t(
                  "To create the perfect accessible tour, we'll ask about:",
                  "כדי ליצור את הטיול הנגיש המושלם, נשאל על:"
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  en: "Type of mobility equipment (wheelchair, walker, cane, etc.)",
                  he: "סוג ציוד הניידות (כיסא גלגלים, הליכון, מקל וכו')",
                },
                {
                  en: "Level of mobility and walking distance comfort",
                  he: "רמת הניידות ומרחק הליכה נוח",
                },
                {
                  en: "Vehicle transfer assistance needed",
                  he: "עזרה נדרשת להעברה לרכב",
                },
                {
                  en: "Rest stop frequency preferences",
                  he: "העדפות לתדירות עצירות מנוחה",
                },
                {
                  en: "Specific destinations or experiences you want to see",
                  he: "יעדים או חוויות ספציפיות שרוצים לראות",
                },
                {
                  en: "Any medical considerations we should know about",
                  he: "שיקולים רפואיים שכדאי שנדע עליהם",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-sm bg-accent/5"
                >
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">{t(item.en, item.he)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-primary text-white">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              {t(
                "Let's Plan Your Accessible Adventure",
                "בואו נתכנן את ההרפתקה הנגישה שלכם"
              )}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {t(
                "Every traveler deserves to experience Chiang Mai's beauty. Contact us to discuss your specific needs and we'll make it happen.",
                "כל מטייל ראוי לחוות את היופי של צ'יאנג מאי. צרו קשר לדון בצרכים הספציפיים שלכם ונגשים את זה."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <TrackedWhatsAppLink
                sourceCode={
                  language === "he"
                    ? "ACCESSIBLE-PAGE-HE"
                    : "ACCESSIBLE-PAGE-EN"
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
                  <Phone className="w-5 h-5" />
                  {t("Request Custom Quote", "בקשו הצעת מחיר מותאמת")}
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
