import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    q: ["Is the food on tours kosher?", "האם האוכל בסיורים כשר?"],
    a: [
      "Yes! All meals provided during our tours are kosher. We work with certified kosher restaurants and caterers in Chiang Mai to ensure all dietary requirements are met.",
      "כן! כל הארוחות המסופקות במהלך הסיורים שלנו כשרות. אנו עובדים עם מסעדות וקייטרינג כשרים מוסמכים בצ'יאנג מאי כדי להבטיח שכל הדרישות התזונתיות מתמלאות.",
    ],
  },
  {
    q: [
      "How do you accommodate Shabbat observance?",
      "איך אתם מתחשבים בשמירת שבת?",
    ],
    a: [
      "We fully respect Shabbat observance. Tours are not scheduled on Shabbat, and we can arrange Shabbat-friendly accommodations near the local Chabad house. Just let us know your needs when booking.",
      'אנו מכבדים לחלוטין את שמירת השבת. סיורים לא מתוזמנים בשבת, ואנו יכולים לארגן מלונות ידידותיים לשבת ליד בית חב"ד המקומי. פשוט ספרו לנו על הצרכים שלכם בעת ההזמנה.',
    ],
  },
  {
    q: ["How safe are the off-road tours?", "כמה בטוחים סיורי השטח?"],
    a: [
      "Safety is our top priority. All vehicles are regularly maintained and equipped with safety features. Our experienced drivers are trained in off-road driving, and we carry first-aid equipment on every tour. We also provide comprehensive safety briefings before each trip.",
      "הבטיחות היא בראש סדר העדיפויות שלנו. כל הרכבים עוברים תחזוקה שוטפת ומצוידים באמצעי בטיחות. הנהגים המנוסים שלנו מאומנים בנהיגת שטח, ואנו נושאים ציוד עזרה ראשונה בכל סיור. אנו גם מספקים תדריך בטיחות מקיף לפני כל טיול.",
    ],
  },
  {
    q: [
      "What are the tour prices and what is included?",
      "מה מחירי הסיורים ומה כלול?",
    ],
    a: [
      "Tour prices vary based on group size, duration, and services selected. Each tour includes a 4x4 vehicle with driver, fuel, and basic insurance. Additional options like kosher meals, hotel arrangements, Hebrew-speaking guides, and attraction entries can be added. Contact us for a personalized quote.",
      "מחירי הסיורים משתנים בהתאם לגודל הקבוצה, משך הסיור והשירותים שנבחרו. כל סיור כולל רכב 4x4 עם נהג, דלק וביטוח בסיסי. ניתן להוסיף אפשרויות כמו ארוחות כשרות, סידורי מלון, מדריכים דוברי עברית וכניסה לאטרקציות. צרו קשר לקבלת הצעת מחיר מותאמת אישית.",
    ],
  },
  {
    q: ["How do I book a tour?", "איך אני מזמין סיור?"],
    a: [
      "You can book directly through our website using the booking form. Simply select your dates, group size, and preferred services. After submitting, our team will contact you within 24 hours to confirm details and finalize your booking. You can also reach us via WhatsApp for quick inquiries.",
      "ניתן להזמין ישירות דרך האתר שלנו באמצעות טופס ההזמנה. פשוט בחרו את התאריכים, גודל הקבוצה והשירותים המועדפים. לאחר השליחה, הצוות שלנו ייצור קשר תוך 24 שעות לאישור פרטים וסיום ההזמנה. ניתן גם לפנות אלינו דרך וואטסאפ לשאלות מהירות.",
    ],
  },
  {
    q: ["What is your cancellation policy?", "מה מדיניות הביטולים שלכם?"],
    a: [
      "We offer free cancellation up to 7 days before the tour date for a full refund. Cancellations within 3-7 days receive a 50% refund. Cancellations less than 3 days before the tour are non-refundable. We recommend travel insurance for unexpected changes.",
      "אנו מציעים ביטול חינם עד 7 ימים לפני תאריך הסיור להחזר מלא. ביטולים תוך 3-7 ימים מקבלים החזר של 50%. ביטולים פחות מ-3 ימים לפני הסיור אינם ניתנים להחזר. אנו ממליצים על ביטוח נסיעות לשינויים בלתי צפויים.",
    ],
  },
  {
    q: [
      "What group sizes do you accommodate?",
      "לאילו גדלי קבוצות אתם מתאימים?",
    ],
    a: [
      "We cater to all group sizes, from couples and families to large groups of 20+. Our 4x4 vehicles typically seat 4-6 passengers each. For larger groups, we arrange multiple vehicles with coordinated itineraries. Private tours are available for any group size.",
      "אנו מתאימים לכל גדלי הקבוצות, מזוגות ומשפחות ועד קבוצות גדולות של 20+. רכבי ה-4x4 שלנו מכילים בדרך כלל 4-6 נוסעים כל אחד. לקבוצות גדולות יותר, אנו מארגנים מספר רכבים עם מסלולים מתואמים. סיורים פרטיים זמינים לכל גודל קבוצה.",
    ],
  },
  {
    q: ["What should I bring on the tour?", "מה כדאי להביא לסיור?"],
    a: [
      "We recommend comfortable clothing and closed-toe shoes suitable for outdoor activities. Bring sunscreen, a hat, sunglasses, and a refillable water bottle. A camera is a must for the stunning scenery! During rainy season (June-October), a light rain jacket is advised. We provide all necessary safety equipment.",
      "אנו ממליצים על ביגוד נוח ונעליים סגורות המתאימות לפעילויות חוצות. הביאו קרם הגנה, כובע, משקפי שמש ובקבוק מים למילוי חוזר. מצלמה היא חובה לנופים המדהימים! בעונת הגשמים (יוני-אוקטובר), מומלץ מעיל גשם קל. אנו מספקים את כל ציוד הבטיחות הנדרש.",
    ],
  },
  {
    q: [
      "Do you offer Hebrew-speaking guides?",
      "האם יש לכם מדריכים דוברי עברית?",
    ],
    a: [
      "Yes! We have Hebrew-speaking guides available for all our tours. Our guides are knowledgeable about the local area, culture, and can communicate fluently in Hebrew and English. Just indicate your language preference when booking.",
      "כן! יש לנו מדריכים דוברי עברית זמינים לכל הסיורים שלנו. המדריכים שלנו בקיאים באזור המקומי, בתרבות ויכולים לתקשר בשטף בעברית ובאנגלית. פשוט ציינו את העדפת השפה שלכם בעת ההזמנה.",
    ],
  },
  {
    q: ["Can tours be customized?", "האם ניתן להתאים אישית את הסיורים?"],
    a: [
      "Absolutely! We specialize in custom-tailored experiences. Whether you want to visit specific destinations, need special dietary accommodations, or have a unique itinerary in mind, we will work with you to create the perfect adventure. Contact us to discuss your preferences.",
      "בהחלט! אנו מתמחים בחוויות מותאמות אישית. בין אם אתם רוצים לבקר ביעדים ספציפיים, צריכים התאמות תזונתיות מיוחדות, או שיש לכם מסלול ייחודי בראש, נעבוד אתכם ליצירת ההרפתקה המושלמת. צרו קשר לדיון על ההעדפות שלכם.",
    ],
  },
];

export function FAQ() {
  const { t } = useLanguage();

  return (
    <section id="faq" className="py-16 bg-muted/30">
      <div className="container max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("Frequently Asked Questions", "שאלות נפוצות")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t(
              "Everything you need to know about our tours",
              "כל מה שצריך לדעת על הסיורים שלנו"
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
              <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">
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
