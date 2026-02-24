import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GoldDivider } from "@/components/GoldDivider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    q: ["Is the food on tours kosher?", "האם האוכל בטיולים כשר?"],
    a: [
      "Yes! All meals provided during our tours are kosher. We work with certified kosher restaurants and caterers in Chiang Mai to ensure all dietary requirements are met.",
      "בוודאי! כל הארוחות בטיולים שלנו כשרות. אנחנו עובדים עם מסעדות וקייטרינג בעלי הכשר בצ'יאנג מאי, ודואגים שהכל עומד בסטנדרטים שלכם.",
    ],
  },
  {
    q: [
      "How do you accommodate Shabbat observance?",
      "איך מתנהלים לגבי שמירת שבת?",
    ],
    a: [
      "We fully respect Shabbat observance. Tours are not scheduled on Shabbat, and we can arrange Shabbat-friendly accommodations near the local Chabad house. Just let us know your needs when booking.",
      'אנחנו מכבדים שמירת שבת לגמרי. לא יוצאים לטיולים בשבת, ואפשר לארגן לינה ליד בית חב"ד המקומי. פשוט ספרו לנו מה אתם צריכים כשמזמינים.',
    ],
  },
  {
    q: ["How safe are the off-road tours?", "כמה בטוחים טיולי השטח?"],
    a: [
      "Safety is our top priority. All vehicles are regularly maintained and equipped with safety features. Our experienced drivers are trained in off-road driving, and we carry first-aid equipment on every tour. We also provide comprehensive safety briefings before each trip.",
      "בטיחות זה הדבר הכי חשוב אצלנו. כל הרכבים עוברים תחזוקה שוטפת ומצוידים כמו שצריך. הנהגים שלנו מנוסים ומאומנים בנהיגת שטח, ויש ציוד עזרה ראשונה בכל טיול. לפני כל יציאה עושים תדריך בטיחות מקיף.",
    ],
  },
  {
    q: [
      "What are the tour prices and what is included?",
      "כמה עולים הטיולים ומה כלול במחיר?",
    ],
    a: [
      "Tour prices vary based on group size, duration, and services selected. Each tour includes a 4x4 vehicle with driver, fuel, and basic insurance. Additional options like kosher meals, hotel arrangements, Hebrew-speaking guides, and attraction entries can be added. Contact us for a personalized quote.",
      "המחירים משתנים לפי גודל הקבוצה, משך הטיול והשירותים שבחרתם. כל טיול כולל רכב 4x4 עם נהג, דלק וביטוח בסיסי. אפשר להוסיף ארוחות כשרות, סידורי מלון, מדריך דובר עברית וכניסה לאטרקציות. דברו איתנו ונתאים לכם הצעת מחיר.",
    ],
  },
  {
    q: ["How do I book a tour?", "איך מזמינים טיול?"],
    a: [
      "You can book directly through our website using the booking form. Simply select your dates, group size, and preferred services. After submitting, our team will contact you within 24 hours to confirm details and finalize your booking. You can also reach us via WhatsApp for quick inquiries.",
      "אפשר להזמין ישירות דרך האתר שלנו עם טופס ההזמנה. בחרו תאריכים, גודל קבוצה ושירותים, ואחרי השליחה הצוות שלנו ייצור קשר תוך 24 שעות לאשר פרטים ולסגור הזמנה. אפשר גם לשלוח לנו הודעה בוואטסאפ.",
    ],
  },
  {
    q: ["What is your cancellation policy?", "מה מדיניות הביטולים שלכם?"],
    a: [
      "We offer free cancellation up to 7 days before the tour date for a full refund. Cancellations within 3-7 days receive a 50% refund. Cancellations less than 3 days before the tour are non-refundable. We recommend travel insurance for unexpected changes.",
      "ביטול עד 7 ימים לפני הטיול -- החזר מלא. ביטול 3-7 ימים לפני -- החזר של 50%. ביטול פחות מ-3 ימים לפני -- ללא החזר כספי. מומלץ לעשות ביטוח נסיעות למקרה של שינויים.",
    ],
  },
  {
    q: [
      "What group sizes do you accommodate?",
      "לכמה אנשים אתם יכולים לארגן טיול?",
    ],
    a: [
      "We cater to all group sizes, from couples and families to large groups of 20+. Our 4x4 vehicles typically seat 4-6 passengers each. For larger groups, we arrange multiple vehicles with coordinated itineraries. Private tours are available for any group size.",
      "מארגנים לכל גודל -- מזוגות ומשפחות ועד קבוצות של 20 ומעלה. כל רכב 4x4 מכיל 4-6 נוסעים. לקבוצות גדולות מתאמים כמה רכבים עם מסלול משותף. טיולים פרטיים זמינים לכל גודל קבוצה.",
    ],
  },
  {
    q: ["What should I bring on the tour?", "מה כדאי להביא לטיול?"],
    a: [
      "We recommend comfortable clothing and closed-toe shoes suitable for outdoor activities. Bring sunscreen, a hat, sunglasses, and a refillable water bottle. A camera is a must for the stunning scenery! During rainy season (June-October), a light rain jacket is advised. We provide all necessary safety equipment.",
      "בגדים נוחים ונעליים סגורות. קחו קרם הגנה, כובע, משקפי שמש ובקבוק מים. מצלמה -- חובה, הנופים פה מטורפים! בעונת הגשמים (יוני-אוקטובר) כדאי מעיל גשם קל. ציוד בטיחות אנחנו מספקים.",
    ],
  },
  {
    q: ["Do you offer Hebrew-speaking guides?", "יש לכם מדריכים דוברי עברית?"],
    a: [
      "Yes! We have Hebrew-speaking guides available for all our tours. Our guides are knowledgeable about the local area, culture, and can communicate fluently in Hebrew and English. Just indicate your language preference when booking.",
      "כן! יש לנו מדריכים דוברי עברית לכל הטיולים. המדריכים שלנו מכירים את האזור לעומק, את התרבות המקומית, ומדברים עברית ואנגלית שוטפות. פשוט ציינו שאתם רוצים מדריך בעברית כשמזמינים.",
    ],
  },
  {
    q: ["Can tours be customized?", "אפשר להתאים את הטיול אישית?"],
    a: [
      "Absolutely! We specialize in custom-tailored experiences. Whether you want to visit specific destinations, need special dietary accommodations, or have a unique itinerary in mind, we will work with you to create the perfect adventure. Contact us to discuss your preferences.",
      "בטח! אנחנו מתמחים בטיולים בהתאמה אישית. רוצים לבקר ביעדים מסוימים? צריכים התאמות תזונתיות? יש לכם מסלול חלום? נבנה אתכם את הטיול המושלם. דברו איתנו ונתאים הכל.",
    ],
  },
  {
    q: [
      "Are tours wheelchair accessible?",
      "האם הטיולים נגישים לכיסאות גלגלים?",
    ],
    a: [
      "We offer adapted tours for travelers with mobility challenges. Our 4x4 vehicles can be configured for easier access, and we customize itineraries to include accessible viewpoints, boardwalk trails, and vehicle-accessible attractions. Contact us to discuss your specific needs and we'll create a personalized accessible itinerary.",
      "אנחנו מציעים טיולים מותאמים למטיילים עם אתגרי ניידות. רכבי ה-4x4 שלנו ניתנים להתאמה לגישה קלה יותר, ואנו מתאימים מסלולים שכוללים תצפיות נגישות, שבילי גשר ואטרקציות נגישות ברכב. צרו קשר לדון בצרכים הספציפיים שלכם ונייצר מסלול נגיש מותאם אישית.",
    ],
  },
  {
    q: [
      "What's the best season for Chiang Mai tours?",
      "מה העונה הטובה ביותר לטיולים בצ'יאנג מאי?",
    ],
    a: [
      "The best season is November to February — cool temperatures (15-25C), clear skies, and no rain. March-May is hot season with occasional haze. June-October is green season with afternoon showers but lush landscapes. Each season has its charm, but for first-time visitors we recommend the cool season.",
      "העונה הטובה ביותר היא נובמבר עד פברואר — טמפרטורות נוחות (15-25 מעלות), שמים צלולים ובלי גשם. מרץ-מאי זו עונה חמה עם ערפיח מדי פעם. יוני-אוקטובר זו עונה ירוקה עם מקלחות אחר-צהריים אבל נופים ירוקים. לכל עונה יש את הקסם שלה, אבל למבקרים בפעם הראשונה אנחנו ממליצים על העונה הקרירה.",
    ],
  },
  {
    q: [
      "How do I get from Bangkok to Chiang Mai?",
      "איך מגיעים מבנגקוק לצ'יאנג מאי?",
    ],
    a: [
      "The easiest option is a 1-hour flight (AirAsia, Nok Air, Thai Smile from ~800 THB one way). Overnight trains are a popular budget option (11-13 hours, book sleeper class). VIP buses take 9-10 hours. We can help arrange airport pickup in Chiang Mai when you arrive.",
      "האפשרות הקלה ביותר היא טיסה של שעה (AirAsia, Nok Air, Thai Smile מ-~800 בהט). רכבת לילה היא אפשרות תקציבית פופולרית (11-13 שעות, הזמינו מחלקת שינה). אוטובוסי VIP לוקחים 9-10 שעות. אנחנו יכולים לעזור לסדר איסוף מנמל התעופה בצ'יאנג מאי כשתגיעו.",
    ],
  },
  {
    q: ["Can I pay in shekels or USD?", "אפשר לשלם בשקלים או דולרים?"],
    a: [
      "Our prices are listed in Thai Baht (THB), but we accept payment in USD, EUR, and can discuss shekel arrangements. Bank transfer, credit card, and cash payments are all accepted. A 50% deposit confirms your booking, with the balance due on tour day.",
      "המחירים שלנו בבהט תאילנדי (THB), אבל אנחנו מקבלים תשלום בדולרים, יורו ויכולים לדון בהסדרי שקלים. העברה בנקאית, כרטיס אשראי ותשלום במזומן — הכל מתקבל. מקדמה של 50% מאשרת את ההזמנה, והיתרה ביום הטיול.",
    ],
  },
];

export function FAQ() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });

  // FAQPage JSON-LD schema
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map(item => ({
      "@type": "Question",
      name: item.q[0],
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a[0],
      },
    })),
  };

  return (
    <section ref={sectionRef} id="faq" className="py-24 md:py-32 bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-3">
            {t("Frequently Asked Questions", "שאלות נפוצות")}
          </h2>
          <GoldDivider />
          <p className="text-muted-foreground text-lg">
            {t(
              "Everything you need to know about our tours",
              "כל מה שצריך לדעת על הטיולים שלנו"
            )}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqData.map((item, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="border-b border-border"
            >
              <AccordionTrigger className="text-lg font-medium text-foreground hover:no-underline [&>svg]:text-[#D4AF37]">
                {t(item.q[0], item.q[1])}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {t(item.a[0], item.a[1])}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
