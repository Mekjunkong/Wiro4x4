// client/src/components/calculator-v2/TourSelector.tsx
import { ChevronDown, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatTHB, type TourSelection } from "@shared/pricing";
import { TourPreviewCard } from "./TourPreviewCard";
import { EmptyStateHero } from "./EmptyStateHero";

interface TourSelectorProps {
  availableTours: TourSelection[];
  selectedTours: TourSelection[];
  onAddTour: (tour: TourSelection) => void;
  onRemoveTour: (index: number) => void;
}

// Mark top 2 tours as popular (hardcoded for MVP)
const POPULAR_TOUR_SLUGS = [
  "doi-inthanon-roof-of-thailand",
  "mae-kampong-hidden-village",
];

export function TourSelector({
  availableTours,
  selectedTours,
  onAddTour,
  onRemoveTour,
}: TourSelectorProps) {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";

  return (
    <div className="space-y-4">
      {/* Selected tours */}
      {selectedTours.length > 0 ? (
        <div className="space-y-2">
          {selectedTours.map((tour, idx) => {
            // Check if tour is popular (basic implementation)

            const isPopular = POPULAR_TOUR_SLUGS.includes(
              (tour as any).slug || tour.name.toLowerCase().replace(/\s+/g, "-")
            );

            return (
              <TourPreviewCard
                key={idx}
                tour={{ ...tour, isPopular }}
                onRemove={() => onRemoveTour(idx)}
              />
            );
          })}
        </div>
      ) : (
        <EmptyStateHero />
      )}

      {/* Add tour dropdown */}
      <div className="relative">
        <label htmlFor="tour-select-v2" className="sr-only">
          {t("Select a tour to add", "בחרו טיול להוספה")}
        </label>
        <select
          id="tour-select-v2"
          onChange={e => {
            const idx = parseInt(e.target.value);
            if (!isNaN(idx)) {
              onAddTour(availableTours[idx]);
              e.target.value = "";
            }
          }}
          defaultValue=""
          className="w-full px-4 py-3 border border-border rounded-sm bg-background appearance-none cursor-pointer focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-base"
        >
          <option value="" disabled>
            {t("+ Add another tour...", "+ הוסיפו טיול נוסף...")}
          </option>
          {availableTours.map((tour, idx) => (
            <option key={idx} value={idx}>
              {isHebrew ? tour.nameHe : tour.name} — {formatTHB(tour.basePrice)}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      </div>

      {/* Booking count trust signal */}
      {selectedTours.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>
            {t(
              "12 travelers booked tours this week",
              "12 מטיילים הזמינו טיולים השבוע"
            )}
          </span>
        </div>
      )}
    </div>
  );
}
