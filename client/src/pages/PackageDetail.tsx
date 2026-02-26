import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { formatTHB } from "../../../shared/pricing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Tag,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Check,
} from "lucide-react";

const TOUR_IMAGE_MAP: Record<string, { webp: string; jpg: string }> = {
  "doi-inthanon-roof-of-thailand": {
    webp: "/images/optimized/accessible_doi_inthanon_summit.webp",
    jpg: "/images/optimized/accessible_doi_inthanon_summit.jpg",
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
    webp: "/images/optimized/accessible_doi_suthep_temple.webp",
    jpg: "/images/optimized/accessible_doi_suthep_temple.jpg",
  },
  "mae-wang-jungle-wilderness": {
    webp: "/images/optimized/elephant_encounter.webp",
    jpg: "/images/optimized/elephant_encounter.jpg",
  },
  "samoeng-loop-mountain-circuit": {
    webp: "/images/optimized/chiang_mai_valley.webp",
    jpg: "/images/optimized/chiang_mai_valley.jpg",
  },
};

export default function PackageDetail() {
  const { t } = useLanguage();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data: pkg, isLoading } = trpc.package.getBySlug.useQuery(
    { slug },
    { enabled: slug.length > 0 }
  );

  const packageName = pkg
    ? t(pkg.name, pkg.nameHe)
    : t("Package Details", "פרטי החבילה");
  const packageDesc = pkg
    ? t(pkg.description || "", pkg.descriptionHe || pkg.description || "")
    : "";

  usePageMeta({
    title: `${packageName} | WIRO 4x4`,
    description:
      packageDesc ||
      t(
        "Multi-day tour package in Chiang Mai with discount pricing.",
        "חבילת סיור מרובת ימים בצ'יאנג מאי במחירי הנחה."
      ),
    canonicalPath: `/packages/${slug}`,
    jsonLd: pkg
      ? {
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: pkg.name,
          description:
            pkg.description || `${pkg.name} — multi-day tour package`,
          touristType: "Adventure travelers",
          offers: {
            "@type": "Offer",
            price: pkg.discountedPrice,
            priceCurrency: "THB",
            availability: "https://schema.org/InStock",
          },
          provider: {
            "@type": "TourOperator",
            name: "WIRO 4x4",
            url: "https://www.wiro4x4indochina.com",
          },
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main
          id="main-content"
          className="flex-1 flex items-center justify-center"
        >
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main
          id="main-content"
          className="flex-1 container mx-auto px-4 py-16 text-center"
        >
          <h1 className="text-3xl font-bold text-primary mb-4">
            {t("Package Not Found", "החבילה לא נמצאה")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t(
              "The package you're looking for doesn't exist or has been removed.",
              "החבילה שחיפשתם לא קיימת או הוסרה."
            )}
          </p>
          <Link href="/packages">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to Packages", "חזרה לחבילות")}
            </Button>
          </Link>
        </main>
        <Footer />
        <FloatingActionButtons />
      </div>
    );
  }

  const coverSlug = pkg.tourSlugs[0];
  const coverImgMap = coverSlug ? TOUR_IMAGE_MAP[coverSlug] : null;
  const coverSrc =
    pkg.coverImage ||
    coverImgMap?.jpg ||
    "/images/optimized/chiang_mai_valley.jpg";
  const bookUrl = `/book?tours=${pkg.tourSlugs.join(",")}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative h-64 md:h-80">
          <img
            src={coverSrc}
            alt={packageName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-6">
            <Breadcrumb
              items={[
                { label: t("Tour Packages", "חבילות סיור"), href: "/packages" },
                { label: packageName },
              ]}
            />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {packageName}
            </h1>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {packageDesc && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {packageDesc}
                </p>
              )}

              {/* Package Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary" />
                  {pkg.tourSlugs.length} {t("days", "ימים")}
                </div>
                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-primary" />
                  {pkg.tourSlugs.length} {t("destinations", "יעדים")}
                </div>
                {pkg.discountPercent > 0 && (
                  <div className="flex items-center gap-2 text-sm bg-green-100 text-green-700 px-3 py-2 rounded-lg font-medium">
                    <Tag className="w-4 h-4" />
                    {t("Save", "חסכו")} {pkg.discountPercent}%
                  </div>
                )}
              </div>

              {/* Day-by-Day Itinerary */}
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  {t("Day-by-Day Itinerary", "מסלול יום אחר יום")}
                </h2>
                <div className="space-y-4">
                  {pkg.resolvedTours.map((tour, index) => {
                    const imgMap = TOUR_IMAGE_MAP[tour.slug];
                    const imgSrc =
                      imgMap?.jpg ||
                      tour.imageUrl ||
                      "/images/optimized/chiang_mai_valley.jpg";

                    return (
                      <Card key={tour.slug} className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative sm:w-48 h-40 sm:h-auto shrink-0">
                            <img
                              src={imgSrc}
                              alt={t(tour.name, tour.nameHe)}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                              {t("Day", "יום")} {index + 1}
                            </div>
                          </div>
                          <div className="p-4 flex-1">
                            <h3 className="text-lg font-bold mb-1">
                              {t(tour.name, tour.nameHe)}
                            </h3>
                            {tour.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {t(
                                  tour.description,
                                  tour.descriptionHe || tour.description
                                )}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {tour.duration}
                              </span>
                              {tour.difficulty && (
                                <span className="flex items-center gap-1 capitalize">
                                  {tour.difficulty}
                                </span>
                              )}
                              {tour.isKosher === 1 && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <Check className="w-3 h-3" />
                                  {t("Kosher", "כשר")}
                                </span>
                              )}
                            </div>
                            <div className="mt-2">
                              <Link
                                href={`/tours/${tour.slug}`}
                                className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                              >
                                {t("View tour details", "פרטי הסיור")}
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>

              {/* What's Included */}
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  {t("What's Included", "מה כלול")}
                </h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    t(
                      "Private 4x4 vehicle for all days",
                      "רכב 4x4 פרטי לכל הימים"
                    ),
                    t("Hebrew-speaking guide", "מדריך דובר עברית"),
                    t("Hotel pickup & drop-off", "איסוף והחזרה למלון"),
                    t("All entrance fees", "כל דמי הכניסה"),
                    t("Drinking water & snacks", "מים ונשנושים"),
                    t("Package discount applied", "הנחת חבילה מיושמת"),
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sticky Sidebar — Price & Book */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card border rounded-lg p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  {t("Package Price", "מחיר החבילה")}
                </h3>

                {/* Tour Prices List */}
                <ul className="space-y-2">
                  {pkg.resolvedTours.map(tour => (
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
                  {/* Original Price */}
                  {pkg.savings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>{t("Original Price", "מחיר מקורי")}</span>
                      <span className="line-through text-muted-foreground">
                        {formatTHB(pkg.originalPrice)}
                      </span>
                    </div>
                  )}

                  {/* Savings */}
                  {pkg.savings > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>
                        {t("You Save", "אתם חוסכים")} (-{pkg.discountPercent}%)
                      </span>
                      <span>-{formatTHB(pkg.savings)}</span>
                    </div>
                  )}

                  {/* Final Price */}
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t("Total", "סה״כ")}</span>
                    <span className="text-primary">
                      {formatTHB(pkg.discountedPrice)}
                    </span>
                  </div>

                  {/* Per Person Note */}
                  <p className="text-xs text-muted-foreground text-center">
                    {t("Price per person", "מחיר לאדם")}
                  </p>
                </div>

                <Link href={bookUrl}>
                  <Button className="w-full" size="lg">
                    {t("Book This Package", "הזמנת החבילה")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <Link
                  href="/packages"
                  className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 inline mr-1" />
                  {t("Browse all packages", "כל החבילות")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
