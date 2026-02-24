import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronDown } from "lucide-react";

const TOUR_FAQS = [
  {
    q: "What should I wear?",
    qHe: "מה כדאי ללבוש?",
    a: "Comfortable clothes suitable for outdoor activities. Closed-toe shoes are required for 4x4 trips. Bring a light jacket for higher elevations.",
    aHe: "בגדים נוחים המתאימים לפעילות חוצות. נעליים סגורות הן חובה לטיולי 4x4. הביאו ז'קט קל לגבהים.",
  },
  {
    q: "Is this tour suitable for children?",
    qHe: "האם הטיול מתאים לילדים?",
    a: "Yes! Our tours are family-friendly. Children under 3 ride free, ages 3-10 at 50% price. We adjust the itinerary pace for families.",
    aHe: "כן! הטיולים שלנו מתאימים למשפחות. ילדים מתחת לגיל 3 ללא תשלום, גילאי 3-10 ב-50%. אנחנו מתאימים את קצב הטיול למשפחות.",
  },
  {
    q: "What happens if it rains?",
    qHe: "מה קורה אם יורד גשם?",
    a: "Our 4x4 vehicles handle all weather conditions. Light rain often enhances the experience! For heavy storms, we offer rescheduling at no extra cost.",
    aHe: "כלי הרכב 4x4 שלנו מתמודדים עם כל תנאי מזג האוויר. גשם קל לרוב משפר את החוויה! בסערות חזקות, אנו מציעים תיאום מחדש ללא עלות נוספת.",
  },
  {
    q: "Can you accommodate dietary restrictions?",
    qHe: "האם אתם מתאימים להגבלות תזונתיות?",
    a: "Absolutely. All our food options are kosher. We also accommodate vegetarian, vegan, and allergy requirements with advance notice.",
    aHe: "בהחלט. כל אפשרויות האוכל שלנו כשרות. אנו גם מתאימים לצמחונים, טבעונים ואלרגיות בהודעה מראש.",
  },
];

export function TourFAQ() {
  const { language, t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // FAQPage JSON-LD schema for tour FAQs
  const tourFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TOUR_FAQS.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <section className="py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tourFaqJsonLd) }}
      />
      <h3 className="text-xl font-semibold mb-4">
        {t("Common Questions", "שאלות נפוצות")}
      </h3>
      <div className="space-y-2">
        {TOUR_FAQS.map((faq, i) => (
          <div key={i} className="border border-border rounded-sm">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              {language === "he" ? faq.qHe : faq.q}
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-sm text-muted-foreground">
                {language === "he" ? faq.aHe : faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
