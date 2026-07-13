import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { ProductTiers } from "@/components/ProductTiers";
import { GalleryShowcase } from "@/components/GalleryShowcase";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { TrustAndKosher } from "@/components/TrustAndKosher";
import { QuickInquiryForm } from "@/components/QuickInquiryForm";
import { FAQ } from "@/components/FAQ";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import {
  COMPANY_EMAIL,
  COMPANY_NAME,
  COMPANY_PHONE,
  COMPANY_WEBSITE,
  COMPANY_WHATSAPP_URL,
} from "@/const";

const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: COMPANY_NAME,
    url: COMPANY_WEBSITE,
    telephone: COMPANY_PHONE,
    email: COMPANY_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "183/15 Chang Klan Rd",
      addressLocality: "Mueang Chiang Mai District",
      addressRegion: "Chiang Mai",
      postalCode: "50100",
      addressCountry: "TH",
    },
    areaServed: ["Chiang Mai", "Northern Thailand", "Indochina"],
    availableLanguage: ["English", "Hebrew"],
    sameAs: [COMPANY_WHATSAPP_URL],
  },
  {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: "Private kosher 4x4 tours from Chiang Mai",
    description:
      "Private off-road routes from Chiang Mai with Hebrew/English support, kosher-aware meal planning, and Shabbat-sensitive itinerary planning.",
    provider: {
      "@type": "TravelAgency",
      name: COMPANY_NAME,
      url: COMPANY_WEBSITE,
    },
    touristType: ["Families", "Israeli travelers", "Private groups"],
    itinerary: "Custom 4x4 routes around Chiang Mai and Northern Thailand",
  },
];

export default function Home() {
  const { language, t } = useLanguage();
  const planningGuides = [
    {
      href:
        language === "he"
          ? "/he/private-family-tours-chiang-mai"
          : "/private-family-tours",
      label: t("Private family 4x4 tours", "טיולי 4x4 פרטיים למשפחות"),
    },
    {
      href: language === "he" ? "/he/kosher-tours-chiang-mai" : "/kosher-tours",
      label: t("Kosher-friendly tour planning", "תכנון טיול ידידותי לכשרות"),
    },
    {
      href: language === "he" ? "/he/hebrew-guide-chiang-mai" : "/hebrew-guide",
      label: t("Hebrew-speaking guide options", "אפשרויות למדריך דובר עברית"),
    },
  ];

  usePageMeta({
    title: "Private Kosher 4x4 Tours from Chiang Mai",
    description:
      "Plan a private WIRO 4x4 trip from Chiang Mai with Hebrew/English support, kosher-aware meal planning, Shabbat-sensitive routing, and WhatsApp-first availability checks.",
    ogTitle: "WIRO 4x4 Chiang Mai — Private Kosher Off-Road Tours",
    canonicalPath: "/",
    jsonLd: homeJsonLd,
  });
  return (
    <div className="min-h-screen smooth-scroll">
      <Header />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <section
          className="border-y border-border bg-card py-10"
          aria-labelledby="planning-guides-heading"
        >
          <div className="container">
            <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
                  {t("Start with the right dossier", "התחילו מהמדריך המתאים")}
                </p>
                <h2
                  id="planning-guides-heading"
                  className="mt-3 text-2xl font-medium md:text-3xl"
                >
                  {t(
                    "Plan for your family, food, and language needs",
                    "תכננו לפי צורכי המשפחה, האוכל והשפה"
                  )}
                </h2>
              </div>
              <nav
                className="grid gap-px bg-border sm:grid-cols-3"
                aria-label={t("Tour planning guides", "מדריכי תכנון לטיולים")}
              >
                {planningGuides.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex min-h-24 items-end justify-between gap-3 bg-card p-5 font-semibold hover:bg-muted/50"
                  >
                    {item.label}
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </section>
        <ProductTiers />
        <QuickInquiryForm />
        <TrustAndKosher />
        <SocialProofStrip />
        <GalleryShowcase />
        <FAQ />
      </main>
      <Footer />
      <FloatingActionButtons />
      <NewsletterPopup />
    </div>
  );
}
