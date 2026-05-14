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
      "Scenic drive back with practical recommendations for dinner, Shabbat timing, and your next Chiang Mai plans.",
      "נסיעה נופית חזרה עם המלצות פרקטיות לארוחת ערב, זמני שבת והמשך התכנון בצ׳אנג מאי.",
    ],
  },
];

const HEBREW_TRAVEL_INTENTS = [
  {
    title: ["Private 4x4 trips from Chiang Mai", "טיול ג׳יפים פרטי בצ׳אנג מאי"],
    desc: [
      "For Israeli families, couples, and small groups who want a flexible 4x4 day in Northern Thailand with Hebrew or English planning support.",
      "למשפחות, זוגות וקבוצות קטנות מישראל שמחפשות טיול ג׳יפים בצ׳אנג מאי בקצב פרטי, עם תכנון בעברית או באנגלית.",
    ],
  },
  {
    title: [
      "Hebrew support for route decisions",
      "מדריך דובר עברית בצ׳יאנג מאי לתכנון המסלול",
    ],
    desc: [
      "Compare Doi Inthanon, Mae Kampong, Sticky Waterfalls, Mae Rim, and other route ideas before you decide what fits your dates and group.",
      "אפשר להשוות בין דוי אינתנון, מאה קמפונג, מפלים דביקים, מאה רים ועוד לפני שבוחרים מה מתאים לתאריכים ולקבוצה שלכם.",
    ],
  },
  {
    title: [
      "Kosher-friendly logistics when needed",
      "לוגיסטיקה ידידותית לכשרות לפי הצורך",
    ],
    desc: [
      "If your group needs kosher-friendly food planning, tell us in advance and we will explain realistic options before confirming the itinerary.",
      "אם הקבוצה צריכה תכנון אוכל ידידותי לכשרות, כתבו לנו מראש ונציג אפשרויות ריאליות לפני סגירת המסלול.",
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
        "Hi WIRO 4x4! I'm looking for a Hebrew-speaking guide in Chiang Mai. Can you tell me more?",
        "היי WIRO 4x4! אני מחפש/ת מדריך דובר עברית בצ'יאנג מאי. אפשר לשמוע עוד?"
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

        {/* Israeli traveler search intent */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t(
                  "What Israeli Travelers Search For",
                  "מה ישראלים מחפשים בצפון תאילנד"
                )}
              </h2>
              <GoldDivider />
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                {t(
                  "Whether you spell it Chiang Mai, צ׳יאנג מאי, צ׳אנג מאי, or צאנג מאי, the question is usually the same: how to build a private, safe, flexible 4x4 trip that fits your family or group.",
                  "בין אם כותבים צ׳יאנג מאי, צ׳אנג מאי או צאנג מאי, השאלה בדרך כלל דומה: איך בונים טיול 4x4 פרטי, בטוח וגמיש שמתאים למשפחה או לקבוצה שלכם."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HEBREW_TRAVEL_INTENTS.map((intent, idx) => (
                <Card key={idx} className="p-6 rounded-sm border-border">
                  <h3 className="text-lg font-semibold mb-3">
                    {t(intent.title[0], intent.title[1])}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(intent.desc[0], intent.desc[1])}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Sample Day Itinerary */}
        <section className="py-16 md:py-24">
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

        {/* FAQ for Israeli travelers */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t("Hebrew Guide FAQ", "שאלות נפוצות על מדריך בעברית")}
              </h2>
              <GoldDivider />
            </div>

            <div className="space-y-4">
              {[
                {
                  question: [
                    "Can we book a Hebrew-speaking guide in Chiang Mai for a private group?",
                    "אפשר להזמין מדריך דובר עברית בצ׳אנג מאי לקבוצה פרטית?",
                  ],
                  answer: [
                    "Yes. Send your dates, group size, pickup area, preferred language, and route ideas on WhatsApp so we can check the right guide and vehicle for you.",
                    "כן. שלחו בוואטסאפ תאריכים, גודל קבוצה, אזור איסוף, שפה מועדפת ורעיונות למסלול כדי שנבדוק מדריך ורכב מתאימים.",
                  ],
                },
                {
                  question: [
                    "Is this a jeep tour in Chiang Mai or a regular city tour?",
                    "זה טיול ג׳יפים בצ׳אנג מאי או טיול עירוני רגיל?",
                  ],
                  answer: [
                    "WIRO focuses on private 4x4 route ideas around Chiang Mai and Northern Thailand — mountain roads, viewpoints, villages, waterfalls, and flexible stops.",
                    "WIRO מתמחה ברעיונות למסלולי 4x4 פרטיים סביב צ׳אנג מאי וצפון תאילנד — דרכי הרים, תצפיות, כפרים, מפלים ועצירות גמישות.",
                  ],
                },
              ].map((item, idx) => (
                <Card key={idx} className="p-6 rounded-sm">
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
