// client/src/components/calculator-v2/PriceSummaryBar.tsx
import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatTHB } from "@shared/pricing";
import { CurrencyTooltip } from "./CurrencyTooltip";

interface PriceSummaryBarProps {
  total: number | null;
  isVisible: boolean;
  onViewBreakdown: () => void;
  onSaveEstimate: () => void;
}

export function PriceSummaryBar({
  total,
  isVisible,
  onViewBreakdown,
  onSaveEstimate,
}: PriceSummaryBarProps) {
  const { t } = useLanguage();

  if (!isVisible || total === null) return null;

  return (
    <>
      {/* Mobile: Fixed bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-border shadow-lg z-40 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between px-4 py-3 pb-safe">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {t("Total", "סה״כ")}
            </p>
            <CurrencyTooltip thb={total}>
              <p className="text-2xl font-bold text-[#D4AF37]">
                {formatTHB(total)}
              </p>
            </CurrencyTooltip>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSaveEstimate}
              className="px-4 py-2 border border-border rounded-sm hover:bg-muted transition-colors text-sm font-medium"
            >
              {t("Save", "שמירה")}
            </button>
            <button
              onClick={onViewBreakdown}
              className="px-4 py-2 bg-[#D4AF37] text-white rounded-sm hover:bg-[#D4AF37]/90 transition-colors text-sm font-medium"
            >
              {t("Breakdown", "פירוט")}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: Fixed bottom-right card */}
      <div className="hidden lg:block fixed bottom-6 right-6 w-[300px] bg-white border border-border rounded-lg shadow-xl z-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-5 space-y-4">
          {/* Total */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {t("Total Estimate", "הערכת מחיר")}
            </p>
            <CurrencyTooltip thb={total}>
              <p className="text-3xl font-bold text-[#D4AF37]">
                {formatTHB(total)}
              </p>
            </CurrencyTooltip>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <button
              onClick={onViewBreakdown}
              className="w-full px-4 py-2.5 bg-[#D4AF37] text-white rounded-sm hover:bg-[#D4AF37]/90 transition-colors font-medium"
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
