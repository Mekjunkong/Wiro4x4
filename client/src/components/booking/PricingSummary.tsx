import { useLanguage } from "@/contexts/LanguageContext";
import { formatUSD, type PriceBreakdown } from "@shared/pricing";
import { Receipt } from "lucide-react";

interface Props {
  breakdown: PriceBreakdown | null;
}

export function PricingSummary({ breakdown }: Props) {
  const { language, t } = useLanguage();

  if (!breakdown) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3 sticky top-24">
      <div className="flex items-center gap-2 text-foreground font-semibold">
        <Receipt className="h-5 w-5 text-accent" />
        {t(
          "Price Estimate",
          "\u05D4\u05E2\u05E8\u05DB\u05EA \u05DE\u05D7\u05D9\u05E8"
        )}
      </div>

      {breakdown.tourItems.map((item, i) => (
        <div key={`tour-${i}`} className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {language === "he" ? item.labelHe : item.labelEn}
          </span>
          <span>{formatUSD(item.amount)}</span>
        </div>
      ))}

      {breakdown.serviceItems.map((item, i) => (
        <div key={`svc-${i}`} className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {language === "he" ? item.labelHe : item.labelEn}
          </span>
          <span>{formatUSD(item.amount)}</span>
        </div>
      ))}

      {breakdown.packageOption && (
        <div className="flex justify-between text-sm text-green-600">
          <span>
            {t(
              "Package Savings",
              "\u05D7\u05D9\u05E1\u05DB\u05D5\u05DF \u05DE\u05D7\u05D1\u05D9\u05DC\u05D4"
            )}
          </span>
          <span>-{formatUSD(breakdown.packageOption.savings)}</span>
        </div>
      )}

      <div className="border-t pt-3 flex justify-between font-bold text-lg">
        <span>{t("Total", '\u05E1\u05D4"\u05DB')}</span>
        <span className="text-accent">{formatUSD(breakdown.total)}</span>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex justify-between">
          <span>
            {t("Deposit (30%)", "\u05DE\u05E7\u05D3\u05DE\u05D4 (30%)")}
          </span>
          <span>{formatUSD(breakdown.depositAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t("Balance", "\u05D9\u05EA\u05E8\u05D4")}</span>
          <span>{formatUSD(breakdown.balanceAmount)}</span>
        </div>
      </div>

      {breakdown.isCustomQuote && (
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          {t(
            "Groups of 7+ require a custom quote.",
            "\u05E7\u05D1\u05D5\u05E6\u05D5\u05EA \u05E9\u05DC 7+ \u05D3\u05D5\u05E8\u05E9\u05D5\u05EA \u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8 \u05DE\u05D5\u05EA\u05D0\u05DE\u05EA."
          )}
        </p>
      )}
    </div>
  );
}
