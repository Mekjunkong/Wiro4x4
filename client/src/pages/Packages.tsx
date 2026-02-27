import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { calculatePackageDiscount, formatTHB } from "../../../shared/pricing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  Puzzle,
  Check,
  MapPin,
  Clock,
  Tag,
  ArrowRight,
} from "lucide-react";

const TOUR_IMAGE_MAP: Record<string, { webp: string; jpg: string }> = {
  "doi-inthanon-roof-of-thailand": {
    webp: "/images/optimized/doi_inthanon_peak.webp",
    jpg: "/images/optimized/doi_inthanon_peak.jpg",
  },
  "mae-kampong-hidden-village": {
    webp: "/images/optimized/mountain_village_view.webp",
    jpg: "/images/optimized/mountain_village_view.jpg",
  },
  "maerim-sticky-waterfalls": {
    webp: "/images/optimized/sticky_waterfalls.webp",
    jpg: "/images/optimized/sticky_waterfalls.jpg",
  },
  "doi-suthep-pui-beyond-temple": {
    webp: "/images/optimized/doi_suthep_temple.webp",
    jpg: "/images/optimized/doi_suthep_temple.jpg",
  },
  "mae-wang-jungle-wilderness": {
    webp: "/images/optimized/mae_wang_elephants.webp",
    jpg: "/images/optimized/mae_wang_elephants.jpg",
  },
  "samoeng-loop-mountain-circuit": {
    webp: "/images/optimized/samoeng_valley.webp",
    jpg: "/images/optimized/samoeng_valley.jpg",
  },
};

type Tab = "curated" | "build";

