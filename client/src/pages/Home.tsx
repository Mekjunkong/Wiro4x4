import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { ProductTiers } from "@/components/ProductTiers";
import { GalleryShowcase } from "@/components/GalleryShowcase";
import { CostCalculator } from "@/components/CostCalculator";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { TrustAndKosher } from "@/components/TrustAndKosher";
import { QuickInquiryForm } from "@/components/QuickInquiryForm";
import { FAQ } from "@/components/FAQ";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { StickyBookBar } from "@/components/StickyBookBar";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Home() {
  usePageMeta({
    title: "WIRO 4x4 - Kosher Off-Road Adventures in Chiang Mai, Thailand",
    description:
      "Explore Chiang Mai with Hebrew-speaking guides, kosher meals, and custom 4x4 off-road tours. Shabbat-friendly adventures for Israeli travelers in Northern Thailand.",
    canonicalPath: "/",
  });
  return (
    <div className="min-h-screen smooth-scroll">
      <Header />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <ProductTiers />
        <GalleryShowcase />
        <div className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
            <CostCalculator />
          </div>
        </div>
        <TrustAndKosher />
        <SocialProofStrip />
        <QuickInquiryForm />
        <FAQ />
      </main>
      <Footer />
      <FloatingActionButtons />
      <StickyBookBar />
      <NewsletterPopup />
    </div>
  );
}
