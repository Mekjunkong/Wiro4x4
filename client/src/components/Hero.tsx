import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle } from 'lucide-react';

export function Hero() {
  const { t } = useLanguage();

  const handleBookNow = () => {
    const element = document.getElementById('tours');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      t(
        'Hi WIRO 4x4 – I want to book a Kosher tour.',
        'שלום WIRO 4x4 – אני רוצה להזמין סיור כשר.'
      )
    );
    window.open(`https://wa.me/66123456789?text=${message}`, '_blank');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/1000000136.jpg"
          alt="Chiang Mai Waterfall Adventure"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="container relative z-10 text-center text-white py-32">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            {t('WIRO 4x4', 'WIRO 4x4')}
          </h1>
          <p className="text-2xl md:text-3xl font-light text-secondary">
            {t(
              'Kosher Off-Road Adventures in Chiang Mai',
              'חוויות שטח כשרות בצ\'יאנג מאי'
            )}
          </p>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/90">
            {t(
              'Experience authentic Northern Thailand with premium 4x4 tours, kosher meals, and Hebrew-speaking guides.',
              'חוו את צפון תאילנד האותנטי עם סיורי 4x4 פרימיום, ארוחות כשרות ומדריכים דוברי עברית.'
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              onClick={handleBookNow}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg gap-2 shadow-premium-lg"
            >
              {t('Book Your Adventure', 'הזמן סיור')}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWhatsApp}
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              {t('Ask on WhatsApp', 'דברו איתנו בוואטסאפ')}
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
