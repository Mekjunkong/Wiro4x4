import { Header } from "@/components/Header";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Hero } from "@/components/Hero";
import { StatsCounter } from "@/components/StatsCounter";
import { Tours } from "@/components/Tours";
import { GalleryShowcase } from "@/components/GalleryShowcase";
import { CostCalculator } from "@/components/CostCalculator";
import { TrustAndKosher } from "@/components/TrustAndKosher";
import { Testimonials } from "@/components/Testimonials";
import { CommunityConnection } from "@/components/CommunityConnection";
import { QuickInquiryForm } from "@/components/QuickInquiryForm";
import { FAQ } from "@/components/FAQ";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Home() {
  usePageMeta("Kosher Off-Road Adventures in Chiang Mai");
  return (
    <div className="min-h-screen smooth-scroll">
      <AnnouncementBar />
      <Header />
      <main id="main-content">
        <Hero />
        <StatsCounter />
        <Tours />
        <GalleryShowcase />
        <div className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
            <CostCalculator />
          </div>
        </div>
        <TrustAndKosher />
        <Testimonials />
        <CommunityConnection />
        <QuickInquiryForm />
        <FAQ />
        <NewsletterCTA />
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
