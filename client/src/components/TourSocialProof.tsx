import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Star, Users } from "lucide-react";

export function TourSocialProof() {
  const { t } = useLanguage();
  const { data: stats } = trpc.stats.public.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const { data: reviews } = trpc.review.listPublic.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const displayReviews = (reviews ?? []).slice(0, 2);

  return (
    <div className="bg-muted rounded-xl p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {stats && stats.totalBookings > 0 && (
          <div className="flex items-center gap-2 text-foreground">
            <Users className="h-4 w-4 text-accent" />
            <span className="font-medium">
              {stats.totalBookings}+{" "}
              {t(
                "tours completed",
                "\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD \u05D4\u05D5\u05E9\u05DC\u05DE\u05D5"
              )}
            </span>
          </div>
        )}
        {displayReviews.length > 0 && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                className={`h-4 w-4 ${i <= Math.round(displayReviews[0].rating) ? "text-accent fill-accent" : "text-muted-foreground"}`}
              />
            ))}
          </div>
        )}
      </div>
      {displayReviews.map(review => (
        <blockquote
          key={review.id}
          className="border-l-2 border-accent pl-4 text-muted-foreground text-sm italic"
        >
          "{review.text.slice(0, 150)}
          {review.text.length > 150 ? "..." : ""}"
          <footer className="mt-1 text-muted-foreground not-italic text-xs">
            — {review.name}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
