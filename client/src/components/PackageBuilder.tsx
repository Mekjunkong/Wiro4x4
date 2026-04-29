import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MULTI_DAY_PACKAGES, formatUSD } from "@shared/pricing";
import { Check, Package, MessageCircle, BadgePercent } from "lucide-react";

interface Tour {
  name: string;
  nameHe: string;
  price: number;
  slug: string;
}

const FALLBACK_TOURS: Tour[] = [
  {
    name: "Doi Inthanon",
    nameHe: "\u05D3\u05D5\u05D9 \u05D0\u05D9\u05E0\u05EA\u05E0\u05D5\u05DF",
    price: 4200,
    slug: "doi-inthanon-roof-of-thailand",
  },
  {
    name: "Mae Kampong",
    nameHe: "\u05DE\u05D0\u05D4 \u05E7\u05DE\u05E4\u05D5\u05E0\u05D2",
    price: 3500,
    slug: "mae-kampong-hidden-village",
  },
  {
    name: "Sticky Waterfalls",
    nameHe:
      "\u05DE\u05E4\u05DC\u05D9\u05DD \u05D3\u05D1\u05D9\u05E7\u05D9\u05DD",
    price: 3800,
    slug: "maerim-sticky-waterfalls",
  },
  {
    name: "Doi Suthep & Pui",
    nameHe: "\u05D3\u05D5\u05D9 \u05E1\u05D5\u05D8\u05E4",
    price: 3200,
    slug: "doi-suthep-pui-beyond-temple",
  },
  {
    name: "Mae Wang Jungle",
    nameHe:
      "\u05D2'\u05D5\u05E0\u05D2\u05DC \u05DE\u05D0\u05D4 \u05D5\u05D5\u05D0\u05E0\u05D2",
    price: 4800,
    slug: "mae-wang-jungle-wilderness",
  },
  {
    name: "Samoeng Loop",
    nameHe:
      "\u05DC\u05D5\u05DC\u05D0\u05EA \u05E1\u05DE\u05D5\u05D0\u05E0\u05D2",
    price: 3500,
    slug: "samoeng-loop-mountain-circuit",
  },
];

export function PackageBuilder() {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  const { data: dbTours } = trpc.tour.list.useQuery();
  const tours: Tour[] = useMemo(() => {
    if (dbTours?.length) {
      return dbTours.map(t => ({
        name: t.name,
        nameHe: t.nameHe || t.name,
        price: t.price ?? 3500,
        slug: t.slug,
      }));
    }
    return FALLBACK_TOURS;
  }, [dbTours]);

  const toggleTour = (slug: string) => {
    setSelectedSlugs(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectedTours = tours.filter(t => selectedSlugs.has(t.slug));
  const totalDays = selectedTours.length;
  const individualTotal = selectedTours.reduce((sum, t) => sum + t.price, 0);

  // Find best matching package
  const matchingPackage = MULTI_DAY_PACKAGES.filter(
    p => p.days <= totalDays
  ).sort((a, b) => b.days - a.days)[0];

  const packageTotal = matchingPackage
    ? matchingPackage.price +
      (totalDays > matchingPackage.days
        ? selectedTours
            .slice(matchingPackage.days)
            .reduce((s, t) => s + t.price, 0)
        : 0)
    : individualTotal;

  const savings = individualTotal - packageTotal;
  const savingsPercent =
    individualTotal > 0 ? Math.round((savings / individualTotal) * 100) : 0;

  const whatsappMessage = encodeURIComponent(
    isHebrew
      ? `היי WIRO 4x4! אשמח לבנות חבילה של ${totalDays} ימים:\n\n${selectedTours
          .map(tour => `- ${tour.nameHe} (${formatUSD(tour.price)})`)
          .join("\n")}\n\nסה"כ משוער: ${formatUSD(packageTotal)}${
          savings > 0 ? ` (חיסכון ${formatUSD(savings)})` : ""
        }\n\nאשמח לקבל הצעת מחיר!`
      : `Hi WIRO 4x4! I'd like to build a ${totalDays}-day package:\n\n${selectedTours
          .map(tour => `- ${tour.name} (${formatUSD(tour.price)})`)
          .join("\n")}\n\nTotal estimate: ${formatUSD(packageTotal)}${
          savings > 0 ? ` (saving ${formatUSD(savings)})` : ""
        }\n\nPlease send me a quote!`
  );

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-6 h-6 text-secondary" />
        <h3 className="text-xl sm:text-2xl font-bold text-primary">
          {t(
            "Build a Multi-Day Package",
            "\u05D1\u05E0\u05D5 \u05D7\u05D1\u05D9\u05DC\u05D4 \u05E8\u05D1-\u05D9\u05D5\u05DE\u05D9\u05EA"
          )}
        </h3>
      </div>

      <p className="text-muted-foreground mb-6 text-sm">
        {t(
          "Select 2 or more tours to unlock package discounts.",
          "\u05D1\u05D7\u05E8\u05D5 2 \u05D8\u05D9\u05D5\u05DC\u05D9\u05DD \u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8 \u05DB\u05D3\u05D9 \u05DC\u05E7\u05D1\u05DC \u05D4\u05E0\u05D7\u05EA \u05D7\u05D1\u05D9\u05DC\u05D4."
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {tours.map(tour => {
          const isSelected = selectedSlugs.has(tour.slug);
          return (
            <button
              key={tour.slug}
              onClick={() => toggleTour(tour.slug)}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {t(tour.name, tour.nameHe)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatUSD(tour.price)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {totalDays >= 2 && (
        <div className="border-t pt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t(
                "Individual total",
                "\u05E1\u05DB\u05D5\u05DD \u05D1\u05D5\u05D3\u05D3"
              )}
            </span>
            <span className="line-through text-muted-foreground">
              {formatUSD(individualTotal)}
            </span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-sm items-center">
              <span className="flex items-center gap-1 text-emerald-600">
                <BadgePercent className="w-4 h-4" />
                {t(
                  `Package discount (save ${savingsPercent}%)`,
                  `\u05D4\u05E0\u05D7\u05EA \u05D7\u05D1\u05D9\u05DC\u05D4 (\u05D7\u05D9\u05E1\u05DB\u05D5\u05DF ${savingsPercent}%)`
                )}
              </span>
              <span className="text-emerald-600 font-medium">
                -{formatUSD(savings)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>
              {t(
                "Package total",
                "\u05E1\u05D4\u05F4\u05DB \u05D7\u05D1\u05D9\u05DC\u05D4"
              )}
            </span>
            <span className="text-primary">{formatUSD(packageTotal)}</span>
          </div>

          <Button
            asChild
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t(
                "Get a Quote via WhatsApp",
                "\u05E7\u05D1\u05DC\u05D5 \u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8 \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4"
              )}
            </a>
          </Button>
        </div>
      )}

      {totalDays === 1 && (
        <p className="text-center text-sm text-muted-foreground pt-4 border-t">
          {t(
            "Select at least one more tour for package pricing.",
            "\u05D1\u05D7\u05E8\u05D5 \u05E2\u05D5\u05D3 \u05D8\u05D9\u05D5\u05DC \u05D0\u05D7\u05D3 \u05DC\u05E4\u05D7\u05D5\u05EA \u05DC\u05DE\u05D7\u05D9\u05E8 \u05D7\u05D1\u05D9\u05DC\u05D4."
          )}
        </p>
      )}
    </Card>
  );
}
