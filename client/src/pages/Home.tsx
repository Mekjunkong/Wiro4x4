import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Tours } from "@/components/Tours";
import { TrustAndKosher } from "@/components/TrustAndKosher";
import { PhotoGallery } from "@/components/PhotoGallery";
import { QuickInquiryForm } from "@/components/QuickInquiryForm";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Home() {
  usePageMeta("Kosher Off-Road Adventures in Chiang Mai");
  return (
    <div className="min-h-screen smooth-scroll">
      <Header />
      <main id="main-content">
        <Hero />
        <Tours />
        <PhotoGallery />
        <TrustAndKosher />
        <Testimonials />
        <QuickInquiryForm />
        <FAQ />
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
