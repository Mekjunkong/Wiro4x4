import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GoldDivider } from "@/components/GoldDivider";
import { Breadcrumb } from "@/components/Breadcrumb";
import { OptimizedImage } from "@/components/OptimizedImage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { WHATSAPP_NUMBER } from "@/const";

interface FAQItem {
  id: string;
  questionEn: string;
  questionHe: string;
  answerEn: string;
  answerHe: string;
  category: "booking" | "tours" | "kosher" | "practical" | "safety";
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "booking-process",
    category: "booking",
    questionEn: "How do I book a tour with WIRO 4x4?",
    questionHe: "איך אני מזמין טיול עם WIRO 4x4?",
    answerEn:
      "Booking is easy! You can use our online booking form, send us a message on WhatsApp, or email us directly. We recommend booking at least 48 hours in advance to secure your preferred date and tour. For peak season (November-February), we suggest booking 1-2 weeks ahead.",
    answerHe:
      "ההזמנה קלה! ניתן להשתמש בטופס ההזמנה המקוון שלנו, לשלוח לנו הודעה בוואטסאפ, או לשלוח לנו מייל ישירות. אנו ממליצים להזמין לפחות 48 שעות מראש כדי להבטיח את התאריך והטיול המועדפים עליכם. בעונת השיא (נובמבר-פברואר), אנו מציעים להזמין 1-2 שבועות מראש.",
  },
  {
    id: "cancellation-policy",
    category: "booking",
    questionEn: "What is your cancellation policy?",
    questionHe: "מהי מדיניות הביטול שלכם?",
    answerEn:
      "We offer free cancellation up to 48 hours before the tour start time. Cancellations within 24-48 hours receive a 50% refund. Cancellations less than 24 hours before the tour are non-refundable. In case of severe weather, we will reschedule at no extra cost.",
    answerHe:
      "אנו מציעים ביטול חינם עד 48 שעות לפני מועד תחילת הטיול. ביטולים בין 24 ל-48 שעות מקבלים החזר של 50%. ביטולים פחות מ-24 שעות לפני הטיול אינם ניתנים להחזר. במקרה של מזג אוויר קיצוני, נתזמן מחדש ללא עלות נוספת.",
  },
  {
    id: "payment-methods",
    category: "booking",
    questionEn: "What payment methods do you accept?",
    questionHe: "אילו אמצעי תשלום אתם מקבלים?",
    answerEn:
      "We accept bank transfers, cash (Thai Baht, US Dollars, Israeli Shekels), and major credit cards. A 30% deposit is required to confirm your booking, with the remaining balance due on the day of the tour. We will send you payment details after your booking is confirmed.",
    answerHe:
      "אנו מקבלים העברות בנקאיות, מזומן (באט תאילנדי, דולר אמריקאי, שקל ישראלי), וכרטיסי אשראי מרכזיים. נדרשת מקדמה של 30% לאישור ההזמנה, כאשר היתרה משולמת ביום הטיול. נשלח לכם פרטי תשלום לאחר אישור ההזמנה.",
  },
  {
    id: "kosher-food",
    category: "kosher",
    questionEn: "What kosher food options are available during tours?",
    questionHe: "אילו אפשרויות אוכל כשר זמינות במהלך הטיולים?",
    answerEn:
      "We provide fully kosher meals on all our tours, including breakfast, lunch, and snacks. Our meals are prepared with kosher-certified ingredients and follow strict kashrus standards. We can accommodate glatt kosher, mehadrin, and various dietary preferences. Vegetarian and vegan kosher options are also available upon request.",
    answerHe:
      "אנו מספקים ארוחות כשרות מלאות בכל הטיולים שלנו, כולל ארוחת בוקר, ארוחת צהריים וחטיפים. הארוחות שלנו מוכנות עם מרכיבים בעלי הכשר ועומדות בסטנדרטים מחמירים של כשרות. אנו יכולים להתאים כשר גלאט, מהדרין, והעדפות תזונתיות שונות. אפשרויות כשרות צמחוניות וטבעוניות זמינות גם לפי בקשה.",
  },
  {
    id: "shabbat-observance",
    category: "kosher",
    questionEn: "How do you handle Shabbat observance during multi-day trips?",
    questionHe: "איך אתם מתמודדים עם שמירת שבת בטיולים רב-יומיים?",
    answerEn:
      "We fully respect Shabbat observance. Multi-day trips are planned so you can rest at a comfortable hotel on Shabbat. We arrange Shabbat-friendly accommodations with pre-set timers, nearby synagogues when available, and kosher Shabbat meals. No driving or activities are scheduled during Shabbat hours.",
    answerHe:
      "אנו מכבדים באופן מלא את שמירת השבת. טיולים רב-יומיים מתוכננים כך שתוכלו לנוח במלון נוח בשבת. אנו מסדרים לינה מותאמת לשבת עם שעוני שבת, בתי כנסת קרובים כשאפשר, וארוחות שבת כשרות. לא מתוכננות נסיעות או פעילויות בשעות השבת.",
  },
  {
    id: "hebrew-guide",
    category: "tours",
    questionEn: "Do you offer Hebrew-speaking guides?",
    questionHe: "האם אתם מציעים מדריכים דוברי עברית?",
    answerEn:
      "Yes! Our founder Wiro speaks fluent Hebrew and serves as the primary guide for most tours. Having a Hebrew-speaking guide means no language barriers, easy communication, and a deeper connection with the local culture. Wiro has extensive experience working with Israeli travelers and understands the specific needs of Hebrew-speaking guests.",
    answerHe:
      "כן! המייסד שלנו וירו דובר עברית שוטפת ומשמש כמדריך הראשי ברוב הטיולים. מדריך דובר עברית משמעו ללא מחסומי שפה, תקשורת קלה, וחיבור עמוק יותר עם התרבות המקומית. לווירו ניסיון רב בעבודה עם מטיילים ישראליים והוא מבין את הצרכים הספציפיים של אורחים דוברי עברית.",
  },
  {
    id: "group-sizes",
    category: "tours",
    questionEn: "What group sizes do you accommodate?",
    questionHe: "לאילו גדלי קבוצות אתם מתאימים?",
    answerEn:
      "Our standard tours accommodate groups of 1-6 people per vehicle. For larger groups (7+), we can arrange multiple vehicles and provide a custom quote. We also offer private tours for couples, families, and solo travelers. The intimate group size ensures a personalized experience and more flexibility during the tour.",
    answerHe:
      "הטיולים הרגילים שלנו מתאימים לקבוצות של 1-6 אנשים לרכב. לקבוצות גדולות יותר (7+), אנו יכולים לסדר מספר רכבים ולספק הצעת מחיר מותאמת. אנו גם מציעים טיולים פרטיים לזוגות, משפחות ומטיילים יחידים. גודל הקבוצה האינטימי מבטיח חוויה אישית וגמישות רבה יותר במהלך הטיול.",
  },
  {
    id: "children-welcome",
    category: "tours",
    questionEn: "Are children welcome on tours? What are the age policies?",
    questionHe: "האם ילדים מתקבלים בטיולים? מהן מדיניות הגילאים?",
    answerEn:
      "Absolutely! Children of all ages are welcome. Children under 3 ride free, ages 3-10 receive a 50% discount, and children 11+ are charged the full adult rate. We have child-safe seat belts in all vehicles, and our guides are experienced with family groups. Some tours are better suited for families - just ask us for recommendations.",
    answerHe:
      "בהחלט! ילדים בכל הגילאים מתקבלים בברכה. ילדים מתחת לגיל 3 נוסעים בחינם, גילאי 3-10 מקבלים הנחה של 50%, וילדים מגיל 11+ משלמים מחיר מבוגר מלא. יש לנו חגורות בטיחות מותאמות לילדים בכל הרכבים, והמדריכים שלנו מנוסים עם קבוצות משפחתיות. חלק מהטיולים מתאימים יותר למשפחות - פשוט שאלו אותנו להמלצות.",
  },
  {
    id: "what-to-bring",
    category: "practical",
    questionEn: "What should I bring on a tour?",
    questionHe: "מה כדאי להביא לטיול?",
    answerEn:
      "We recommend bringing: comfortable hiking shoes or sandals with grip, sunscreen (SPF 50+), insect repellent, a hat or cap, a light rain jacket (especially during rainy season May-October), a refillable water bottle, a camera, and any personal medications. We provide drinking water and snacks on all tours.",
    answerHe:
      "אנו ממליצים להביא: נעלי הליכה נוחות או סנדלים עם אחיזה, קרם הגנה (SPF 50+), דוחה חרקים, כובע או מצחייה, מעיל גשם קל (במיוחד בעונת הגשמים מאי-אוקטובר), בקבוק מים למילוי חוזר, מצלמה, ותרופות אישיות. אנו מספקים מי שתייה וחטיפים בכל הטיולים.",
  },
  {
    id: "weather-conditions",
    category: "practical",
    questionEn:
      "What is the best time to visit Chiang Mai? How does weather affect tours?",
    questionHe:
      "מהו הזמן הטוב ביותר לבקר בצ'יאנג מאי? איך מזג האוויר משפיע על הטיולים?",
    answerEn:
      "The best season is November to February (cool and dry, 15-30°C). March to May is hot season (up to 40°C). June to October is rainy season - off-road trails can be muddier but the waterfalls are spectacular! We operate year-round and adjust routes based on conditions. If severe weather makes a tour unsafe, we will reschedule at no extra cost.",
    answerHe:
      "העונה הטובה ביותר היא נובמבר עד פברואר (קריר ויבש, 15-30 מעלות). מרץ עד מאי הוא עונה חמה (עד 40 מעלות). יוני עד אוקטובר הוא עונת הגשמים - שבילי השטח יכולים להיות בוציים יותר אבל המפלים מרהיבים! אנו פועלים כל השנה ומתאימים מסלולים לפי התנאים. אם מזג אוויר קיצוני הופך טיול ללא בטוח, נתזמן מחדש ללא עלות נוספת.",
  },
  {
    id: "accessibility",
    category: "practical",
    questionEn: "Are your tours accessible for people with limited mobility?",
    questionHe: "האם הטיולים שלכם נגישים לאנשים עם מוגבלות בניידות?",
    answerEn:
      "We do our best to accommodate guests with limited mobility. Our 4x4 vehicles have high clearance and step assists. Some tours involve moderate walking on uneven terrain, but we can customize itineraries to reduce walking distances. Please let us know about any mobility needs when booking so we can plan the best experience for you.",
    answerHe:
      "אנו עושים כמיטב יכולתנו להתאים את הטיולים לאורחים עם מוגבלות בניידות. לרכבי השטח שלנו יש גובה מרווח ומדרגות עזר. חלק מהטיולים כוללים הליכה מתונה בשטח לא אחיד, אבל אנו יכולים להתאים מסלולים כדי לצמצם מרחקי הליכה. אנא הודיעו לנו על כל צורך בנגישות בעת ההזמנה כדי שנוכל לתכנן את החוויה הטובה ביותר עבורכם.",
  },
  {
    id: "transport-pickup",
    category: "practical",
    questionEn: "Do you provide hotel pickup and drop-off?",
    questionHe: "האם אתם מספקים איסוף והחזרה מהמלון?",
    answerEn:
      "Yes! All our tours include complimentary pickup and drop-off from your hotel or accommodation in Chiang Mai city center and most surrounding areas. Pickup is typically between 7:00-8:00 AM depending on the tour. For accommodations outside the standard pickup zone, we can arrange transport for a small additional fee.",
    answerHe:
      "כן! כל הטיולים שלנו כוללים איסוף והחזרה חינם מהמלון או מקום הלינה שלכם במרכז העיר צ'יאנג מאי ורוב האזורים הסובבים. האיסוף הוא בדרך כלל בין 7:00-8:00 בבוקר בהתאם לטיול. ללינה מחוץ לאזור האיסוף הרגיל, אנו יכולים לסדר הסעה בתוספת תשלום קטנה.",
  },
  {
    id: "safety-measures",
    category: "safety",
    questionEn: "What safety measures do you have in place?",
    questionHe: "אילו אמצעי בטיחות יש לכם?",
    answerEn:
      "Safety is our top priority. All our 4x4 vehicles are regularly maintained and inspected. Our drivers are experienced off-road professionals who know every trail. We carry first aid kits, emergency communication devices, and drinking water on every tour. We also have comprehensive insurance coverage for all passengers and provide safety briefings before each tour.",
    answerHe:
      "הבטיחות היא בראש סדר העדיפויות שלנו. כל רכבי השטח שלנו עוברים תחזוקה ובדיקה קבועה. הנהגים שלנו הם אנשי מקצוע מנוסים בנהיגת שטח שמכירים כל שביל. אנו נושאים ערכות עזרה ראשונה, מכשירי תקשורת חירום ומי שתייה בכל טיול. יש לנו גם כיסוי ביטוחי מקיף לכל הנוסעים ואנו מעבירים תדריך בטיחות לפני כל טיול.",
  },
  {
    id: "custom-tours",
    category: "tours",
    questionEn: "Can I create a custom tour itinerary?",
    questionHe: "האם אפשר ליצור מסלול טיול מותאם אישית?",
    answerEn:
      "Absolutely! We love creating custom itineraries tailored to your interests, fitness level, and schedule. Whether you want to focus on temples, nature, local villages, food experiences, or a mix of everything - we can design the perfect tour for you. Custom tours can be single-day or multi-day. Contact us with your preferences and we will prepare a personalized proposal.",
    answerHe:
      "בהחלט! אנו אוהבים ליצור מסלולים מותאמים אישית להתאמה לתחומי העניין, רמת הכושר ולוח הזמנים שלכם. בין אם אתם רוצים להתמקד במקדשים, טבע, כפרים מקומיים, חוויות אוכל, או שילוב של הכל - אנו יכולים לעצב את הטיול המושלם עבורכם. טיולים מותאמים אישית יכולים להיות ליום אחד או למספר ימים. צרו איתנו קשר עם ההעדפות שלכם ונכין הצעה אישית.",
  },
];

