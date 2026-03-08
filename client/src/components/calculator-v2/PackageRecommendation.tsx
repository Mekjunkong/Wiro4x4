// client/src/components/calculator-v2/PackageRecommendation.tsx
import { useState } from "react";
import { Lightbulb, ChevronDown, BadgePercent } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatTHB, type PackageComparison } from "@shared/pricing";

interface PackageRecommendationProps {
  packageOption: PackageComparison | null;
}

export function PackageRecommendation({
  packageOption,
}: PackageRecommendationProps) {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!packageOption) return null;

  const isHebrew = language === "he";
  const packageName = isHebrew ? packageOption.nameHe : packageOption.nameEn;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-sm overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-3 hover:bg-green-100/50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          <Lightbulb className="w-5 h-5 text-green-600 shrink-0" />
          <span className="font-semibold text-green-800">
            {t(
              `Save ${formatTHB(packageOption.savings)} with our ${packageName}!`,
              `חסכו ${formatTHB(packageOption.savings)} עם ${packageName} שלנו!`
            )}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-green-600 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded content - comparison table */}
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 border-t border-green-200">
          <div className="mt-3 space-y-2">
            {/* À la carte price */}
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-muted-foreground">
                {t(
                  "À la carte (individual tours)",
                  "מחיר רגיל (טיולים נפרדים)"
                )}
              </span>
              <span className="font-medium line-through text-muted-foreground">
                {formatTHB(packageOption.individualPrice)}
              </span>
            </div>

            {/* Package price */}
            <div className="flex justify-between items-center py-2 text-sm">
              <div className="flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800">
                  {packageName}
                </span>
              </div>
              <span className="font-bold text-green-700">
                {formatTHB(packageOption.packagePrice)}
              </span>
            </div>

            {/* Savings */}
            <div className="flex justify-between items-center py-2 pt-3 border-t border-green-200">
              <span className="font-bold text-[#D4AF37]">
                {t("You save", "החיסכון שלכם")}
              </span>
              <span className="font-bold text-xl text-[#D4AF37]">
                {formatTHB(packageOption.savings)}
              </span>
            </div>
          </div>

          {/* Info text */}
          <p className="text-xs text-green-700 mt-3 bg-green-100 px-3 py-2 rounded-sm">
            {t(
              "Package discount automatically applied! Includes all selected tours at a special rate.",
              "הנחת חבילה מוחלת אוטומטית! כולל את כל הטיולים שבחרתם במחיר מיוחד."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
