// client/src/components/calculator-v2/PriceSummaryBar.tsx
import { Shield, Thermometer, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatTHB, type PriceBreakdown } from "@shared/pricing";
import { CurrencyTooltip } from "./CurrencyTooltip";

interface PriceSummaryBarProps {
  total: number | null;
  isVisible: boolean;
  onViewBreakdown: () => void;
  onSaveEstimate: () => void;
  breakdown?: PriceBreakdown | null;
}

export function PriceSummaryBar({
  total,
  isVisible,
  onViewBreakdown,
  onSaveEstimate,
  breakdown,
}: PriceSummaryBarProps) {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";

  if (!isVisible || total === null) return null;

  const hasSurcharge =
    breakdown && breakdown.seasonalSurcharge > 0 && breakdown.season;
  const seasonLabel = hasSurcharge
    ? isHebrew
      ? breakdown.season.labelHe
      : breakdown.season.labelEn
    : null;
  const isHolidaySeason =
    breakdown?.season?.type === "passover" ||
    breakdown?.season?.type === "sukkot";
  const SeasonIcon = isHolidaySeason ? Star : Thermometer;

  return (
    <>
      {/* Mobile: Fixed bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border shadow-lg z-40 animate-in slide-in-from-bottom duration-300">
        {/* Seasonal notice strip on mobile */}
        {hasSurcharge && (
          <div
            className={`flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-medium ${
              isHolidaySeason
                ? "bg-purple-100 text-purple-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            <SeasonIcon className="w-3 h-3" />
            <span>
              {seasonLabel} — +
              {Math.round((breakdown!.season.multiplier - 1) * 100)}%{" "}
              {t("surcharge applied", "תוספת עונתית")}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between px-4 h-20 pb-safe">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">
              {t("Total", "סה״כ")}
            </p>
            <CurrencyTooltip thb={total}>
              <p className="text-xl font-bold text-accent">
                {formatTHB(total)}
              </p>
            </CurrencyTooltip>
            <div className="flex items-center gap-1 text-[10px] text-green-700 mt-0.5">
              <Shield className="w-2.5 h-2.5" />
              <span>{t("100% Guarantee", "ערבות מלאה")}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSaveEstimate}
              className="px-3 py-2 border border-border rounded-sm hover:bg-muted transition-colors text-sm font-medium"
            >
              {t("Save", "שמירה")}
            </button>
            <button
              onClick={onViewBreakdown}
              className="px-3 py-2 bg-accent-cta text-white rounded-sm hover:bg-accent-cta-hover transition-colors text-sm font-medium"
            >
              {t("Breakdown", "פירוט")}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: Fixed bottom-right card */}
      <div className="hidden lg:block fixed bottom-6 right-6 w-[300px] bg-card border border-border rounded-lg shadow-xl z-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-5 space-y-4">
          {/* Total */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {t("Total Estimate", "הערכת מחיר")}
            </p>
            <CurrencyTooltip thb={total}>
              <p className="text-3xl font-bold text-accent">
                {formatTHB(total)}
              </p>
            </CurrencyTooltip>
          </div>

          {/* Seasonal surcharge badge */}
          {hasSurcharge && (
            <div
              className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-sm border ${
                isHolidaySeason
                  ? "bg-purple-50 text-purple-800 border-purple-200"
                  : "bg-orange-50 text-orange-800 border-orange-200"
              }`}
            >
              <SeasonIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {seasonLabel} (+
                {Math.round((breakdown!.season.multiplier - 1) * 100)}%{" "}
                {t("surcharge", "תוספת")})
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2">
            <button
              onClick={onViewBreakdown}
              className="w-full px-4 py-2.5 bg-accent-cta text-white rounded-sm hover:bg-accent-cta-hover transition-colors font-medium"
            >
              {t("View Breakdown", "צפו בפירוט")}
            </button>
            <button
              onClick={onSaveEstimate}
              className="w-full px-4 py-2.5 border border-border rounded-sm hover:bg-muted transition-colors font-medium"
            >
              {t("Save & Share", "שמירה ושיתוף")}
            </button>
          </div>

          {/* Guarantee badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-green-700 bg-green-50 py-2 px-3 rounded-sm border border-green-200">
            <Shield className="w-3 h-3" />
            <span className="font-medium">
              {t("100% Money-Back Guarantee", "החזר כספי מלא")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
