import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
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
  Users,
  Mountain,
  Utensils,
  BedDouble,
} from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { trackEvent } from "@/lib/analytics";
import { WiroMap } from "@/components/wiro/WiroMap";
import { WiroRouteMap, revealMap } from "@/components/wiro/WiroRouteMap";
import { PACKAGE_ROUTES } from "@/data/packageRoutes";
import { FALLBACK_PACKAGES } from "@/data/multiDayPackages";
import { WIRO_TOUR_STORIES, type MapPlaceKey } from "@/data/wiroTours";
import {
  buildPackageBookingUrl,
  buildSelectedToursBookingUrl,
} from "@/lib/bookingTourContext";
import { tourPath } from "@shared/tourPaths";

/* ─── Tour image map for DB-based packages ─── */
const TOUR_IMAGE_MAP: Record<string, string> = {
  "doi-inthanon-roof-of-thailand": "doi_inthanon_peak",
  "mae-kampong-hidden-village": "mountain_village_view",
  "maerim-sticky-waterfalls": "sticky_waterfalls",
  "doi-suthep-pui-beyond-temple": "doi_suthep_temple",
  "mae-wang-jungle-wilderness": "mae_wang_elephants",
  "samoeng-loop-mountain-circuit": "samoeng_valley",
};

export default function PackageDetail() {
  const { t, language } = useLanguage();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const fallback = FALLBACK_PACKAGES[slug];

  const { data: dbPkg, isLoading } = trpc.package.getBySlug.useQuery(
    { slug },
    { enabled: slug.length > 0 && !fallback }
  );

  const hasFallback = !dbPkg && !!fallback;
  const hasData = !!dbPkg || hasFallback;
  const pricingSectionRef = useRef<HTMLDivElement>(null);
  const routeMapRef = useRef<HTMLDivElement>(null);
  const [mapDay, setMapDay] = useState<number | null>(null);
  // A highlighted day belongs to one package; start fresh on another.
  useEffect(() => setMapDay(null), [slug]);
  const tourViewKeyRef = useRef("");
  const pricingViewKeyRef = useRef("");

  const packageName = dbPkg
    ? t(dbPkg.name, dbPkg.nameHe)
    : fallback
      ? t(fallback.name, fallback.nameHe)
      : t("Package Details", "פרטי החבילה");

  const packageDesc = dbPkg
    ? t(dbPkg.description || "", dbPkg.descriptionHe || dbPkg.description || "")
    : fallback
      ? t(fallback.description, fallback.descriptionHe)
      : "";

  usePageMeta({
    title: `${packageName} | WIRO 4x4`,
    description:
      packageDesc ||
      t(
        "Multi-day tour package in Northern Thailand.",
        "חבילת סיור מרובת ימים בצפון תאילנד."
      ),
    canonicalPath: `/packages/${slug}`,
    jsonLd: hasData
      ? {
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: dbPkg?.name || fallback?.name || "",
          description:
            dbPkg?.description ||
            fallback?.description ||
            "Multi-day tour package",
          touristType: "Adventure travelers",
          provider: {
            "@type": "TourOperator",
            name: "WIRO 4x4",
            url: "https://www.wiro4x4indochina.com",
          },
        }
      : undefined,
  });

  useEffect(() => {
    if (!hasData || tourViewKeyRef.current === slug) return;
    tourViewKeyRef.current = slug;
    trackEvent("tour_view", {
      page: `/packages/${slug}`,
      placement: "package-detail",
      language,
      tour: slug,
    });
  }, [hasData, language, slug]);

  useEffect(() => {
    const element = pricingSectionRef.current;
    if (!hasData || !element || pricingViewKeyRef.current === slug) return;
    const observer = new IntersectionObserver(
      entries => {
        if (
          !entries.some(entry => entry.isIntersecting) ||
          pricingViewKeyRef.current === slug
        )
          return;
        pricingViewKeyRef.current = slug;
        trackEvent("pricing_view", {
          page: `/packages/${slug}`,
          placement: "booking-card",
          language,
          tour: slug,
        });
        observer.disconnect();
      },
      { threshold: 0.25 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasData, language, slug]);

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

  /* ─── Not found ─── */
  if (!hasData) {
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
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to Home", "חזרה לדף הבית")}
            </Button>
          </Link>
        </main>
        <Footer />
        <FloatingActionButtons />
      </div>
    );
  }

  /* ─── Fallback rendering (multi-day itinerary) ─── */
  if (hasFallback) {
    const pkg = fallback!;
    const whatsappMessage = `Hi! I'm interested in the ${pkg.name} package. Can you tell me more?`;

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-1">
          {/* Hero */}
          <section className="relative h-72 md:h-96">
            <img
              src={pkg.coverImage}
              alt={t(pkg.name, pkg.nameHe)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
              <Breadcrumb
                items={[
                  {
                    label: t("Adventures", "הרפתקאות"),
                    href: "/",
                  },
                  { label: t(pkg.name, pkg.nameHe) },
                ]}
              />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mt-2">
                {t(pkg.name, pkg.nameHe)}
              </h1>
            </div>
          </section>

          <div className="container mx-auto px-4 py-10">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-10">
                {/* Description */}
                <p className="text-lg text-foreground/70 leading-relaxed">
                  {t(pkg.description, pkg.descriptionHe)}
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm bg-background dark:bg-card px-4 py-2.5 rounded-lg">
                    <Calendar className="w-4 h-4 text-accent" />
                    {t(pkg.duration, pkg.durationHe)}
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-background dark:bg-card px-4 py-2.5 rounded-lg">
                    <MapPin className="w-4 h-4 text-accent" />
                    {t(pkg.location, pkg.locationHe)}
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-background dark:bg-card px-4 py-2.5 rounded-lg">
                    <Users className="w-4 h-4 text-accent" />
                    {t(pkg.groupSize, pkg.groupSizeHe)}
                  </div>
                </div>

                {/* Route map: an opened day highlights its leg */}
                {PACKAGE_ROUTES[slug] && (
                  <section ref={routeMapRef}>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                      {t("Route", "מסלול")}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold mt-1 mb-5">
                      {t("Your route, day by day", "המסלול שלכם, יום אחר יום")}
                    </h2>
                    <WiroRouteMap
                      stops={PACKAGE_ROUTES[slug].stops}
                      loop
                      focus={
                        mapDay === null
                          ? null
                          : (PACKAGE_ROUTES[slug].stages[String(mapDay)] ??
                            null)
                      }
                      className="wx-mapbox--loop"
                      label={t(
                        `Route map for ${pkg.name}`,
                        `מפת המסלול של ${pkg.nameHe}`
                      )}
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p
                        className="flex gap-2 text-sm font-semibold text-foreground"
                        aria-live="polite"
                      >
                        {mapDay === null ? (
                          t(
                            "The full route · open a day to see its leg",
                            "המסלול המלא · פתחו יום כדי לראות את הקטע שלו"
                          )
                        ) : (
                          <>
                            <span>
                              {t("Day", "יום")} {mapDay}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {(() => {
                                const d = pkg.itinerary.find(
                                  x => x.day === mapDay
                                );
                                return d ? t(d.title, d.titleHe) : "";
                              })()}
                            </span>
                          </>
                        )}
                      </p>
                      {mapDay !== null && (
                        <button
                          type="button"
                          onClick={() => setMapDay(null)}
                          className="text-sm font-bold text-primary underline underline-offset-4"
                        >
                          {t("Show the whole route", "הציגו את כל המסלול")}
                        </button>
                      )}
                    </div>
                  </section>
                )}

                {/* Day-by-Day Itinerary */}
                <section>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">
                    {t("Day-by-Day Itinerary", "מסלול יום אחר יום")}
                  </h2>
                  <div className="space-y-4">
                    {pkg.itinerary.map(day => (
                      <Card
                        key={day.day}
                        className="overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative sm:w-52 h-44 sm:h-auto shrink-0">
                            <OptimizedImage
                              src={day.image}
                              alt={t(day.title, day.titleHe)}
                              sizes="(max-width: 640px) 100vw, 208px"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3 bg-accent-cta text-white text-xs font-bold px-2.5 py-1 rounded">
                              {t("Day", "יום")} {day.day}
                            </div>
                          </div>
                          <details
                            className="p-5 flex-1"
                            onToggle={event => {
                              if (!event.currentTarget.open) return;
                              setMapDay(day.day);
                              trackEvent("itinerary_expand", {
                                page: `/packages/${slug}`,
                                placement: `day-${day.day}`,
                                language,
                                tour: slug,
                              });
                            }}
                          >
                            <summary className="cursor-pointer list-none text-lg font-bold mb-2">
                              {t(day.title, day.titleHe)}
                            </summary>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {t(day.description, day.descriptionHe)}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(language === "he"
                                ? day.highlightsHe
                                : day.highlights
                              ).map(h => (
                                <span
                                  key={h}
                                  className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium"
                                >
                                  {h}
                                </span>
                              ))}
                            </div>
                            {PACKAGE_ROUTES[slug] && (
                              <button
                                type="button"
                                aria-pressed={mapDay === day.day}
                                onClick={() => {
                                  setMapDay(day.day);
                                  revealMap(routeMapRef.current);
                                }}
                                className="mt-4 inline-flex items-center text-xs font-bold uppercase tracking-[0.12em] text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                              >
                                <MapPin
                                  className="me-1.5 size-3.5"
                                  aria-hidden="true"
                                />
                                {t("Show on map", "הציגו במפה")}
                              </button>
                            )}
                          </details>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>

                {/* What's Included */}
                <section>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">
                    {t("What's Included", "מה כלול")}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(language === "he" ? pkg.includedHe : pkg.included).map(
                      item => (
                        <div
                          key={item}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      )
                    )}
                  </div>
                </section>
              </div>

              {/* Sticky Sidebar */}
              <div className="lg:col-span-1">
                <div
                  ref={pricingSectionRef}
                  className="sticky top-28 bg-white dark:bg-card border border-accent/20 rounded-2xl p-6 shadow-lg space-y-5"
                >
                  <h3 className="font-heading font-bold text-xl flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-accent" />
                    {t("Trip Overview", "סקירת המסע")}
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium">
                          {t("Duration", "משך")}
                        </div>
                        <div className="text-muted-foreground">
                          {t(pkg.duration, pkg.durationHe)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium">
                          {t("Group Size", "גודל קבוצה")}
                        </div>
                        <div className="text-muted-foreground">
                          {t(pkg.groupSize, pkg.groupSizeHe)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Utensils className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium">
                          {t("Kosher Support", "תמיכה כשרה")}
                        </div>
                        <div className="text-muted-foreground">
                          {t("Available on request", "זמין לפי בקשה")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BedDouble className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium">
                          {t("Accommodation", "לינה")}
                        </div>
                        <div className="text-muted-foreground">
                          {t(
                            "Hotels & mountain lodges",
                            "מלונות ולודג'ים בהרים"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-accent-cta hover:bg-accent-cta-hover text-white font-bold"
                    size="lg"
                  >
                    <TrackedWhatsAppLink
                      sourceCode={
                        language === "he"
                          ? "PACKAGE-DETAIL-HE"
                          : "PACKAGE-DETAIL-EN"
                      }
                      humanMessage={whatsappMessage}
                      tour={slug}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("Inquire via WhatsApp", "פנו אלינו בוואטסאפ")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </TrackedWhatsAppLink>
                  </Button>

                  <Link href={buildPackageBookingUrl(pkg.name)}>
                    <Button variant="outline" className="w-full" size="lg">
                      {t("Book Online", "הזמנה אונליין")}
                    </Button>
                  </Link>

                  <Link
                    href="/"
                    className="block text-center text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3 inline mr-1" />
                    {t("All Adventures", "כל ההרפתקאות")}
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

  /* ─── DB-based package rendering (existing behavior) ─── */
  const pkg = dbPkg!;
  // Map places of the day tours in this package, in itinerary order.
  const packagePlaces = Array.from(
    new Set(
      pkg.tourSlugs.flatMap(
        tourSlug =>
          WIRO_TOUR_STORIES.find(story => story.slug === tourSlug)?.places ?? []
      )
    )
  ) as MapPlaceKey[];
  const coverSlug = pkg.tourSlugs[0];
  const coverImgName = coverSlug ? TOUR_IMAGE_MAP[coverSlug] : null;
  const coverSrc = pkg.coverImage || coverImgName || "samoeng_valley";
  const bookUrl = buildSelectedToursBookingUrl(
    pkg.tourSlugs,
    pkg.resolvedTours.map(tour => tour.slug)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative h-64 md:h-80">
          <OptimizedImage
            src={coverSrc}
            alt={packageName}
            priority
            sizes="100vw"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-6">
            <Breadcrumb
              items={[
                {
                  label: t("Tour Packages", "חבילות סיור"),
                  href: "/packages",
                },
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
              {packageDesc && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {packageDesc}
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary" />
                  {pkg.tourSlugs.length} {t("days", "ימים")}
                </div>
                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-primary" />
                  {pkg.tourSlugs.length} {t("destinations", "יעדים")}
                </div>
              </div>

              {packagePlaces.length > 0 && (
                <section>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                    {t("Route", "מסלול")}
                  </p>
                  <h2 className="text-2xl font-bold mt-1 mb-4">
                    {t(
                      "Every day starts in Chiang Mai",
                      "כל יום מתחיל בצ׳יאנג מאי"
                    )}
                  </h2>
                  <WiroMap
                    only={packagePlaces}
                    active={null}
                    className="wx-mapbox--route"
                    label={t(
                      `Map of the day trips in ${packageName}`,
                      `מפת טיולי היום ב${packageName}`
                    )}
                  />
                </section>
              )}

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  {t("Day-by-Day Itinerary", "מסלול יום אחר יום")}
                </h2>
                <div className="space-y-4">
                  {pkg.resolvedTours.map((tour, index) => {
                    const imgName = TOUR_IMAGE_MAP[tour.slug];
                    const imgSrc = imgName || tour.imageUrl || "samoeng_valley";

                    return (
                      <Card key={tour.slug} className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative sm:w-48 h-40 sm:h-auto shrink-0">
                            <OptimizedImage
                              src={imgSrc}
                              alt={t(tour.name, tour.nameHe)}
                              sizes="(max-width: 640px) 100vw, 192px"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                              {t("Day", "יום")} {index + 1}
                            </div>
                          </div>
                          <details
                            className="p-4 flex-1"
                            onToggle={event => {
                              if (!event.currentTarget.open) return;
                              trackEvent("itinerary_expand", {
                                page: `/packages/${slug}`,
                                placement: `day-${index + 1}`,
                                language,
                                tour: slug,
                              });
                            }}
                          >
                            <summary className="cursor-pointer list-none text-lg font-bold mb-1">
                              {t(tour.name, tour.nameHe)}
                            </summary>
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
                                href={tourPath(tour.slug, language)}
                                className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                              >
                                {t("View tour details", "פרטי הסיור")}
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </details>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>

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

            {/* Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div
                ref={pricingSectionRef}
                className="sticky top-24 bg-card border rounded-lg p-5 shadow-sm space-y-4"
              >
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  {t("Your Package", "החבילה שלכם")}
                </h3>

                <ul className="space-y-2">
                  {pkg.resolvedTours.map(tour => (
                    <li
                      key={tour.slug}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate mr-2">
                        {t(tour.name, tour.nameHe)}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="text-sm text-muted-foreground">
                  {t(
                    "Contact us for a proposal tailored to your group.",
                    "צרו קשר להצעה המותאמת לקבוצה שלכם."
                  )}
                </p>

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
