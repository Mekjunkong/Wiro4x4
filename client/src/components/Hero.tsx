import { Bot, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CinematicHeroBackground } from "@/components/CinematicHeroBackground";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

export function Hero() {
  const { t, language } = useLanguage();

  const whatsappMessage =
    language === "he"
      ? "שלום WIRO 4x4, אשמח לתכנן טיול שטח פרטי מצ'יאנג מאי.\nתאריכים: __\nמספר מטיילים: __\nמלון או אזור איסוף: __\nרעיון למסלול: __\nצרכי כשרות / שבת / מדריך בעברית: __"
      : "Hi WIRO 4x4, I'd like to plan a private off-road trip from Chiang Mai.\nDates: __\nGroup size: __\nPickup area or hotel: __\nRoute idea: __\nKosher / Shabbat / Hebrew-guide needs: __";

  const openLevi = () => {
    window.dispatchEvent(new CustomEvent("chat-toggle"));
  };

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-primary">
      <CinematicHeroBackground
        alt={t(
          "WIRO 4x4 vehicle on a jungle road in Chiang Mai",
          "רכב WIRO 4x4 בדרך ג'ונגל בצ'יאנג מאי"
        )}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/55 to-primary/15 md:from-primary/90 md:via-primary/35" />

      <div className="relative z-10 flex min-h-[100dvh] items-end px-5 pb-16 pt-24 text-white sm:pb-20 md:px-12 lg:px-20 lg:pb-24">
        <div className="w-full max-w-4xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent md:mb-4 md:text-sm animate-hero-reveal [animation-delay:0.1s]">
            {t("Private tours from Chiang Mai", "טיולים פרטיים מצ'יאנג מאי")}
          </p>

          <h1 className="mb-4 max-w-[22rem] text-balance text-[clamp(2.5rem,1rem+5vw,4.75rem)] leading-[1.03] drop-shadow-2xl sm:max-w-3xl md:mb-5 lg:max-w-4xl animate-hero-reveal [animation-delay:0.2s]">
            {language === "he" ? (
              <>
                טיולי 4×4 <span className="text-accent">כשרים</span> בצ'יאנג מאי
              </>
            ) : (
              <>Private 4×4 Journeys, Built Around You</>
            )}
          </h1>

          <p className="relative mb-7 max-w-[21rem] text-sm font-light leading-relaxed text-white/90 drop-shadow-lg min-[380px]:text-base sm:max-w-xl md:text-lg lg:text-xl animate-hero-reveal [animation-delay:0.35s]">
            {t(
              "Real off-road routes with Hebrew support, kosher-aware meals, and Shabbat-sensitive scheduling.",
              "מסלולי שטח אמיתיים עם מענה בעברית, ארוחות מותאמות כשרות ולוחות זמנים המתחשבים בשבת."
            )}
            <span className="absolute -bottom-3 start-0 h-[2px] w-14 bg-accent" />
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center animate-hero-reveal [animation-delay:0.5s]">
            <TrackedWhatsAppLink
              sourceCode={language === "he" ? "HOME-HERO-HE" : "HOME-HERO-EN"}
              humanMessage={whatsappMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-[#176b5b] px-7 py-3.5 text-sm font-bold text-white shadow-[0_16px_40px_rgba(0,0,0,0.24)] transition-all hover:bg-[#11594b] active:translate-y-px focus:outline-none focus:ring-2 focus:ring-[#176b5b] focus:ring-offset-2 focus:ring-offset-primary sm:w-auto md:text-base"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              {t("Check Availability on WhatsApp", "בדיקת זמינות בוואטסאפ")}
            </TrackedWhatsAppLink>
            <button
              type="button"
              onClick={openLevi}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-sm border border-white/45 bg-white/10 px-6 py-3.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-md transition-all hover:bg-white/20 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary sm:w-auto md:text-base"
            >
              <Bot className="w-5 h-5" aria-hidden="true" />
              {t("Ask Levi first", "שאלו קודם את לוי")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
