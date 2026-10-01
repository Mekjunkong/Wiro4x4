import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQ } from "@/components/FAQ";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { NightDriveHero } from "@/components/wiro/home/NightDriveHero";
import { TrustBand } from "@/components/wiro/home/TrustBand";
import { TrailCarousel } from "@/components/wiro/home/TrailCarousel";
import { MachineSection } from "@/components/wiro/home/MachineSection";
import { MapSection } from "@/components/wiro/home/MapSection";
import { KosherSection } from "@/components/wiro/home/KosherSection";
import { ReviewsSection } from "@/components/wiro/home/ReviewsSection";
import { GalleryRing } from "@/components/wiro/home/GalleryRing";
import { ClosingCta } from "@/components/wiro/home/ClosingCta";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  COMPANY_EMAIL,
  COMPANY_NAME,
  COMPANY_PHONE,
  COMPANY_TRIPADVISOR_URL,
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
    sameAs: [COMPANY_WHATSAPP_URL, COMPANY_TRIPADVISOR_URL],
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
    title: "Chiang Mai 4x4 Tours & Private Off-Road Adventures | WIRO 4x4",
    description:
      "Explore Northern Thailand with WIRO 4x4. Private off-road tours, customized Jeep adventures and multi-day expeditions from Chiang Mai.",
    ogTitle: "Chiang Mai 4x4 Tours & Private Off-Road Adventures | WIRO 4x4",
    canonicalPath: "/",
    jsonLd: homeJsonLd,
  });

  return (
    <div className="wx" style={{ minHeight: "100vh" }}>
      <Header />
      <main id="main-content">
        <NightDriveHero />
        <TrustBand />
        <TrailCarousel />
        <MachineSection />
        <MapSection />
        <KosherSection />
        <ReviewsSection />
        <GalleryRing />
        <FAQ />
        <ClosingCta />
      </main>
      <Footer />
      <FloatingActionButtons />
      <NewsletterPopup />
    </div>
  );
}
