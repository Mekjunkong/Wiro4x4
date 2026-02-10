import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  {
    webp: "/images/optimized/hero-waterfall.webp",
    jpg: "/images/optimized/hero-waterfall.jpg",
    alt: "Chiang Mai Waterfall Adventure",
  },
  // Add more hero images here as they become available
  // { webp: "/images/optimized/hero-mountain.webp", jpg: "/images/optimized/hero-mountain.jpg", alt: "Mountain Adventure" },
  // { webp: "/images/optimized/hero-temple.webp", jpg: "/images/optimized/hero-temple.jpg", alt: "Temple Visit" },
];

export function Hero() {
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Rotate hero images every 8 seconds
  useEffect(() => {
    if (HERO_IMAGES.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleBookNow = () => {
    const element = document.getElementById("tours");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      t(
        "Hi WIRO 4x4 – I want to book a Kosher tour.",
        "היי WIRO 4x4 -- אשמח לשמוע על הטיולים הכשרים שלכם."
      )
    );
    window.open(`https://wa.me/66929894495?text=${message}`, "_blank");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-8">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/20" />
        <picture key={currentImageIndex}>
          <source
            srcSet={HERO_IMAGES[currentImageIndex].webp}
            type="image/webp"
          />
          <img
            src={HERO_IMAGES[currentImageIndex].jpg}
            alt={HERO_IMAGES[currentImageIndex].alt}
            className="w-full h-full object-cover scale-105 transition-opacity duration-1000"
            loading="eager"
            fetchPriority="high"
            style={{
              transform: `translateY(${scrollY * 0.5}px)`,
              transition: "transform 0.1s ease-out, opacity 1s ease-in-out",
              willChange: "transform",
            }}
          />
        </picture>
        {/* Elegant Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 border-2 border-secondary/30 rounded-full animate-pulse" />
      <div
        className="absolute bottom-32 right-16 w-24 h-24 border-2 border-primary/20 rounded-full animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Content */}
      <div className="container relative z-10 text-center text-white py-20 pb-8">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/20 backdrop-blur-md border border-secondary/30 rounded-full text-secondary animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium tracking-wider uppercase">
              {t("Exclusive Premium Experience", "חוויה בלעדית ומפנקת")}
            </span>
          </div>

          {/* Main Heading with Luxury Typography */}
          <div
            className="space-y-4 md:space-y-6 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold leading-none tracking-tight">
              <span
                className="block text-white"
                style={{
                  textShadow:
                    "0 4px 12px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
                }}
              >
                WIRO 4x4
              </span>
            </h1>
            <div className="h-1 w-24 md:w-32 mx-auto bg-gradient-to-r from-transparent via-secondary to-transparent" />
          </div>

          {/* Tagline with Elegant Spacing */}
          <div
            className="space-y-3 md:space-y-4 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <p
              className="text-xl sm:text-2xl md:text-4xl font-semibold text-secondary tracking-wide px-4"
              style={{
                textShadow:
                  "0 3px 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.7)",
              }}
            >
              {t("Kosher Off-Road Adventures", "טיולי שטח כשרים")}
            </p>
            <p
              className="text-lg sm:text-xl md:text-2xl text-white font-normal max-w-3xl mx-auto leading-relaxed px-4"
              style={{
                textShadow:
                  "0 2px 6px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)",
              }}
            >
              {t("in Chiang Mai", "בצ'יאנג מאי")}
            </p>
          </div>

          {/* Description with Premium Styling */}
          <p
            className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-white leading-relaxed font-normal animate-fade-in-up px-4"
            style={{
              animationDelay: "0.6s",
              textShadow:
                "0 2px 6px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)",
            }}
          >
            {t(
              "Experience the pinnacle of authentic Northern Thailand exploration with bespoke 4x4 tours, gourmet kosher cuisine, and expert Hebrew-speaking guides.",
              "גלו את צפון תאילנד האמיתי -- טיולי 4x4 בהתאמה אישית, אוכל כשר ברמה הכי גבוהה, ומדריכים דוברי עברית."
            )}
          </p>

          {/* Premium CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-6 md:pt-8 animate-fade-in-up px-4"
            style={{ animationDelay: "0.8s" }}
          >
            <Button
              size="lg"
              onClick={handleBookNow}
              className="bg-secondary hover:bg-secondary/90 text-foreground px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-semibold gap-2 sm:gap-3 shadow-premium-lg hover:shadow-premium hover:scale-105 transition-all duration-300 rounded-full w-full sm:w-auto"
            >
              {t("Book Your Adventure", "הזמינו עכשיו")}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWhatsApp}
              className="bg-white/10 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-semibold gap-2 sm:gap-3 hover:scale-105 transition-all duration-300 rounded-full w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" />
              {t("WhatsApp Concierge", "שלחו לנו וואטסאפ")}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div
            className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 pt-8 md:pt-12 text-xs sm:text-sm text-white font-medium animate-fade-in px-4"
            style={{
              animationDelay: "1s",
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>{t("Hebrew Speaking", "דוברי עברית")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>{t("Kosher Meals Available", "ארוחות כשרות")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>{t("Shabbat Friendly", "מותאם לשומרי שבת")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>{t("Private Tours", "טיולים פרטיים")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs uppercase tracking-widest">
            {t("Scroll", "גלול")}
          </span>
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/40 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
