import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { GoldDivider } from "@/components/GoldDivider";
import { Breadcrumb } from "@/components/Breadcrumb";
import { OptimizedImage } from "@/components/OptimizedImage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import {
  MessageCircle,
  Calendar,
  Globe,
  Map,
  Heart,
  Shield,
  Star,
} from "lucide-react";

const GUIDE_BENEFITS = [
  {
    icon: Globe,
    title: ["Fluent Hebrew Communication", "תקשורת שוטפת בעברית"],
    desc: [
      "No language barriers. Ask questions, hear stories, and understand every detail of the tour in your native Hebrew.",
      "בלי מחסומי שפה. שאלו שאלות, שמעו סיפורים והבינו כל פרט בטיול בעברית שלכם.",
    ],
  },
  {
    icon: Heart,
    title: ["Cultural Understanding", "הבנה תרבותית"],
    desc: [
      "Our guides understand Israeli culture, humor, and travel preferences. They know what matters to Israeli families traveling abroad.",
      'המדריכים שלנו מבינים את התרבות הישראלית, ההומור וההעדפות. הם יודעים מה חשוב למשפחות ישראליות שמטיילות בחו"ל.',
    ],
  },
  {
    icon: Map,
    title: ["Local Expertise + Hebrew", "מומחיות מקומית + עברית"],
    desc: [
      "Deep local knowledge of Chiang Mai combined with the ability to explain everything in Hebrew. The best of both worlds.",
      "ידע מקומי מעמיק על צ'יאנג מאי בשילוב היכולת להסביר הכל בעברית. הטוב משני העולמות.",
    ],
  },
  {
    icon: Shield,
    title: ["Safety & Comfort", "בטיחות ונוחות"],
    desc: [
      "In an emergency or when you need help, communication in Hebrew ensures nothing gets lost in translation.",
      "במצב חירום או כשצריכים עזרה, תקשורת בעברית מבטיחה שכלום לא הולך לאיבוד בתרגום.",
    ],
  },
];

const SAMPLE_ITINERARY = [
  {
    time: "07:30",
    title: ["Hotel Pickup", "איסוף מהמלון"],
    desc: [
      "Your Hebrew-speaking guide picks you up and briefs you on the day's adventure — in Hebrew.",
      "המדריך דובר העברית אוסף אתכם ומתדרך על הרפתקת היום — בעברית.",
    ],
  },
  {
    time: "09:00",
    title: ["Off-Road Adventure", "הרפתקת שטח"],
    desc: [
      "4x4 through jungle trails. Your guide explains the flora, fauna, and local stories as you go.",
      "נסיעת 4x4 בשבילי ג'ונגל. המדריך מסביר על הצמחייה, החי והסיפורים המקומיים תוך כדי נסיעה.",
    ],
  },
  {
    time: "11:00",
    title: ["Village Experience", "חוויית כפר"],
    desc: [
      "Meet local hill tribe communities. Your guide translates and shares cultural context you'd never get otherwise.",
      "פגשו קהילות שבטי הרים. המדריך מתרגם ומשתף הקשר תרבותי שלא הייתם מקבלים אחרת.",
    ],
  },
  {
    time: "12:30",
    title: ["Kosher Lunch", "ארוחת צהריים כשרה"],
    desc: [
      "Pre-arranged kosher meal at a local spot or packed kosher lunch. Dietary needs fully handled.",
      "ארוחה כשרה שסודרה מראש במקום מקומי או ארוחה כשרה ארוזה. כל הצרכים התזונתיים מטופלים.",
    ],
  },
  {
    time: "14:00",
    title: ["Nature & Waterfalls", "טבע ומפלים"],
    desc: [
      "Hike to hidden waterfalls and viewpoints. Stories and history explained in Hebrew along the way.",
      "טיול למפלים נסתרים ותצפיות. סיפורים והיסטוריה בעברית לאורך הדרך.",
    ],
  },
  {
    time: "16:30",
    title: ["Return to Chiang Mai", "חזרה לצ'יאנג מאי"],
    desc: [
      "Scenic drive back with recommendations for evening dining, Chabad services, and more.",
      'נסיעה נופית חזרה עם המלצות לארוחת ערב, שירותי חב"ד ועוד.',
    ],
  },
];

