import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { WhyWiro } from '@/components/WhyWiro';
import { Tours } from '@/components/Tours';
import { KosherInfo } from '@/components/KosherInfo';

import { Testimonials } from '@/components/Testimonials';
import { CommunityConnection } from '@/components/CommunityConnection';
import { Footer } from '@/components/Footer';
import { FloatingActionButtons } from '@/components/FloatingActionButtons';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Home() {
  usePageMeta('Kosher Off-Road Adventures in Chiang Mai');
  return (
    <div className="min-h-screen smooth-scroll">
      <Header />
      <Hero />
      <Tours />
      <KosherInfo />
      <Testimonials />
      <WhyWiro />
      <CommunityConnection />
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
