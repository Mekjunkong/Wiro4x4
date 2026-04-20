import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { ProductTiers } from "@/components/ProductTiers";
import { GalleryShowcase } from "@/components/GalleryShowcase";
import { CostCalculator } from "@/components/CostCalculator";
import { PremiumSectionHeading } from "@/components/PremiumSectionHeading";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { TrustAndKosher } from "@/components/TrustAndKosher";
import { QuickInquiryForm } from "@/components/QuickInquiryForm";
import { FAQ } from "@/components/FAQ";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { StickyBookBar } from "@/components/StickyBookBar";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/contexts/LanguageContext";

// New sections
import { HowItWorks } from "@/components/HowItWorks";
import { PricingSection } from "@/components/PricingSection";
import { WhatToBring } from "@/components/WhatToBring";
import { VideoSection } from "@/components/VideoSection";

export default function Home() {
  const { t } = useLanguage();
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

        {/* NEW: How It Works — 4-step booking flow */}
        <HowItWorks />

        {/* NEW: Pricing Section — Explorer Run, Barbarian Run, Summit Expedition */}
        <PricingSection />

        {/* NEW: Video Section */}
        <VideoSection />

        <section id="estimate" className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-14">
              <PremiumSectionHeading
                eyebrow={t(
                  "Plan Your Budget",
                  "תכננו את התקציב",
                  "วางแผนงบประมาณ"
                )}
                heading={t(
                  "Estimate Your Trip",
                  "הערכת עלות הטיול",
                  "ประมาณค่าใช้จ่าย"
                )}
                description={t(
                  "Get an instant price estimate for your group. Select tours, add services, and see the breakdown.",
                  "קבלו הערכת מחיר מיידית לקבוצה שלכם. בחרו טיולים, הוסיפו שירותים וראו את הפירוט.",
                  "รับประมาณค่าใช้จ่ายทันทีสำหรับกลุ่มของคุณ เลือกทัวร์ เพิ่มบริการ และดูรายละเอียด"
                )}
                decorativeBgText="ESTIMATE"
              />
            </div>
            <div className="max-w-5xl mx-auto">
              <CostCalculator />
            </div>
          </div>
        </section>

        <GalleryShowcase />

        {/* NEW: What to Bring — Checklist per experience */}
        <WhatToBring />

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
