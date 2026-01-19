import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { WhyWiro } from '@/components/WhyWiro';
import { Tours } from '@/components/Tours';
import { KosherInfo } from '@/components/KosherInfo';
import { TravelChecklist } from '@/components/TravelChecklist';
import { AIConcierge } from '@/components/AIConcierge';
import { Testimonials } from '@/components/Testimonials';
import { CommunityConnection } from '@/components/CommunityConnection';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export default function Home() {
  return (
    <div className="min-h-screen smooth-scroll">
      <Header />
      <Hero />
      <Tours />
      <KosherInfo />
      <TravelChecklist />
      <AIConcierge />
      <Testimonials />
      <WhyWiro />
      <CommunityConnection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
