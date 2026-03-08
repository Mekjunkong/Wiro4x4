// client/src/components/calculator-v2/PriceBreakdownModal.tsx
import { BadgePercent, Quote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  formatTHB,
  type PriceBreakdown,
  type PriceLineItem,
} from "@shared/pricing";
import { CurrencyTooltip } from "./CurrencyTooltip";

interface PriceBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: PriceBreakdown | null;
}

export function PriceBreakdownModal({
  isOpen,
  onClose,
  breakdown,
}: PriceBreakdownModalProps) {
  const { t, language } = useLanguage();

  if (!breakdown) return null;

  const isHebrew = language === "he";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("Price Breakdown", "פירוט מחיר")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Custom quote warning */}
          {breakdown.isCustomQuote && (
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-sm text-sm text-amber-800">
              {t(
                "Group of 7+ — prices below are estimates. Contact us for exact pricing.",
                "קבוצה של 7+ — המחירים למטה הם הערכה. צרו קשר לקבלת מחיר מדויק."
              )}
            </div>
          )}

          {/* Tours */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {t("Tours", "טיולים")}
            </h4>
            {breakdown.tourItems.map((item: PriceLineItem, idx: number) => (
              <LineItem
                key={idx}
                label={isHebrew ? item.labelHe : item.labelEn}
                amount={item.amount}
              />
            ))}
            {breakdown.groupMultiplier > 1 && (
              <LineItem
                label={t(
                  `Group surcharge (×${breakdown.groupMultiplier})`,
                  `תוספת קבוצה (×${breakdown.groupMultiplier})`
                )}
                amount={breakdown.groupAdjustedTotal - breakdown.tourSubtotal}
                className="text-amber-600"
              />
            )}
            {breakdown.childrenSurcharge > 0 && (
              <LineItem
                label={t("Children surcharge", "תוספת ילדים")}
                amount={breakdown.childrenSurcharge}
                className="text-amber-600"
              />
            )}
          </div>

          {/* Package discount */}
          {breakdown.packageOption && (
            <div className="px-3 py-2.5 bg-green-50 border border-green-200 rounded-sm">
              <div className="flex items-center gap-2 text-green-800 font-medium text-sm mb-1">
                <BadgePercent className="w-4 h-4" />
                {t("Package Discount Available!", "הנחת חבילה זמינה!")}
              </div>
              <p className="text-xs text-green-700">
                {isHebrew
                  ? `${breakdown.packageOption.nameHe}: ${formatTHB(breakdown.packageOption.packagePrice)} (חיסכון ${formatTHB(breakdown.packageOption.savings)})`
                  : `${breakdown.packageOption.nameEn}: ${formatTHB(breakdown.packageOption.packagePrice)} (save ${formatTHB(breakdown.packageOption.savings)})`}
              </p>
            </div>
          )}

          {/* Services */}
          {breakdown.serviceItems.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t("Services", "שירותים")}
              </h4>
              {breakdown.serviceItems.map(
                (item: PriceLineItem, idx: number) => (
                  <LineItem
                    key={idx}
                    label={isHebrew ? item.labelHe : item.labelEn}
                    amount={item.amount}
                  />
                )
              )}
            </div>
          )}

          {/* Shabbat */}
          {breakdown.shabbatCost > 0 && (
            <LineItem
              label={t(
                `Shabbat Hotel (${breakdown.shabbatNights} night${breakdown.shabbatNights > 1 ? "s" : ""})`,
                `מלון שבת (${breakdown.shabbatNights} ${breakdown.shabbatNights > 1 ? "לילות" : "לילה"})`
              )}
              amount={breakdown.shabbatCost}
            />
          )}

          {/* Total */}
          <div className="border-t-2 border-[#D4AF37]/20 pt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xl font-bold">{t("Total", "סה״כ")}</span>
              <CurrencyTooltip thb={breakdown.total}>
                <span className="text-2xl font-bold text-[#D4AF37]">
                  {formatTHB(breakdown.total)}
                </span>
              </CurrencyTooltip>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("Deposit (30%)", "מקדמה (30%)")}</span>
              <span>{formatTHB(breakdown.depositAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("Balance on tour day", "יתרה ביום הטיול")}</span>
              <span>{formatTHB(breakdown.balanceAmount)}</span>
            </div>
          </div>

          {/* Customer testimonial */}
          <div className="bg-[#D4AF37]/10 rounded-lg p-4 border border-[#D4AF37]/30">
            <Quote className="w-5 h-5 text-[#D4AF37] mb-2" />
            <p className="text-sm italic mb-2">
              {t(
                "Amazing experience! The kosher meals were delicious and Wiro was so knowledgeable. Highly recommend!",
                "חוויה מדהימה! הארוחות הכשרות היו טעימות ווירו היה כל כך בעל ידע. ממליצה בחום!"
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              — {t("Sarah, Tel Aviv", "שרה, תל אביב")} ⭐⭐⭐⭐⭐
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LineItem({
  label,
  amount,
  className = "",
}: {
  label: string;
  amount: number;
  className?: string;
}) {
  return (
    <div className={`flex justify-between text-sm py-1 ${className}`}>
      <span>{label}</span>
      <span className="font-medium">{formatTHB(amount)}</span>
    </div>
  );
}
