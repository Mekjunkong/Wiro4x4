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
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { trackEvent } from "@/lib/analytics";
import { FAQ_ITEMS } from "@shared/faqItems";

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

  const whatsappPrefill = isHebrew
    ? "שלום WIRO 4x4, נשמח לתכנן טיול.\nתאריכים: __\nמספר מטיילים: __\nמלון או אזור איסוף: __\nרעיון למסלול: __\nצרכי כשרות / שבת / מדריך בעברית: __"
    : "Hi WIRO 4x4, we'd like to plan a tour.\nDates: __\nGroup size: __\nPickup area or hotel: __\nRoute idea: __\nKosher / Shabbat / Hebrew-guide needs: __";
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
            <h1 className="text-3xl md:text-5xl font-serif font-medium mb-3 drop-shadow-lg">
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
            <Accordion
              type="single"
              collapsible
              className="w-full"
              onValueChange={value => {
                if (value) {
                  trackEvent("faq_expand", {
                    page: "/faq",
                    placement: value,
                    language,
                  });
                }
              }}
            >
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
            <h2 className="text-2xl md:text-3xl font-serif font-medium mb-4 text-foreground">
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
              <TrackedWhatsAppLink
                sourceCode={language === "he" ? "FAQ-PAGE-HE" : "FAQ-PAGE-EN"}
                humanMessage={whatsappPrefill}
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
              </TrackedWhatsAppLink>
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
