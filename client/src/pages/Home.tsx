import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { ExpeditionNarrative } from "@/components/ExpeditionNarrative";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { usePageMeta } from "@/hooks/usePageMeta";
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
  usePageMeta({
    title: "Private Kosher 4x4 Tours from Chiang Mai",
    description:
      "Plan a private WIRO 4x4 trip from Chiang Mai with Hebrew/English support, kosher-aware meal planning, Shabbat-sensitive routing, and WhatsApp-first availability checks.",
    ogTitle: "WIRO 4x4 Chiang Mai - Private Kosher Off-Road Tours",
    canonicalPath: "/",
    jsonLd: homeJsonLd,
  });

  return (
    <div className="min-h-screen smooth-scroll">
      <Header />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <ExpeditionNarrative />
        <FAQ />
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
