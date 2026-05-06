import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { ProductTiers } from "@/components/ProductTiers";
import { GalleryShowcase } from "@/components/GalleryShowcase";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { TrustAndKosher } from "@/components/TrustAndKosher";
import { QuickInquiryForm } from "@/components/QuickInquiryForm";
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
        <TrustAndKosher />
        <SocialProofStrip />
        <GalleryShowcase />
        <QuickInquiryForm />
      </main>
      <Footer />
      <FloatingActionButtons />
      <StickyBookBar />
    </div>
  );
}
