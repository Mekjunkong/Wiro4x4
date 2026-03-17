import { useState } from "react";
import { Trash2, ChevronDown, Star } from "lucide-react";
import { formatTHB, type TourSelection } from "@shared/pricing";
import { CurrencyTooltip } from "./CurrencyTooltip";
import { useLanguage } from "@/contexts/LanguageContext";

interface TourPreviewCardProps {
  tour: TourSelection & {
    isPopular?: boolean;
    highlights?: string[];
    highlightsHe?: string[];
    imageUrl?: string;
  };
  onRemove: () => void;
}

export function TourPreviewCard({ tour, onRemove }: TourPreviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language, t } = useLanguage();

  const highlights = language === "en" ? tour.highlights : tour.highlightsHe;
  const hasHighlights = highlights && highlights.length > 0;
  const displayHighlights = highlights?.slice(0, 3) || [];

  return (
    <div className="bg-accent/5 rounded-sm">
      <div className="p-4 flex items-center gap-3">
        {/* Thumbnail */}
        {tour.imageUrl && (
          <img
            src={tour.imageUrl}
            alt={language === "en" ? tour.nameEn : tour.nameHe}
            className="w-15 h-15 object-cover rounded flex-shrink-0"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h4 className="font-medium text-sm flex-1">
              {language === "en" ? tour.nameEn : tour.nameHe}
            </h4>

            {/* Popular Badge */}
            {tour.isPopular && (
              <span className="bg-gradient-to-r from-accent to-accent-cta text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                <Star className="w-3 h-3" />
                {t("Popular", "פופולרי")}
              </span>
            )}
          </div>

          {/* Price */}
          <CurrencyTooltip thb={tour.basePrice}>
            <span className="text-sm text-muted-foreground">
              {formatTHB(tour.basePrice)}
            </span>
          </CurrencyTooltip>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Expand Button */}
          {hasHighlights && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-muted rounded-sm transition-colors"
              aria-label={t("Show details", "הצג פרטים")}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          )}

          {/* Remove Button */}
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors"
            aria-label={t("Remove tour", "הסר טיול")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Highlights */}
      {isExpanded && hasHighlights && (
        <div className="px-4 pb-4 pt-0 border-t border-accent/10">
          <ul className="space-y-1 mt-3">
            {displayHighlights.map((highlight, index) => (
              <li key={index} className="text-sm text-muted-foreground flex">
                <span className="me-2">&bull;</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
