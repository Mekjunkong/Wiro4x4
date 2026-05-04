import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GoldDivider } from "@/components/GoldDivider";
import { Breadcrumb } from "@/components/Breadcrumb";
import { OptimizedImage } from "@/components/OptimizedImage";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "all", en: "All", he: "\u05D4\u05DB\u05DC" },
  { id: "tours", en: "Tours", he: "\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD" },
  { id: "vehicles", en: "Vehicles", he: "\u05E8\u05DB\u05D1\u05D9\u05DD" },
  {
    id: "destinations",
    en: "Destinations",
    he: "\u05D9\u05E2\u05D3\u05D9\u05DD",
  },
  {
    id: "activities",
    en: "Activities",
    he: "\u05E4\u05E2\u05D9\u05DC\u05D5\u05D9\u05D5\u05EA",
  },
  { id: "food", en: "Food", he: "\u05D0\u05D5\u05DB\u05DC" },
  { id: "accommodation", en: "Accommodation", he: "\u05DC\u05D9\u05E0\u05D4" },
  { id: "other", en: "Other", he: "\u05D0\u05D7\u05E8" },
];

const FALLBACK_GALLERY_PHOTOS = [
  {
    id: 1,
    title: "4x4 River Crossing",
    titleHe: "\u05D7\u05E6\u05D9\u05D9\u05EA \u05E0\u05D4\u05E8 \u05D1-4x4",
    imageUrl: "/images/optimized/wiro_4x4_river_splash.webp",
    category: "vehicles",
    description: "",
  },
  {
    id: 2,
    title: "Mountain Sunset",
    titleHe: "\u05E9\u05E7\u05D9\u05E2\u05D4 \u05D1\u05D4\u05E8\u05D9\u05DD",
    imageUrl: "/images/optimized/mountain_sunset_golden.webp",
    category: "destinations",
    description: "",
  },
  {
    id: 3,
    title: "Jungle Convoy",
    titleHe: "\u05E9\u05D9\u05D9\u05E8\u05EA \u05D2'.\u05D5\u05E0\u05D2\u05DC",
    imageUrl: "/images/optimized/wiro_jungle_convoy.webp",
    category: "vehicles",
    description: "",
  },
  {
    id: 4,
    title: "Elephant Encounter",
    titleHe:
      "\u05DE\u05E4\u05D2\u05E9 \u05E2\u05DD \u05E4\u05D9\u05DC\u05D9\u05DD",
    imageUrl: "/images/optimized/elephant_bathing.webp",
    category: "activities",
    description: "",
  },
  {
    id: 5,
    title: "Jungle Waterfall",
    titleHe: "\u05DE\u05E4\u05DC \u05D1\u05D2'.\u05D5\u05E0\u05D2\u05DC",
    imageUrl: "/images/optimized/jungle_waterfall_cascade_rocks.webp",
    category: "destinations",
    description: "",
  },
  {
    id: 6,
    title: "The Wiro Fleet",
    titleHe: "\u05E6\u05D9 \u05D4\u05E8\u05DB\u05D1\u05D9\u05DD",
    imageUrl: "/images/optimized/wiro_fleet_lineup.webp",
    category: "vehicles",
    description: "",
  },
  {
    id: 7,
    title: "Sticky Waterfalls",
    titleHe: "\u05DE\u05E4\u05DC\u05D9 \u05D4\u05E1\u05D8\u05D9\u05E7\u05D9",
    imageUrl: "/images/optimized/sticky_waterfalls.webp",
    category: "activities",
    description: "",
  },
  {
    id: 8,
    title: "Hilltribe Market",
    titleHe: "\u05E9\u05D5\u05E7 \u05E9\u05D1\u05D8\u05D9",
    imageUrl: "/images/optimized/hilltribe_girl_craft_market.webp",
    category: "activities",
    description: "",
  },
  {
    id: 9,
    title: "4x4 Water Splash",
    titleHe: "\u05E0\u05D9\u05EA\u05D5\u05E8 \u05DE\u05D9\u05DD 4x4",
    imageUrl: "/images/optimized/4x4_water_splash.webp",
    category: "vehicles",
    description: "",
  },
  {
    id: 10,
    title: "Wiro Guide",
    titleHe: "\u05D4\u05DE\u05D3\u05E8\u05D9\u05DA \u05D5\u05D9\u05E8\u05D5",
    imageUrl: "/images/optimized/wiro_guide_thumbsup_portrait.webp",
    category: "tours",
    description: "",
  },
  {
    id: 11,
    title: "Mountain Valley View",
    titleHe: "\u05E0\u05D5\u05E3 \u05E2\u05DE\u05E7 \u05D4\u05E8\u05D9\u05DD",
    imageUrl: "/images/optimized/mountain_valley_panorama.webp",
    category: "destinations",
    description: "",
  },
  {
    id: 12,
    title: "Mountain Trail Drive",
    titleHe: "\u05E0\u05E1\u05D9\u05E2\u05D4 \u05D1\u05D4\u05E8\u05D9\u05DD",
    imageUrl: "/images/optimized/4x4_truck_countryside_road.webp",
    category: "vehicles",
    description: "",
  },
  {
    id: 13,
    title: "Twin Waterfalls",
    titleHe: "\u05DE\u05E4\u05DC\u05D9 \u05EA\u05D0\u05D5\u05DE\u05D9\u05DD",
    imageUrl: "/images/optimized/twin_falls_forest_view.webp",
    category: "destinations",
    description: "",
  },
  {
    id: 14,
    title: "Scenic Overlook Stop",
    titleHe: "\u05E2\u05E6\u05D9\u05E8\u05D4 \u05D1\u05E0\u05D5\u05E3",
    imageUrl: "/images/optimized/wiro_vehicle_scenic_stop.webp",
    category: "tours",
    description: "",
  },
  {
    id: 15,
    title: "River Crossing Adventure",
    titleHe: "\u05D7\u05E6\u05D9\u05D9\u05EA \u05E0\u05D4\u05E8",
    imageUrl: "/images/optimized/tourists_river_crossing.webp",
    category: "activities",
    description: "",
  },
  {
    id: 16,
    title: "Wiro Team",
    titleHe: "\u05E6\u05D5\u05D5\u05EA \u05D5\u05D9\u05E8\u05D5",
    imageUrl: "/images/optimized/wiro_crew_team.webp",
    category: "tours",
    description: "",
  },
  {
    id: 17,
    title: "Between the 4x4s",
    titleHe: "\u05D1\u05D9\u05DF \u05D4\u05E8\u05DB\u05D1\u05D9\u05DD",
    imageUrl: "/images/optimized/wiro_between_4x4s.webp",
    category: "vehicles",
    description: "",
  },
  {
    id: 18,
    title: "Misty Mountain View",
    titleHe:
      "\u05E0\u05D5\u05E3 \u05D4\u05E8\u05D9\u05DD \u05D4\u05E2\u05E8\u05E4\u05D9\u05DC\u05D9",
    imageUrl: "/images/optimized/misty_mountain_viewpoint.webp",
    category: "destinations",
    description: "",
  },
  {
    id: 19,
    title: "Elephant Feeding",
    titleHe: "\u05D4\u05D0\u05DB\u05DC\u05EA \u05E4\u05D9\u05DC\u05D9\u05DD",
    imageUrl: "/images/optimized/elephant_feeding_sanctuary.webp",
    category: "activities",
    description: "",
  },
  {
    id: 20,
    title: "Canyon Trail",
    titleHe: "\u05E9\u05D1\u05D9\u05DC \u05D4\u05E7\u05E0\u05D9\u05D5\u05DF",
    imageUrl: "/images/optimized/couple_canyon_edge.webp",
    category: "destinations",
    description: "",
  },
];

