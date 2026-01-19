import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

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
    window.open(`https://wa.me/66819611398?text=${message}`, '_blank');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/20" />
        <img
          src="/images/hero-waterfall.jpg"
          alt="Chiang Mai Waterfall Adventure"
          className="w-full h-full object-cover scale-105"
          loading="eager"
        />
        {/* Elegant Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 border-2 border-secondary/30 rounded-full animate-pulse" />
      <div className="absolute bottom-32 right-16 w-24 h-24 border-2 border-primary/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="container relative z-10 text-center text-white py-32">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/20 backdrop-blur-md border border-secondary/30 rounded-full text-secondary animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium tracking-wider uppercase">
              {t('Exclusive Premium Experience', 'חוויה פרימיום בלעדית')}
            </span>
          </div>

          {/* Main Heading with Luxury Typography */}
          <div className="space-y-4 md:space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-none tracking-tight">
              <span className="block text-white drop-shadow-2xl">WIRO 4x4</span>
            </h1>
            <div className="h-1 w-24 md:w-32 mx-auto bg-gradient-to-r from-transparent via-secondary to-transparent" />
          </div>

          {/* Tagline with Elegant Spacing */}
          <div className="space-y-3 md:space-y-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-xl sm:text-2xl md:text-4xl font-light text-secondary tracking-wide px-4">
              {t(
                'Kosher Off-Road Adventures',
                'חוויות שטח כשרות'
              )}
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light max-w-3xl mx-auto leading-relaxed px-4">
              {t(
                'in Chiang Mai',
                'בצ\'יאנג מאי'
              )}
            </p>
          </div>

          {/* Description with Premium Styling */}
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-white/80 leading-relaxed font-light animate-fade-in-up px-4" style={{ animationDelay: '0.6s' }}>
            {t(
              'Experience the pinnacle of authentic Northern Thailand exploration with bespoke 4x4 tours, gourmet kosher cuisine, and expert Hebrew-speaking guides.',
              'חוו את שיא החקירה האותנטית של צפון תאילנד עם סיורי 4x4 מותאמים אישית, מטבח כשר גורמה ומדריכים מומחים דוברי עברית.'
            )}
          </p>

          {/* Premium CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-6 md:pt-8 animate-fade-in-up px-4" style={{ animationDelay: '0.8s' }}>
            <Button
              size="lg"
              onClick={handleBookNow}
              className="bg-secondary hover:bg-secondary/90 text-foreground px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-semibold gap-2 sm:gap-3 shadow-premium-lg hover:shadow-premium hover:scale-105 transition-all duration-300 rounded-full w-full sm:w-auto"
            >
              {t('Book Your Adventure', 'הזמן סיור')}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWhatsApp}
              className="bg-white/10 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-semibold gap-2 sm:gap-3 hover:scale-105 transition-all duration-300 rounded-full w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" />
              {t('WhatsApp Concierge', 'קונסיירז׳ וואטסאפ')}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 pt-8 md:pt-12 text-xs sm:text-sm text-white/70 animate-fade-in px-4" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>{t('Hebrew Speaking', 'דוברי עברית')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>{t('Kosher Meals Available', 'ארוחות כשרות זמינות')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>{t('Shabbat Friendly', 'ידידותי לשבת')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>{t('Private Tours', 'סיורים פרטיים')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs uppercase tracking-widest">{t('Scroll', 'גלול')}</span>
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/40 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
