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
      "We offer kosher-friendly meal planning for every tour. Depending on route and advance notice, options can include packed kosher meals and, when available, meals from local providers you can review in advance. Share your kosher level before booking so we can confirm what is feasible.",
      "אנחנו מציעים תכנון אוכל ידידותי לכשרות בכל טיול. בהתאם למסלול ולהודעה מראש, האפשרויות יכולות לכלול ארוחות כשרות ארוזות ובכפוף לזמינות ארוחות מספקים מקומיים שתוכלו לבדוק מראש. שתפו את רמת הכשרות לפני ההזמנה כדי שנאשר מה אפשרי.",
    ],
  },
  {
    q: [
      "How do you accommodate Shabbat observance?",
      "איך מתנהלים לגבי שמירת שבת?",
    ],
    a: [
      "When requested, we plan around Shabbat observance. Tours are not scheduled on Shabbat for Shabbat-observant itineraries, and we can help coordinate accommodation options near local Jewish services based on availability. Tell us your needs when booking.",
      "כשמבקשים זאת מראש, אנחנו מתכננים בהתאם לשמירת שבת. במסלולים לשומרי שבת לא מתוכננים טיולים בשבת, ואפשר לסייע בתיאום אפשרויות לינה ליד שירותים יהודיים מקומיים לפי זמינות. ספרו לנו מה אתם צריכים בזמן ההזמנה.",
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
    q: ["Can tours be customized?", "אפשר להתאים את הטיול אישית?"],
    a: [
      "Absolutely! We specialize in custom-tailored experiences. Whether you want to visit specific destinations, need special dietary accommodations, or have a unique itinerary in mind, we will work with you to create the perfect adventure. Contact us to discuss your preferences.",
      "בטח! אנחנו מתמחים בטיולים בהתאמה אישית. רוצים לבקר ביעדים מסוימים? צריכים התאמות תזונתיות? יש לכם מסלול חלום? נבנה אתכם את הטיול המושלם. דברו איתנו ונתאים הכל.",
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
              <AccordionTrigger className="text-lg font-medium text-foreground hover:no-underline [&>svg]:text-accent">
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