const PAGE_SIZE = 20;

export default function Gallery() {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";
  usePageMeta({
    title: "Photo Gallery",
    description:
      "Explore adventure photos from WIRO 4x4 kosher off-road tours in Chiang Mai, Northern Thailand.",
    canonicalPath: "/gallery",
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Featured photos for carousel
  const { data: featuredPhotos } = trpc.gallery.listFeatured.useQuery();

  const gridRef = useScrollReveal<HTMLDivElement>({ stagger: 0.1 });

  // Track broken S3 images to hide them from the grid
  const [brokenIds, setBrokenIds] = useState<Set<number>>(new Set());

  // Pagination state
  const [extraPhotos, setExtraPhotos] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  // First page via tRPC useQuery
  const categoryParam =
    selectedCategory === "all" ? undefined : selectedCategory;
  const { data: firstPage, isLoading } = trpc.gallery.listPaginated.useQuery({
    page: 1,
    pageSize: PAGE_SIZE,
    category: categoryParam,
  });

  // Reset on category change
  useEffect(() => {
    setExtraPhotos([]);
    setCurrentPage(1);
    setHasMore(true);
    setBrokenIds(new Set());
  }, [selectedCategory]);

  // Update hasMore when firstPage arrives
  useEffect(() => {
    if (firstPage) {
      setHasMore(currentPage < firstPage.totalPages);
    }
  }, [firstPage, currentPage]);

  // Determine if we should use fallback local photos
  const dbPhotos = useMemo(() => {
    const base = firstPage?.items || [];
    return [...base, ...extraPhotos];
  }, [firstPage, extraPhotos]);

  // Check how many DB photos survived the broken filter
  const visibleDbCount = useMemo(() => {
    return dbPhotos.filter(p => !brokenIds.has(p.id)).length;
  }, [dbPhotos, brokenIds]);

  // Use fallback when DB is empty OR all DB photos have broken S3 URLs
  const usingFallback = !isLoading && visibleDbCount === 0;

  const filteredPhotos = useMemo(() => {
    if (usingFallback) {
      return selectedCategory === "all"
        ? FALLBACK_GALLERY_PHOTOS
        : FALLBACK_GALLERY_PHOTOS.filter(p => p.category === selectedCategory);
    }
    // Deduplicate and exclude broken DB photos
    const seen = new Set<string>();
    return dbPhotos.filter(photo => {
      if (brokenIds.has(photo.id)) return false;
      const url = photo.imageUrl || "";
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [usingFallback, selectedCategory, dbPhotos, brokenIds]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await utils.gallery.listPaginated.fetch({
        page: nextPage,
        pageSize: PAGE_SIZE,
        category: categoryParam,
      });
      setExtraPhotos(prev => [...prev, ...result.items]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < result.totalPages);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, currentPage, categoryParam, utils]);

  // IntersectionObserver for sentinel
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goToPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex(
      lightboxIndex > 0 ? lightboxIndex - 1 : filteredPhotos.length - 1
    );
  }, [lightboxIndex, filteredPhotos.length]);

  const goToNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex(
      lightboxIndex < filteredPhotos.length - 1 ? lightboxIndex + 1 : 0
    );
  }, [lightboxIndex, filteredPhotos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, goToPrev, goToNext, closeLightbox]);

  // Touch swipe gesture support for lightbox
  const swipeRef = useRef<{ startX: number; startY: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    swipeRef.current = { startX: touch.clientX, startY: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!swipeRef.current) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeRef.current.startX;
      const deltaY = touch.clientY - swipeRef.current.startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      const SWIPE_THRESHOLD = 50;

      if (absDeltaY > absDeltaX && deltaY > SWIPE_THRESHOLD) {
        // Swipe down: close lightbox
        closeLightbox();
      } else if (absDeltaX > absDeltaY && absDeltaX > SWIPE_THRESHOLD) {
        if (deltaX < 0) {
          // Swipe left: next photo
          goToNext();
        } else {
          // Swipe right: previous photo
          goToPrev();
        }
      }
      swipeRef.current = null;
    },
    [closeLightbox, goToNext, goToPrev]
  );

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb
        items={[{ label: t("Gallery", "\u05D2\u05DC\u05E8\u05D9\u05D4") }]}
      />
      <main id="main-content">
        {/* Hero Banner with Photo */}
        <section className="relative h-[50vh] min-h-[320px] max-h-[500px] mt-20 overflow-hidden">
          <OptimizedImage
            src="forest_waterfall_pool"
            alt={t(
              "Northern Thailand jungle waterfall",
              "מפל ג'ונגל בצפון תאילנד"
            )}
            className="absolute inset-0 w-full h-full object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
            <Camera className="w-10 h-10 mb-3 opacity-90 drop-shadow-lg" />
            <h1 className="text-3xl md:text-5xl font-serif font-medium mb-3 drop-shadow-lg">
              {t(
                "Photo Gallery",
                "\u05D2\u05DC\u05E8\u05D9\u05D9\u05EA \u05EA\u05DE\u05D5\u05E0\u05D5\u05EA"
              )}
            </h1>
            <GoldDivider />
            <p className="text-lg md:text-xl opacity-95 max-w-2xl mx-auto drop-shadow-md">
              {t(
                "Explore our adventures through Northern Thailand - from mountain trails to hidden waterfalls",
                "\u05D2\u05DC\u05D5 \u05D0\u05EA \u05D4\u05D4\u05E8\u05E4\u05EA\u05E7\u05D0\u05D5\u05EA \u05E9\u05DC\u05E0\u05D5 \u05D1\u05E6\u05E4\u05D5\u05DF \u05EA\u05D0\u05D9\u05DC\u05E0\u05D3 - \u05DE\u05E9\u05D1\u05D9\u05DC\u05D9 \u05D4\u05E8\u05D9\u05DD \u05D5\u05E2\u05D3 \u05DE\u05E4\u05DC\u05D9\u05DD \u05E0\u05E1\u05EA\u05E8\u05D9\u05DD"
              )}
            </p>
          </div>
        </section>

        {/* Featured Photos Carousel */}
        {featuredPhotos && featuredPhotos.length > 0 && (
          <FeaturedCarousel
            photos={featuredPhotos}
            onPhotoClick={index => {
              // Find this featured photo in the main grid to open lightbox at correct index
              const photo = featuredPhotos[index];
              const gridIndex = filteredPhotos.findIndex(
                p => p.id === photo.id
              );
              if (gridIndex >= 0) {
                openLightbox(gridIndex);
              } else {
                // Photo might not be in current grid filter — just open first
                openLightbox(0);
              }
            }}
          />
        )}

        <div className="container py-8 md:py-12">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id;
              // Show total count for "All", no counts for individual categories
              // since server-side pagination doesn't give us per-category totals
              const showCount = cat.id === "all" && firstPage;
              const totalCount = firstPage?.total ?? 0;

              return (
                <button
                  key={cat.id}
                  className={`${
                    isActive
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border border-accent/50 text-accent"
                  } rounded-sm px-4 py-1.5 text-xs tracking-[0.15em] uppercase`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {isHebrew ? cat.he : cat.en}
                  {showCount && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-sm text-xs font-medium ml-1.5 ${
                        isActive
                          ? "bg-foreground/20 text-foreground"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      {totalCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-sm overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredPhotos.length === 0 && (
            <div className="text-center py-16">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                {t(
                  "No photos yet",
                  "\u05D0\u05D9\u05DF \u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05E2\u05D3\u05D9\u05D9\u05DF"
                )}
              </h3>
              <p className="text-muted-foreground">
                {t(
                  "Check back soon for amazing adventure photos!",
                  "\u05D7\u05D6\u05E8\u05D5 \u05D1\u05E7\u05E8\u05D5\u05D1 - \u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05DE\u05D4\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD \u05D1\u05D3\u05E8\u05DA!"
                )}
              </p>
            </div>
          )}

          {/* Photo Grid */}
          {!isLoading && filteredPhotos.length > 0 && (
            <div
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative rounded-sm overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-card"
                  onClick={() => openLightbox(index)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openLightbox(index);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t("View photo", "\u05E6\u05E4\u05D4 \u05D1\u05EA\u05DE\u05D5\u05E0\u05D4")}: ${photo.title}`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <OptimizedImage
                      src={photo.imageUrl}
                      alt={`${photo.title}${photo.category ? ` - ${photo.category}` : ""} | WIRO 4x4 Gallery`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={() =>
                        setBrokenIds(prev => {
                          const next = new Set(Array.from(prev));
                          next.add(photo.id);
                          return next;
                        })
                      }
                    />
                    {/* Gold hover overlay */}
                    <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="text-white font-semibold text-lg">
                      {photo.title}
                    </h3>
                    {photo.category && (
                      <Badge variant="secondary" className="mt-1">
                        {CATEGORIES.find(c => c.id === photo.category)?.[
                          isHebrew ? "he" : "en"
                        ] || photo.category}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="col-span-full flex justify-center py-8"
                >
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Share Your Photos Section */}
        <UserPhotoUploadSection />

        {/* Lightbox Dialog */}
        <Dialog
          open={lightboxIndex !== null}
          onOpenChange={open => !open && closeLightbox()}
        >
          <DialogContent
            className="max-w-[95vw] max-h-[95vh] sm:max-w-[90vw] p-0 bg-black/95 border-none"
            aria-label={t(
              "Photo lightbox viewer",
              "\u05EA\u05E6\u05D5\u05D2\u05EA \u05EA\u05DE\u05D5\u05E0\u05D4 \u05DE\u05D5\u05D2\u05D3\u05DC\u05EA"
            )}
          >
            {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
              <div
                className="relative flex flex-col items-center justify-center min-h-[60vh]"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                  aria-label={t(
                    "Close lightbox",
                    "\u05E1\u05D2\u05D5\u05E8 \u05EA\u05E6\u05D5\u05D2\u05D4"
                  )}
                >
                  <X className="w-6 h-6" />
                </button>

                {filteredPhotos.length > 1 && (
                  <>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        goToPrev();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-3 md:p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors touch-manipulation"
                      style={{
                        minWidth: "48px",
                        minHeight: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={t(
                        "Previous photo",
                        "\u05EA\u05DE\u05D5\u05E0\u05D4 \u05E7\u05D5\u05D3\u05DE\u05EA"
                      )}
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        goToNext();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-3 md:p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors touch-manipulation"
                      style={{
                        minWidth: "48px",
                        minHeight: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={t(
                        "Next photo",
                        "\u05EA\u05DE\u05D5\u05E0\u05D4 \u05D4\u05D1\u05D0\u05D4"
                      )}
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
                )}

                <img
                  src={filteredPhotos[lightboxIndex].imageUrl}
                  alt={filteredPhotos[lightboxIndex].title}
                  className="max-w-full max-h-[80vh] object-contain select-none"
                  draggable={false}
                />

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h3 className="text-xl font-semibold">
                    {filteredPhotos[lightboxIndex].title}
                  </h3>
                  {filteredPhotos[lightboxIndex].description && (
                    <p className="text-white/80 mt-1">
                      {filteredPhotos[lightboxIndex].description}
                    </p>
                  )}
                  <p className="text-white/50 text-sm mt-2">
                    {lightboxIndex + 1} / {filteredPhotos.length}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <FloatingActionButtons />
      <Footer />
    </div>
  );
}

// ── User Photo Upload Section ────────────────────────────────────────

type UploadCategory =
  | "tours"
  | "vehicles"
  | "destinations"
  | "activities"
  | "food"
  | "accommodation"
  | "other";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function UserPhotoUploadSection() {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    tourDate: "",
    category: "tours" as UploadCategory,
  });

  const submitMutation = trpc.gallery.submitUserPhoto.useMutation();

  // Generate previews when files change
  useEffect(() => {
    const urls = selectedFiles.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [selectedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Only JPG, PNG, WebP allowed`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large (max 10MB)`);
        continue;
      }
      valid.push(file);
    }

    const total = selectedFiles.length + valid.length;
    if (total > MAX_FILES) {
      errors.push(
        t(
          `Maximum ${MAX_FILES} photos allowed`,
          `\u05DE\u05E7\u05E1\u05D9\u05DE\u05D5\u05DD ${MAX_FILES} \u05EA\u05DE\u05D5\u05E0\u05D5\u05EA`
        )
      );
      valid.splice(MAX_FILES - selectedFiles.length);
    }

    if (errors.length > 0) {
      toast.error(errors.join("\n"));
    }
    if (valid.length > 0) {
      setSelectedFiles(prev => [...prev, ...valid]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.title ||
      selectedFiles.length === 0
    ) {
      toast.error(
        t(
          "Please fill in all required fields and select at least one photo.",
          "\u05D0\u05E0\u05D0 \u05DE\u05DC\u05D0 \u05D0\u05EA \u05DB\u05DC \u05D4\u05E9\u05D3\u05D5\u05EA \u05D4\u05E0\u05D3\u05E8\u05E9\u05D9\u05DD \u05D5\u05D1\u05D7\u05E8 \u05DC\u05E4\u05D7\u05D5\u05EA \u05EA\u05DE\u05D5\u05E0\u05D4 \u05D0\u05D7\u05EA."
        )
      );
      return;
    }
    if (!agreedTerms) {
      toast.error(
        t(
          "Please agree to the terms.",
          "\u05D0\u05E0\u05D0 \u05D4\u05E1\u05DB\u05DD \u05DC\u05EA\u05E0\u05D0\u05D9\u05DD."
        )
      );
      return;
    }

    setIsSubmitting(true);
    try {
      for (const file of selectedFiles) {
        const base64 = await fileToBase64(file);
        await submitMutation.mutateAsync({
          metadata: {
            name: form.name,
            email: form.email,
            title: form.title,
            category: form.category,
            tourDate: form.tourDate || undefined,
          },
          filename: file.name,
          contentType: file.type,
          base64Data: base64,
        });
      }
      setSubmitted(true);
      toast.success(
        t(
          "Photos submitted successfully!",
          "\u05D4\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05E0\u05E9\u05DC\u05D7\u05D5 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4!"
        )
      );
    } catch (err: any) {
      const message =
        err?.message ||
        t(
          "Failed to upload photos.",
          "\u05D4\u05E2\u05DC\u05D0\u05EA \u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05E0\u05DB\u05E9\u05DC\u05D4."
        );
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="container py-12">
        <div className="max-w-2xl mx-auto text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8">
          <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">
            {t("Thank You!", "\u05EA\u05D5\u05D3\u05D4 \u05E8\u05D1\u05D4!")}
          </h3>
          <p className="text-green-700 dark:text-green-300">
            {t(
              "Your photos will be reviewed and added to our gallery.",
              "\u05D4\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05E9\u05DC\u05DA \u05D9\u05D9\u05D1\u05D3\u05E7\u05D5 \u05D5\u05D9\u05EA\u05D5\u05D5\u05E1\u05E4\u05D5 \u05DC\u05D2\u05DC\u05E8\u05D9\u05D4 \u05E9\u05DC\u05E0\u05D5."
            )}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Upload className="w-5 h-5 text-accent" />
            <span className="font-semibold">
              {t(
                "Share Your Photos",
                "\u05E9\u05EA\u05E4\u05D5 \u05D0\u05EA \u05D4\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05E9\u05DC\u05DB\u05DD"
              )}
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {isOpen && (
          <div className="mt-4 bg-card border border-border rounded-lg p-6 space-y-5">
            <p className="text-sm text-muted-foreground">
              {t(
                "Been on a WIRO 4x4 adventure? Share your best photos with us! Photos will be reviewed before appearing in the gallery.",
                "\u05D4\u05D9\u05D9\u05EA\u05DD \u05D1\u05D4\u05E8\u05E4\u05EA\u05E7\u05D4 \u05E2\u05DD WIRO 4x4? \u05E9\u05EA\u05E4\u05D5 \u05D0\u05D9\u05EA\u05E0\u05D5 \u05D0\u05EA \u05D4\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05D4\u05DB\u05D9 \u05D8\u05D5\u05D1\u05D5\u05EA \u05E9\u05DC\u05DB\u05DD! \u05D4\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05D9\u05D9\u05D1\u05D3\u05E7\u05D5 \u05DC\u05E4\u05E0\u05D9 \u05E4\u05E8\u05E1\u05D5\u05DD \u05D1\u05D2\u05DC\u05E8\u05D9\u05D4."
              )}
            </p>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Name", "\u05E9\u05DD")} *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                placeholder={t(
                  "Your name",
                  "\u05D4\u05E9\u05DD \u05E9\u05DC\u05DA"
                )}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Email", "\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC")} *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                placeholder="your@email.com"
              />
            </div>

            {/* Caption / Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Caption", "\u05DB\u05D9\u05EA\u05D5\u05D1")} *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                placeholder={t(
                  "Describe your photo",
                  "\u05EA\u05D0\u05E8 \u05D0\u05EA \u05D4\u05EA\u05DE\u05D5\u05E0\u05D4"
                )}
              />
            </div>

            {/* Tour Date (optional) */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t(
                  "Tour Date",
                  "\u05EA\u05D0\u05E8\u05D9\u05DA \u05D4\u05D8\u05D9\u05D5\u05DC"
                )}{" "}
                (
                {t(
                  "optional",
                  "\u05D0\u05D5\u05E4\u05E6\u05D9\u05D5\u05E0\u05DC\u05D9"
                )}
                )
              </label>
              <input
                type="date"
                value={form.tourDate}
                onChange={e =>
                  setForm(p => ({ ...p, tourDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Category", "\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4")}
              </label>
              <select
                value={form.category}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    category: e.target.value as UploadCategory,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
              >
                {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {isHebrew ? cat.he : cat.en}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Photos", "\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA")} * (
                {t(
                  `max ${MAX_FILES}`,
                  `\u05DE\u05E7\u05E1\u05D9\u05DE\u05D5\u05DD ${MAX_FILES}`
                )}
                )
              </label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Click to select photos",
                    "\u05DC\u05D7\u05E5 \u05DC\u05D1\u05D7\u05D9\u05E8\u05EA \u05EA\u05DE\u05D5\u05E0\u05D5\u05EA"
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WebP &middot;{" "}
                  {t(
                    "Max 10MB each",
                    "\u05DE\u05E7\u05E1 10MB \u05DC\u05EA\u05DE\u05D5\u05E0\u05D4"
                  )}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Preview thumbnails */}
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {previews.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${i + 1}`}
                        className="w-20 h-20 object-cover rounded border border-border"
                      />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={t(
                          "Remove photo",
                          "\u05D4\u05E1\u05E8 \u05EA\u05DE\u05D5\u05E0\u05D4"
                        )}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="photo-terms"
                checked={agreedTerms}
                onChange={e => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5"
              />
              <label
                htmlFor="photo-terms"
                className="text-sm text-muted-foreground"
              >
                {t(
                  "I agree that my photos can be used on the WIRO 4x4 website and social media.",
                  "\u05D0\u05E0\u05D9 \u05DE\u05E1\u05DB\u05D9\u05DD \u05E9\u05D4\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05E9\u05DC\u05D9 \u05D9\u05D5\u05DB\u05DC\u05D5 \u05DC\u05D4\u05D5\u05E4\u05D9\u05E2 \u05D1\u05D0\u05EA\u05E8 WIRO 4x4 \u05D5\u05D1\u05E8\u05E9\u05EA\u05D5\u05EA \u05D4\u05D7\u05D1\u05E8\u05EA\u05D9\u05D5\u05EA."
                )}
              </label>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting || selectedFiles.length === 0 || !agreedTerms
              }
              className="w-full px-4 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                  {t("Uploading...", "\u05DE\u05E2\u05DC\u05D4...")}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {t(
                    "Submit Photos",
                    "\u05E9\u05DC\u05D7 \u05EA\u05DE\u05D5\u05E0\u05D5\u05EA"
                  )}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
