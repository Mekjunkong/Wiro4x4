import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GoldDivider } from "@/components/GoldDivider";
import { Breadcrumb } from "@/components/Breadcrumb";
import { OptimizedImage } from "@/components/OptimizedImage";

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

const PAGE_SIZE = 20;

export default function Gallery() {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";
  usePageMeta(
    "Photo Gallery",
    "Explore adventure photos from WIRO 4x4 kosher off-road tours in Chiang Mai, Northern Thailand."
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  // Combine pages
  const allPhotos = useMemo(() => {
    const base = firstPage?.items || [];
    return [...base, ...extraPhotos];
  }, [firstPage, extraPhotos]);

  // Deduplicate photos by imageUrl (keep first occurrence) and exclude broken
  const filteredPhotos = useMemo(() => {
    const seen = new Set<string>();
    return allPhotos.filter(photo => {
      if (brokenIds.has(photo.id)) return false;
      const url = photo.imageUrl || "";
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [allPhotos, brokenIds]);

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
        if (entry.isIntersecting) loadMore();
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
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#1C1C1C] to-[#1C1C1C]/80 py-16 md:py-20 text-center text-white mt-20">
          <div className="container">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl md:text-5xl font-serif font-medium mb-3 md:mb-4">
              {t(
                "Photo Gallery",
                "\u05D2\u05DC\u05E8\u05D9\u05D9\u05EA \u05EA\u05DE\u05D5\u05E0\u05D5\u05EA"
              )}
            </h1>
            <GoldDivider />
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              {t(
                "Explore our adventures through Northern Thailand - from mountain trails to hidden waterfalls",
                "\u05D2\u05DC\u05D5 \u05D0\u05EA \u05D4\u05D4\u05E8\u05E4\u05EA\u05E7\u05D0\u05D5\u05EA \u05E9\u05DC\u05E0\u05D5 \u05D1\u05E6\u05E4\u05D5\u05DF \u05EA\u05D0\u05D9\u05DC\u05E0\u05D3 - \u05DE\u05E9\u05D1\u05D9\u05DC\u05D9 \u05D4\u05E8\u05D9\u05DD \u05D5\u05E2\u05D3 \u05DE\u05E4\u05DC\u05D9\u05DD \u05E0\u05E1\u05EA\u05E8\u05D9\u05DD"
              )}
            </p>
          </div>
        </section>

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
                      ? "bg-[#D4AF37] text-[#1C1C1C] border-[#D4AF37]"
                      : "border border-[#D4AF37]/50 text-[#D4AF37]"
                  } rounded-sm px-4 py-1.5 text-xs tracking-[0.15em] uppercase`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {isHebrew ? cat.he : cat.en}
                  {showCount && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-sm text-xs font-medium ml-1.5 ${
                        isActive
                          ? "bg-foreground/20 text-foreground"
                          : "bg-[#D4AF37]/10 text-[#D4AF37]"
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
                    <div className="absolute inset-0 bg-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                  <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lightbox Dialog */}
        <Dialog
          open={lightboxIndex !== null}
          onOpenChange={open => !open && closeLightbox()}
        >
          <DialogContent className="max-w-[95vw] max-h-[95vh] sm:max-w-[90vw] p-0 bg-black/95 border-none">
            {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
              <div
                className="relative flex flex-col items-center justify-center min-h-[60vh]"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
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
