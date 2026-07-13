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
                  Start with the right dossier
                </p>
                <h2
                  id="planning-guides-heading"
                  className="mt-3 text-2xl font-medium md:text-3xl"
                >
                  Plan for your family, food, and language needs
                </h2>
              </div>
              <nav
                className="grid gap-px bg-border sm:grid-cols-3"
                aria-label="Tour planning guides"
              >
                {[
                  {
                    href: "/private-family-tours",
                    label: "Private family 4x4 tours",
                  },
                  {
                    href: "/kosher-tours",
                    label: "Kosher-friendly tour planning",
                  },
                  {
                    href: "/hebrew-guide",
                    label: "Hebrew-speaking guide options",
                  },
                ].map(item => (
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
