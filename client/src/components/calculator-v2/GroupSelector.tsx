// client/src/components/calculator-v2/GroupSelector.tsx
import { Baby, Plus, Minus, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getEffectiveGroupSize, isCustomQuoteRequired } from "@shared/pricing";

interface GroupSelectorProps {
  adults: number;
  children: number[]; // array of ages
  onSetAdults: (count: number) => void;
  onAddChild: () => void;
  onRemoveChild: (index: number) => void;
  onUpdateChildAge: (index: number, age: number) => void;
}

export function GroupSelector({
  adults,
  children,
  onSetAdults,
  onAddChild,
  onRemoveChild,
  onUpdateChildAge,
}: GroupSelectorProps) {
  const { t } = useLanguage();

  const effectiveGroupSize = getEffectiveGroupSize({
    adults,
    children: children.map(age => ({ age })),
  });

  return (
    <div className="space-y-4">
      {/* Adults */}
      <div className="flex items-center justify-between">
        <span className="font-medium">{t("Adults", "מבוגרים")}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSetAdults(Math.max(1, adults - 1))}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            aria-label={t("Decrease adults", "הפחיתו מבוגרים")}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-bold text-lg">{adults}</span>
          <button
            onClick={() => onSetAdults(adults + 1)}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            aria-label={t("Increase adults", "הוסיפו מבוגרים")}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium flex items-center gap-2">
            <Baby className="w-4 h-4" />
            {t("Children", "ילדים")}
          </span>
          <button
            onClick={onAddChild}
            className="text-sm text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            {t("Add child", "הוסיפו ילד")}
          </button>
        </div>

        {children.length > 0 && (
          <div className="space-y-2">
            {children.map((age, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-20">
                  {t(`Child ${idx + 1}`, `ילד ${idx + 1}`)}
                </span>
                <select
                  value={age}
                  onChange={e =>
                    onUpdateChildAge(idx, parseInt(e.target.value))
                  }
                  aria-label={t(
                    `Age of child ${idx + 1}`,
                    `גיל ילד ${idx + 1}`
                  )}
                  className="flex-1 px-3 py-2 border border-border rounded-sm text-sm"
                >
                  {Array.from({ length: 18 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0
                        ? t("Under 1", "מתחת לגיל 1")
                        : t(`Age ${i}`, `גיל ${i}`)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => onRemoveChild(idx)}
                  className="text-red-500 hover:text-red-700 p-1"
                  aria-label={t("Remove child", "הסרת ילד")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-1">
              {t(
                "Under 3: free | Ages 3-10: 50% surcharge | 11+: full price",
                "מתחת ל-3: חינם | גילאי 3-10: 50% תוספת | 11+: מחיר מלא"
              )}
            </p>
          </div>
        )}

        {/* Group size warning */}
        <div className="mt-3 text-sm">
          {isCustomQuoteRequired(effectiveGroupSize) ? (
            <span className="text-amber-600 font-medium">
              {t(
                "Groups of 7+ require a custom quote — prices shown are estimates",
                "קבוצות של 7+ דורשות הצעת מחיר מותאמת — המחירים המוצגים הם הערכה"
              )}
            </span>
          ) : effectiveGroupSize >= 5 ? (
            <span className="text-muted-foreground">
              {t(
                "Group of 5-6: +20% surcharge applies",
                "קבוצה של 5-6: תוספת 20%"
              )}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
