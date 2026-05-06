import { useLanguage } from "@/contexts/LanguageContext";
import { Star, MessageCircle, MapPin, Clock, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/button";
import { WHATSAPP_URL } from "@/const";

const EXPERIENCE_SIGNALS = [
  {
    icon: Users,
    en: "Private from the first message",
    he: "פרטי כבר מההודעה הראשונה",
  },
  {
    icon: MapPin,
    en: "Routes chosen for the view, not the crowd",
    he: "מסלולים שנבחרים בשביל הנוף, לא בשביל ההמון",
  },
  {
    icon: MessageCircle,
    en: "Responsive planning",
    he: "תיאום מהיר",
  },
  {
    icon: Clock,
    en: "Built for relaxed travel",
    he: "מותאם לטיול רגוע",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-accent fill-accent" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export function SocialProofStrip() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 30, duration: 0.5 });
  const { data: reviews } = trpc.review.listPublic.useQuery();

  const topReviews = (reviews || []).filter(r => r.rating >= 4).slice(0, 3);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-background">
      <div className="container max-w-6xl">
        {/* Section heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-3">
            {t("What guests remember most", "מה האורחים זוכרים הכי הרבה")}
          </h2>
          <GoldDivider />
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t(
              "The trip feels premium when the details disappear into the background and the experience itself stays front and center.",
              "הטיול מרגיש יוקרתי כשהפרטים נעלמים ברקע והחוויה עצמה נשארת במרכז."
            )}
          </p>
        </div>

        {/* Reviews grid */}
        {topReviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {topReviews.map((review, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-6 shadow-sm border border-border"
              >
                <StarRating rating={review.rating} />
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                    {review.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Experience signals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {EXPERIENCE_SIGNALS.map(signal => (
            <div
              key={signal.en}
              className="flex items-start gap-3 bg-card rounded-xl px-4 py-3 border border-accent/20 shadow-sm"
            >
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <signal.icon className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">
                  {t(signal.en, signal.he)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Conversion CTA */}
        <div className="rounded-2xl border border-accent/20 bg-card/80 px-6 py-8 md:px-8 md:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">
                {t("Next step", "הצעד הבא")}
              </p>
              <h3 className="text-2xl md:text-3xl font-medium text-foreground">
                {t("Ready to shape your route?", "מוכנים לבנות את המסלול?")}
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {t(
                  "Send the dates and group size you have, and we’ll help refine the rest.",
                  "שלחו לנו את התאריכים וגודל הקבוצה, ואנחנו נעזור לדייק את השאר."
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <a href="#inquiry">
                  {t("Open the inquiry form", "פתחו את טופס הפנייה")}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  {t("WhatsApp us", "כתבו לנו בוואטסאפ")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
