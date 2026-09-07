import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactOptions } from "@/components/ContactOptions";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function MotorcycleTours() {
  const { t, language } = useLanguage();
  usePageMeta({
    title: t(
      "Motorcycle Tours in Northern Thailand",
      "טיולי אופנועים בצפון תאילנד"
    ),
    description: t(
      "Plan a motorcycle journey in Northern Thailand for a group of five or more riders, with WIRO's itinerary planning and support.",
      "תכנון טיול אופנועים בצפון תאילנד לקבוצות של חמישה רוכבים ומעלה, עם תכנון וליווי של WIRO."
    ),
    canonicalPath: "/motorcycle-tours",
  });
  const sections = [
    [
      "A route shaped around your riders",
      "מסלול שמתאים לרוכבים שלכם",
      "Explore Northern Thailand's mountain roads, forests, villages and viewpoints. Tell us how many days you have, your riding experience and preferred daily pace so we can propose a route.",
      "גלו כבישים הרריים, יערות, כפרים ונקודות תצפית בצפון תאילנד. ספרו לנו כמה ימים עומדים לרשותכם, מה ניסיון הרכיבה שלכם ומה הקצב המועדף, כדי שנציע מסלול מתאים.",
    ],
    [
      "Travel together, with support",
      "רוכבים יחד, עם ליווי",
      "For groups of at least five riders. Planning can include hotels suited to your group and a support vehicle for equipment. Discuss your motorcycle, equipment and guide requirements with us before confirming.",
      "לקבוצות של חמישה רוכבים לפחות. התכנון יכול לכלול מלונות שמתאימים לקבוצה ורכב תמיכה לציוד. נתאם איתכם את האופנועים, הציוד וההדרכה הנדרשים לפני האישור.",
    ],
    [
      "Make it your trip",
      "התאימו את הטיול אליכם",
      "Ask about a professional riding guide, riding lessons, a private chef and kosher meals. The team will confirm availability, the final itinerary and what is included in your proposal.",
      "שאלו על מדריך רכיבה מקצועי, שיעורי רכיבה, שף פרטי ואוכל כשר. הצוות יאשר זמינות, את המסלול הסופי ומה כלול בהצעה שלכם.",
    ],
    [
      "Start with your group details",
      "מתחילים בפרטי הקבוצה",
      "Send your preferred dates, number of riders, riding experience and must-see places. We will discuss the route and send a tailored proposal for your review before booking.",
      "שלחו תאריכים מועדפים, מספר רוכבים, ניסיון רכיבה ויעדים שתרצו לראות. נתכנן איתכם את המסלול ונשלח הצעה מותאמת לאישורכם לפני ההזמנה.",
    ],
  ];
  return (
    <>
      <Header />
      <main
        id="main-content"
        dir={language === "he" ? "rtl" : "ltr"}
        className="pt-28 pb-16"
      >
        <section className="container max-w-5xl">
          <p className="text-primary font-semibold mb-3">
            {t(
              "Minimum 5 riders · Northern Thailand",
              "מינימום 5 רוכבים · צפון תאילנד"
            )}
          </p>
          <h1 className="text-4xl md:text-5xl font-heading mb-6">
            {t("Motorcycle Tours in the North", "טיולי אופנועים בצפון")}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t(
              "Winding mountain roads. Your group. A journey planned together.",
              "כבישים הרריים מתפתלים. הקבוצה שלכם. מסע שמתכננים יחד."
            )}
          </p>
          <figure>
            <img
              src="/images/optimized/motorcycle-touring-illustration.webp"
              alt={t(
                "Illustration of riders on a mountain road in Northern Thailand",
                "המחשה של רוכבים בכביש הררי בצפון תאילנד"
              )}
              className="w-full max-h-[420px] object-cover rounded-sm"
            />
            <figcaption className="text-xs text-muted-foreground mt-2">
              {t("Tour illustration", "המחשת טיול")}
            </figcaption>
          </figure>
          <div className="grid md:grid-cols-2 gap-8 my-12">
            {sections.map(([en, he, body, bodyHe]) => (
              <section key={en}>
                <h2 className="text-2xl font-semibold mb-3">{t(en, he)}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t(body, bodyHe)}
                </p>
              </section>
            ))}
          </div>
          <section className="bg-muted p-6 md:p-8 rounded-sm max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4">
              {t("Plan your motorcycle tour", "תכננו את טיול האופנועים שלכם")}
            </h2>
            <ContactOptions topic="motorcycle" />
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
