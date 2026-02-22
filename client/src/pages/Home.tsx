import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { StickyBookBar } from "@/components/StickyBookBar";
import { WhyWiro } from "@/components/WhyWiro";
import { Tours } from "@/components/Tours";
import { KosherInfo } from "@/components/KosherInfo";
import { QuickInquiryForm } from "@/components/QuickInquiryForm";
import { TripCostEstimator } from "@/components/TripCostEstimator";

import { SectionBanner } from "@/components/SectionBanner";
import { Testimonials } from "@/components/Testimonials";
import { CommunityConnection } from "@/components/CommunityConnection";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { WhatsAppPrompt } from "@/components/WhatsAppPrompt";
import { usePageMeta } from "@/hooks/usePageMeta";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { SocialProofBar } from "@/components/SocialProofBar";
import { InstagramCTA } from "@/components/InstagramCTA";
import { RecentlyBookedPopup } from "@/components/RecentlyBookedPopup";

export default function Home() {
  usePageMeta("Kosher Off-Road Adventures in Chiang Mai");
  return (
    <div className="min-h-screen smooth-scroll">
      <StickyBookBar />
      <Header />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <Tours />
        <SocialProofBar />
        <TripCostEstimator />
        <KosherInfo />
        <SectionBanner />
        <Testimonials />
        <WhyWiro />
        <CommunityConnection />
        <QuickInquiryForm />
        <InstagramCTA />
        <FAQ />
        <FaqJsonLd />
      </main>
      <Footer />
      <RecentlyBookedPopup />
      <FloatingActionButtons />
      <WhatsAppPrompt />
    </div>
  );
}