export default function Packages() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("curated");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  usePageMeta({
    title: t("Tour Packages | WIRO 4x4", "חבילות סיור | WIRO 4x4"),
    description: t(
      "Save up to 25% with multi-day tour packages. Choose a curated package or build your own adventure in Chiang Mai.",
      "חסכו עד 25% עם חבילות סיור מרובות ימים. בחרו חבילה מוכנה או בנו את ההרפתקה שלכם בצ'יאנג מאי."
    ),
    canonicalPath: "/packages",
  });

  const { data: packages = [] } = trpc.package.list.useQuery();
  const { data: tours = [] } = trpc.tour.list.useQuery();

  const toggleTour = (slug: string) => {
    setSelectedSlugs(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : prev.length >= 5
          ? prev
          : [...prev, slug]
    );
  };

  const selectedTours = tours.filter(t => selectedSlugs.includes(t.slug));
  const totalPrice = selectedTours.reduce((sum, t) => sum + t.price, 0);
  const discount =
    selectedTours.length >= 2
      ? calculatePackageDiscount(selectedTours.length, totalPrice)
      : null;

  const bookUrl =
    selectedSlugs.length >= 2 ? `/book?tours=${selectedSlugs.join(",")}` : "#";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-4">
            <Breadcrumb
              items={[{ label: t("Tour Packages", "חבילות סיור") }]}
            />
            <h1 className="text-4xl md:text-5xl font-bold text-primary mt-4 mb-4">
              {t("Tour Packages", "חבילות סיור")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t(
                "Save up to 25% when you combine multiple tours. Choose a ready-made package or build your own adventure.",
                "חסכו עד 25% כשאתם משלבים מספר סיורים. בחרו חבילה מוכנה או בנו את ההרפתקה שלכם."
              )}
            </p>
          </div>
        </section>

        {/* Tab Toggle */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-2 border-b mb-8">
            <button
              onClick={() => setActiveTab("curated")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === "curated"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-4 h-4" />
              {t("Curated Packages", "חבילות מוכנות")}
            </button>
            <button
              onClick={() => setActiveTab("build")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === "build"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Puzzle className="w-4 h-4" />
              {t("Build Your Own", "בנו חבילה משלכם")}
            </button>
          </div>

          {/* Curated Packages Tab */}
          {activeTab === "curated" && (
            <div>
              {packages.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">
                  {t(
                    "Curated packages coming soon! Try the Build Your Own tab.",
                    "חבילות מוכנות בקרוב! נסו את הלשונית בנו חבילה משלכם."
                  )}
                </p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map(pkg => {
                    const coverSlug = pkg.tourSlugs[0];
                    const imgMap = coverSlug ? TOUR_IMAGE_MAP[coverSlug] : null;
                    const imgSrc =
                      pkg.coverImage ||
                      imgMap?.jpg ||
                      "/images/optimized/samoeng_valley.jpg";

                    return (
                      <Card
                        key={pkg.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="relative h-48">
                          <img
                            src={imgSrc}
                            alt={t(pkg.name, pkg.nameHe)}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {pkg.discountPercent > 0 && (
                            <span className="absolute top-3 right-3 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                              -{pkg.discountPercent}%
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="text-xl font-bold mb-2">
                            {t(pkg.name, pkg.nameHe)}
                          </h3>
                          {pkg.description && (
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                              {t(
                                pkg.description,
                                pkg.descriptionHe || pkg.description
                              )}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="w-4 h-4" />
                            {pkg.tourSlugs.length} {t("tours", "סיורים")}
                            <Clock className="w-4 h-4 ml-2" />
                            {pkg.tourSlugs.length} {t("days", "ימים")}
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              {pkg.savings > 0 && (
                                <span className="text-sm text-muted-foreground line-through mr-2">
                                  {formatTHB(pkg.originalPrice)}
                                </span>
                              )}
                              <span className="text-xl font-bold text-primary">
                                {formatTHB(pkg.discountedPrice)}
                              </span>
                            </div>
                            <Link
                              href={`/packages/${pkg.slug}`}
                              className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                            >
                              {t("View Details", "פרטים")}
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Build Your Own Tab */}
          {activeTab === "build" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Tour Selection Grid */}
              <div className="lg:col-span-2">
                <p className="text-muted-foreground mb-4">
                  {t(
                    "Select 2-5 tours to create your custom package and unlock automatic discounts.",
                    "בחרו 2-5 סיורים כדי ליצור חבילה מותאמת אישית ולקבל הנחות אוטומטיות."
                  )}
                </p>

                {/* Discount Tiers */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { count: 2, pct: 10 },
                    { count: 3, pct: 15 },
                    { count: 4, pct: 20 },
                    { count: 5, pct: 25 },
                  ].map(({ count, pct }) => (
                    <span
                      key={count}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        selectedTours.length === count
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count} {t("tours", "סיורים")} = {pct}% {t("off", "הנחה")}
                    </span>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {tours.map(tour => {
                    const isSelected = selectedSlugs.includes(tour.slug);
                    const imgMap = TOUR_IMAGE_MAP[tour.slug];
                    const imgSrc =
                      imgMap?.jpg ||
                      tour.imageUrl ||
                      "/images/optimized/samoeng_valley.jpg";

                    return (
                      <Card
                        key={tour.id}
                        onClick={() => toggleTour(tour.slug)}
                        className={`cursor-pointer overflow-hidden transition-all ${
                          isSelected
                            ? "ring-2 ring-primary shadow-md"
                            : "hover:shadow-md"
                        } ${
                          !isSelected && selectedSlugs.length >= 5
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        <div className="relative h-32">
                          <img
                            src={imgSrc}
                            alt={t(tour.name, tour.nameHe)}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-sm mb-1">
                            {t(tour.name, tour.nameHe)}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {tour.duration}
                            </span>
                            <span className="font-medium text-foreground">
                              {formatTHB(tour.price)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Sticky Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-card border rounded-lg p-5 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    {t("Your Package", "החבילה שלכם")}
                  </h3>

                  {selectedTours.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      {t(
                        "Select at least 2 tours to see your package price.",
                        "בחרו לפחות 2 סיורים כדי לראות את מחיר החבילה."
                      )}
                    </p>
                  ) : (
                    <>
                      <ul className="space-y-2 mb-4">
                        {selectedTours.map(tour => (
                          <li
                            key={tour.slug}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="truncate mr-2">
                              {t(tour.name, tour.nameHe)}
                            </span>
                            <span className="text-muted-foreground whitespace-nowrap">
                              {formatTHB(tour.price)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t("Subtotal", "סה״כ לפני הנחה")}</span>
                          <span
                            className={
                              discount
                                ? "line-through text-muted-foreground"
                                : "font-bold"
                            }
                          >
                            {formatTHB(totalPrice)}
                          </span>
                        </div>

                        {discount && (
                          <>
                            <div className="flex justify-between text-sm text-green-600 font-medium">
                              <span>
                                {t("Discount", "הנחה")} (-
                                {discount.discountPercent}%)
                              </span>
                              <span>-{formatTHB(discount.savings)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                              <span>{t("Total", "סה״כ")}</span>
                              <span className="text-primary">
                                {formatTHB(discount.discountedPrice)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {selectedTours.length >= 2 ? (
                        <Link href={bookUrl}>
                          <Button className="w-full mt-4">
                            {t("Book This Package", "הזמנת החבילה")}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-4 text-center">
                          {t(
                            "Select 1 more tour to unlock package discount.",
                            "בחרו עוד סיור אחד כדי לקבל הנחת חבילה."
                          )}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