const CATEGORIES = [
  { id: "all", en: "All Questions", he: "כל השאלות" },
  { id: "booking", en: "Booking & Payment", he: "הזמנה ותשלום" },
  { id: "tours", en: "Tours & Guides", he: "טיולים ומדריכים" },
  { id: "kosher", en: "Kosher & Shabbat", he: "כשרות ושבת" },
  { id: "practical", en: "Practical Info", he: "מידע מעשי" },
  { id: "safety", en: "Safety", he: "בטיחות" },
];

export default function FAQ() {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map(item => ({
      "@type": "Question",
      name: item.questionEn,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answerEn,
      },
    })),
  };

  usePageMeta({
    title: t("Frequently Asked Questions", "שאלות נפוצות"),
    description:
      "Find answers to common questions about WIRO 4x4 kosher off-road tours in Chiang Mai - booking, kosher food, Hebrew guides, safety, and more.",
    canonicalPath: "/faq",
    jsonLd: faqJsonLd,
  });

  const sectionRef = useScrollReveal<HTMLDivElement>({ stagger: 0.08 });

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredFAQs =
    selectedCategory === "all"
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter(item => item.category === selectedCategory);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, "")}?text=${encodeURIComponent("Hi! I have a question about WIRO 4x4 tours.")}`;

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb
        items={[
          {
            label: t("FAQ", "שאלות נפוצות"),
          },
        ]}
      />
      <main id="main-content">
        {/* Hero Banner */}
        <section className="relative h-[50vh] min-h-[320px] max-h-[500px] mt-20 overflow-hidden">
          <OptimizedImage
            src="wiro_crew_team"
            alt={t(
              "WIRO 4x4 team ready for adventure",
              "צוות WIRO 4x4 מוכן להרפתקה"
            )}
            className="absolute inset-0 w-full h-full object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/70" />
          <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
            <HelpCircle className="w-10 h-10 mb-3 opacity-90 drop-shadow-lg" />
            <h1 className="text-3xl md:text-5xl font-heading font-normal mb-3 drop-shadow-lg">
              {t("Frequently Asked Questions", "שאלות נפוצות")}
            </h1>
            <GoldDivider />
            <p className="text-lg md:text-xl opacity-95 max-w-2xl mx-auto drop-shadow-md">
              {t(
                "Everything you need to know about our kosher off-road adventures in Northern Thailand",
                "כל מה שצריך לדעת על הרפתקאות השטח הכשרות שלנו בצפון תאילנד"
              )}
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="container py-8">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "bg-accent text-white shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent"
                }`}
              >
                {isHebrew ? cat.he : cat.en}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div ref={sectionRef} className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map(item => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-b border-border/50"
                >
                  <AccordionTrigger className="text-base font-semibold text-foreground hover:text-accent hover:no-underline py-5 [&[data-state=open]]:text-accent">
                    {isHebrew ? item.questionHe : item.questionEn}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-[0.95rem] pb-5">
                    {isHebrew ? item.answerHe : item.answerEn}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFAQs.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                {t(
                  "No questions found in this category.",
                  "לא נמצאו שאלות בקטגוריה זו."
                )}
              </p>
            )}
          </div>
        </section>

        {/* Still Have Questions CTA */}
        <section className="bg-primary/5 py-16">
          <div className="container text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-heading font-normal mb-4 text-foreground">
              {t("Still Have Questions?", "עדיין יש שאלות?")}
            </h2>
            <GoldDivider />
            <p className="text-muted-foreground mb-8 text-lg">
              {t(
                "We are happy to help! Reach out to us on WhatsApp or book a tour directly.",
                "נשמח לעזור! צרו איתנו קשר בוואטסאפ או הזמינו טיול ישירות."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.38 0-4.584-.678-6.467-1.849l-.452-.283-3.196 1.072 1.072-3.196-.283-.452A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                </svg>
                {t("Chat on WhatsApp", "צ'אט בוואטסאפ")}
              </a>
              <Link href="/book">
                <span className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-accent-cta hover:bg-accent-cta-hover text-white font-semibold transition-colors">
                  {t("Book a Tour", "הזמינו טיול")}
                </span>
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
