import { useLanguage } from "@/contexts/LanguageContext";
import { Star, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TRUST_BADGES = [
  { en: "Hebrew Speaking Guide", he: "מדריך דובר עברית", icon: "🇮🇱" },
  { en: "Kosher Certified", he: "כשר מהדרין", icon: "✡️" },
  { en: "Private Tours Only", he: "טיולים פרטיים בלבד", icon: "🔒" },
  { en: "Shabbat Friendly", he: "שומרי שבת", icon: "🕯️" },
];

const RECENT_BOOKINGS = [
  {
    name: "דוד מ.",
    city: "תל אביב",
    cityEn: "Tel Aviv",
    tour: "Doi Inthanon",
    tourHe: "דוי אינתנון",
    timeAgo: "2h",
    timeAgoHe: "לפני שעתיים",
  },
  {
    name: "שרה כ.",
    city: "ירושלים",
    cityEn: "Jerusalem",
    tour: "Mae Kampong",
    tourHe: "מאה קמפונג",
    timeAgo: "5h",
    timeAgoHe: "לפני 5 שעות",
  },
  {
    name: "יוסי מ.",
    city: "חיפה",
    cityEn: "Haifa",
    tour: "Sticky Waterfalls",
    tourHe: "מפלים דביקים",
    timeAgo: "1d",
    timeAgoHe: "אתמול",
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

  const topReviews = (reviews || [])
    .filter((r: any) => r.rating >= 4)
    .slice(0, 3);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-background">
      <div className="container max-w-6xl">
        {/* Section heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-3">
            {t("Trusted by Israeli Travelers", "מטיילים ישראלים סומכים עלינו")}
          </h2>
          <GoldDivider />
        </div>

        {/* Reviews grid */}
        {topReviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {topReviews.map((review: any, i: number) => (
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

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {TRUST_BADGES.map(badge => (
            <div
              key={badge.en}
              className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-accent/20 shadow-sm"
            >
              <span className="text-lg">{badge.icon}</span>
              <span className="text-sm font-medium">
                {t(badge.en, badge.he)}
              </span>
            </div>
          ))}
        </div>

        {/* Recently booked ticker */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-card rounded-full px-5 py-2 border border-emerald-200 dark:border-emerald-800 shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">
              {t(
                `${RECENT_BOOKINGS[0].name} from ${RECENT_BOOKINGS[0].cityEn} booked ${RECENT_BOOKINGS[0].tour} — ${RECENT_BOOKINGS[0].timeAgo} ago`,
                `${RECENT_BOOKINGS[0].name} מ${RECENT_BOOKINGS[0].city} הזמין/ה ${RECENT_BOOKINGS[0].tourHe} — ${RECENT_BOOKINGS[0].timeAgoHe}`
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
