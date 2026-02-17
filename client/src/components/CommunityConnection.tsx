import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Heart, MapPin } from "lucide-react";

export function CommunityConnection() {
  const { t } = useLanguage();
  const contentRef = useScrollReveal<HTMLDivElement>({ y: 40, duration: 0.6 });

  const communities = [
    {
      city: t(
        "Chiang Mai",
        "\u05E6'\u05D9\u05D0\u05E0\u05D2 \u05DE\u05D0\u05D9"
      ),
      country: t("Thailand", "\u05EA\u05D0\u05D9\u05DC\u05E0\u05D3"),
    },
    {
      city: t("Phuket", "\u05E4\u05D5\u05E7\u05D8"),
      country: t("Thailand", "\u05EA\u05D0\u05D9\u05DC\u05E0\u05D3"),
    },
    {
      city: t("Bangkok", "\u05D1\u05E0\u05D2\u05E7\u05D5\u05E7"),
      country: t("Thailand", "\u05EA\u05D0\u05D9\u05DC\u05E0\u05D3"),
    },
    {
      city: t("Hanoi", "\u05D4\u05D0\u05E0\u05D5\u05D9"),
      country: t("Vietnam", "\u05D5\u05D9\u05D9\u05D8\u05E0\u05D0\u05DD"),
    },
    {
      city: t("Saigon", "\u05E1\u05D9\u05D9\u05D2\u05D5\u05DF"),
      country: t("Vietnam", "\u05D5\u05D9\u05D9\u05D8\u05E0\u05D0\u05DD"),
    },
    {
      city: t("Vientiane", "\u05D5\u05D9\u05D0\u05E0\u05D8\u05D9\u05D0\u05DF"),
      country: t("Laos", "\u05DC\u05D0\u05D5\u05E1"),
    },
  ];

  return (
    <section
      className="relative py-24 md:py-32 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/images/1000000135.jpg')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div ref={contentRef} className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-[#D4AF37]" />
            <h2 className="text-4xl md:text-5xl font-medium text-white">
              {t(
                "Community Connection",
                "\u05E7\u05E9\u05E8 \u05E7\u05D4\u05D9\u05DC\u05EA\u05D9"
              )}
            </h2>
          </div>

          <GoldDivider />

          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-white/90">
              {t(
                "We maintain long-standing friendships with Chabad communities across Chiang Mai, Phuket, Bangkok, Hanoi, Saigon, and Vientiane. These relationships help us support Israeli travelers with cultural understanding and local knowledge.",
                "\u05D0\u05E0\u05D7\u05E0\u05D5 \u05E9\u05D5\u05DE\u05E8\u05D9\u05DD \u05E2\u05DC \u05E7\u05E9\u05E8 \u05D7\u05DD \u05E2\u05DD \u05E7\u05D4\u05D9\u05DC\u05D5\u05EA \u05D7\u05D1\u05F4\u05D3 \u05D1\u05E6'\u05D9\u05D0\u05E0\u05D2 \u05DE\u05D0\u05D9, \u05E4\u05D5\u05E7\u05D8, \u05D1\u05E0\u05D2\u05E7\u05D5\u05E7, \u05D4\u05D0\u05E0\u05D5\u05D9, \u05E1\u05D9\u05D9\u05D2\u05D5\u05DF \u05D5\u05D5\u05D9\u05D9\u05E0\u05D8\u05D9\u05D0\u05DF. \u05D4\u05E7\u05E9\u05E8\u05D9\u05DD \u05D4\u05D0\u05DC\u05D4 \u05E2\u05D5\u05D6\u05E8\u05D9\u05DD \u05DC\u05E0\u05D5 \u05DC\u05DC\u05D5\u05D5\u05EA \u05DE\u05D8\u05D9\u05D9\u05DC\u05D9\u05DD \u05D9\u05E9\u05E8\u05D0\u05DC\u05D9\u05DD \u05E2\u05DD \u05D4\u05D1\u05E0\u05D4 \u05D0\u05DE\u05D9\u05EA\u05D9\u05EA \u05E9\u05DC \u05D4\u05E6\u05E8\u05DB\u05D9\u05DD \u05E9\u05DC\u05D4\u05DD."
              )}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6">
              {communities.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10"
                >
                  <MapPin className="h-4 w-4 text-[#D4AF37]" />
                  <div className="text-sm">
                    <div className="font-semibold text-white">
                      {location.city}
                    </div>
                    <div className="text-white/60 text-xs">
                      {location.country}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <Button variant="hero-primary" size="lg">
                {t(
                  "Learn More About Our Community",
                  "\u05DC\u05DE\u05D3\u05D5 \u05E2\u05D5\u05D3 \u05E2\u05DC \u05D4\u05E7\u05D4\u05D9\u05DC\u05D4 \u05E9\u05DC\u05E0\u05D5"
                )}
              </Button>
            </div>

            <p className="text-sm text-white/50 italic pt-4">
              {t(
                "* These are personal friendships and community connections. WIRO 4x4 is not officially affiliated with or endorsed by any Chabad organization.",
                "* \u05D0\u05DC\u05D5 \u05E7\u05E9\u05E8\u05D9\u05DD \u05D0\u05D9\u05E9\u05D9\u05D9\u05DD \u05D5\u05E7\u05D4\u05D9\u05DC\u05EA\u05D9\u05D9\u05DD. WIRO 4x4 \u05D0\u05D9\u05E0\u05D4 \u05E7\u05E9\u05D5\u05E8\u05D4 \u05E8\u05E9\u05DE\u05D9\u05EA \u05DC\u05D0\u05E8\u05D2\u05D5\u05DF \u05D7\u05D1\u05F4\u05D3 \u05DB\u05DC\u05E9\u05D4\u05D5 \u05D5\u05D0\u05D9\u05E0\u05D4 \u05E4\u05D5\u05E2\u05DC\u05EA \u05DE\u05D8\u05E2\u05DE\u05D5."
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