export default function HebrewGuide() {
  const { t } = useLanguage();

  usePageMeta({
    title: "Hebrew Speaking Guide Chiang Mai",
    description:
      "Explore Chiang Mai with a Hebrew-speaking guide. WIRO 4x4 offers private off-road tours with fluent Hebrew guides for Israeli travelers and families.",
    ogTitle: "Hebrew Speaking Guide Chiang Mai | WIRO 4x4",
    ogDescription:
      "Private 4x4 tours with Hebrew-speaking guides in Chiang Mai. Perfect for Israeli families and Hebrew-speaking travelers.",
    canonicalPath: "/hebrew-guide",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Hebrew-Speaking Guide Tours in Chiang Mai",
      description:
        "Private off-road tours in Chiang Mai with fluent Hebrew-speaking guides for Israeli and Hebrew-speaking travelers.",
      serviceType: "TourOperator",
      inLanguage: ["he", "en"],
      audience: {
        "@type": "Audience",
        audienceType: "Israeli travelers, Hebrew-speaking travelers",
      },
      areaServed: { "@type": "City", name: "Chiang Mai" },
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
        "Hi WIRO 4x4, we'd like to check availability and price for a Hebrew-speaking guide in Chiang Mai. Dates/group size:",
        "היי WIRO 4x4, אנחנו רוצים לבדוק זמינות ומחיר למדריך דובר עברית בצ'יאנג מאי. תאריכים/גודל קבוצה:"
      )
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb
        items={[{ label: t("Hebrew Speaking Guide", "מדריך דובר עברית") }]}
      />
      <main id="main-content">
        {/* Hero */}
        <section className="relative min-h-[50vh] overflow-hidden">
          <OptimizedImage
            src="mountain_village_view"
            alt={t(
              "Hebrew speaking guide leading a tour in Chiang Mai mountains",
              "מדריך דובר עברית מוביל טיול בהרי צ'יאנג מאי"
            )}
            className="w-full h-full absolute inset-0 object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Globe className="w-4 h-4" />
                {t("Hebrew Speaking Guide", "מדריך דובר עברית")}
              </div>
              <h1 className="text-4xl md:text-5xl font-medium text-white mb-4">
                {t(
                  "Hebrew Speaking Guide in Chiang Mai",
                  "מדריך דובר עברית בצ'יאנג מאי"
                )}
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                {t(
                  "Experience Northern Thailand like an insider — with a guide who speaks your language and understands your culture.",
                  "חוו את צפון תאילנד כמו מקומיים — עם מדריך שמדבר את השפה שלכם ומבין את התרבות שלכם."
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Hebrew content block for Hebrew SEO */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t(
                  "Why a Hebrew Guide Makes All the Difference",
                  "למה מדריך בעברית משנה את הכל"
                )}
              </h2>
              <GoldDivider />
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t(
                  "When you travel with a Hebrew-speaking guide, you don't just see the sights — you understand them. Every story, every explanation, every joke lands.",
                  "כשמטיילים עם מדריך דובר עברית, לא רק רואים את האתרים — מבינים אותם. כל סיפור, כל הסבר, כל בדיחה מגיעה."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GUIDE_BENEFITS.map((benefit, idx) => {
                const Icon = benefit.icon;
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
                          {t(benefit.title[0], benefit.title[1])}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {t(benefit.desc[0], benefit.desc[1])}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sample Day Itinerary */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t("A Typical Day with Your Guide", "יום טיפוסי עם המדריך")}
              </h2>
              <GoldDivider />
            </div>

            <div className="space-y-4">
              {SAMPLE_ITINERARY.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 border border-border rounded-sm bg-card"
                >
                  <div className="w-16 text-center shrink-0">
                    <span className="text-accent font-bold text-lg">
                      {item.time}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">
                      {t(item.title[0], item.title[1])}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t(item.desc[0], item.desc[1])}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Israeli Travelers Say */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t("What Israeli Travelers Say", "מה מטיילים ישראלים אומרים")}
              </h2>
              <GoldDivider />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  quote: [
                    "Having a Hebrew guide changed everything. Our kids understood the stories, we could ask real questions, and it felt like traveling with a friend.",
                    "מדריך בעברית שינה הכל. הילדים הבינו את הסיפורים, יכולנו לשאול שאלות אמיתיות, והרגשנו כמו שמטיילים עם חבר.",
                  ],
                  name: ["Yael & Dror, Tel Aviv", "יעל ודרור, תל אביב"],
                },
                {
                  quote: [
                    "We tried an English tour before and missed so much. With WIRO's Hebrew guide, we got the real Thailand experience without any language gaps.",
                    "ניסינו טיול באנגלית לפני כן והפסדנו המון. עם המדריך העברי של WIRO קיבלנו את חוויית תאילנד האמיתית בלי פערי שפה.",
                  ],
                  name: ["The Levi Family, Haifa", "משפחת לוי, חיפה"],
                },
              ].map((testimonial, idx) => (
                <Card key={idx} className="p-6 rounded-sm">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-accent fill-accent"
                      />
                    ))}
                  </div>
                  <blockquote className="text-sm italic text-muted-foreground mb-3 leading-relaxed">
                    {t(testimonial.quote[0], testimonial.quote[1])}
                  </blockquote>
                  <p className="text-sm font-medium">
                    {t(testimonial.name[0], testimonial.name[1])}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Available Tours */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-3">
              {t(
                "All Tours Include Hebrew Guide Option",
                "כל הטיולים כוללים אפשרות מדריך בעברית"
              )}
            </h2>
            <GoldDivider />
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              {t(
                "Choose any of our 6 day trips. Just request a Hebrew-speaking guide when booking — it's that simple.",
                "בחרו כל אחד מ-6 הטיולים היומיים שלנו. פשוט בקשו מדריך דובר עברית כשמזמינים — ככה פשוט."
              )}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                {
                  slug: "doi-inthanon-roof-of-thailand",
                  name: "Doi Inthanon",
                  nameHe: "דוי אינתנון",
                },
                {
                  slug: "mae-kampong-hidden-village",
                  name: "Mae Kampong",
                  nameHe: "מאה קמפונג",
                },
                {
                  slug: "maerim-sticky-waterfalls",
                  name: "Sticky Waterfalls",
                  nameHe: "מפלים דביקים",
                },
                {
                  slug: "doi-suthep-pui-beyond-temple",
                  name: "Doi Suthep-Pui",
                  nameHe: "דוי סוטפ-פוי",
                },
                {
                  slug: "mae-wang-jungle-wilderness",
                  name: "Mae Wang",
                  nameHe: "מאה וואנג",
                },
                {
                  slug: "samoeng-loop-mountain-circuit",
                  name: "Samoeng Loop",
                  nameHe: "לולאת סמאנג",
                },
              ].map(tour => (
                <Link key={tour.slug} href={`/tours/${tour.slug}`}>
                  <span className="inline-block border border-accent/30 hover:border-accent hover:bg-accent/5 px-4 py-2 rounded-full text-sm transition-colors cursor-pointer">
                    {t(tour.name, tour.nameHe)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-primary text-white">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              {t("Ready to Explore in Hebrew?", "מוכנים לטייל בעברית?")}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {t(
                "Tell us your travel dates and we'll match you with the perfect Hebrew-speaking guide for your Chiang Mai adventure.",
                "ספרו לנו את תאריכי הנסיעה ונתאים לכם מדריך דובר עברית מושלם להרפתקה שלכם בצ'יאנג מאי."
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
                  {t("Book a Tour", "הזמינו טיול")}
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
