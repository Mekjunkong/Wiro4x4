import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Share2,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function TripAlbum() {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";
  const { t, language } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  usePageMeta({
    title: "Your Trip Photos",
    description:
      "View and download your private adventure photos from WIRO 4x4.",
  });

  const {
    data: album,
    isLoading,
    error,
  } = trpc.tripPhotos.getAlbum.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const photos = album?.photos ?? [];

  // Lightbox navigation
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goToPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : photos.length - 1);
  }, [lightboxIndex, photos.length]);

  const goToNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex < photos.length - 1 ? lightboxIndex + 1 : 0);
  }, [lightboxIndex, photos.length]);

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

  // Touch swipe
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
        closeLightbox();
      } else if (absDeltaX > absDeltaY && absDeltaX > SWIPE_THRESHOLD) {
        if (deltaX < 0) goToNext();
        else goToPrev();
      }
      swipeRef.current = null;
    },
    [closeLightbox, goToNext, goToPrev]
  );

  // Download a single photo
  const downloadPhoto = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `wiro4x4-photo-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  // Share on WhatsApp
  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = `Check out my adventure photos from WIRO 4x4! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Error state
  if (error) {
    const isExpired =
      error.message?.includes("expired") || error.data?.code === "FORBIDDEN";
    const isNotFound = error.data?.code === "NOT_FOUND";

    return (
      <div className="min-h-screen">
        <Header />
        <main
          id="main-content"
          className="mt-20 flex items-center justify-center min-h-[60vh]"
        >
          <div className="text-center px-4 max-w-md">
            {isExpired ? (
              <>
                <Clock className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                <h1 className="text-2xl font-bold mb-2">
                  {t(
                    "Album Expired",
                    "\u05D0\u05DC\u05D1\u05D5\u05DD \u05E4\u05D2 \u05EA\u05D5\u05E7\u05E3"
                  )}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "This photo album is no longer available. Please contact us if you need access to your photos.",
                    "\u05D0\u05DC\u05D1\u05D5\u05DD \u05D4\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05D4\u05D6\u05D4 \u05DC\u05D0 \u05D6\u05DE\u05D9\u05DF \u05D9\u05D5\u05EA\u05E8. \u05E6\u05D5\u05E8 \u05D0\u05D9\u05EA\u05E0\u05D5 \u05E7\u05E9\u05E8 \u05D0\u05DD \u05D0\u05EA\u05D4 \u05E6\u05E8\u05D9\u05DA \u05D2\u05D9\u05E9\u05D4."
                  )}
                </p>
              </>
            ) : isNotFound ? (
              <>
                <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-2xl font-bold mb-2">
                  {t(
                    "Album Not Found",
                    "\u05D0\u05DC\u05D1\u05D5\u05DD \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0"
                  )}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "We couldn't find this photo album. Please check the link and try again.",
                    "\u05DC\u05D0 \u05DE\u05E6\u05D0\u05E0\u05D5 \u05D0\u05EA \u05D0\u05DC\u05D1\u05D5\u05DD \u05D4\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05D4\u05D6\u05D4. \u05D0\u05E0\u05D0 \u05D1\u05D3\u05D5\u05E7 \u05D0\u05EA \u05D4\u05E7\u05D9\u05E9\u05D5\u05E8 \u05D5\u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1."
                  )}
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h1 className="text-2xl font-bold mb-2">
                  {t(
                    "Something went wrong",
                    "\u05DE\u05E9\u05D4\u05D5 \u05D4\u05E9\u05EA\u05D1\u05E9"
                  )}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "Unable to load the photo album. Please try again later.",
                    "\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05D8\u05E2\u05D5\u05DF \u05D0\u05EA \u05D0\u05DC\u05D1\u05D5\u05DD \u05D4\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA. \u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1 \u05DE\u05D0\u05D5\u05D7\u05E8 \u05D9\u05D5\u05EA\u05E8."
                  )}
                </p>
              </>
            )}
            <TrackedWhatsAppLink
              sourceCode={language === "he" ? "TRIP-ALBUM-HE" : "TRIP-ALBUM-EN"}
              humanMessage=""
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              {t(
                "Contact Us on WhatsApp",
                "\u05E6\u05D5\u05E8 \u05E7\u05E9\u05E8 \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4"
              )}
            </TrackedWhatsAppLink>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main
          id="main-content"
          className="mt-20 flex items-center justify-center min-h-[60vh]"
        >
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {t(
                "Loading your photos...",
                "\u05D8\u05D5\u05E2\u05DF \u05EA\u05DE\u05D5\u05E0\u05D5\u05EA..."
              )}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!album) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        {/* Hero Banner */}
        <section className="relative mt-20 bg-gradient-to-b from-primary/95 to-primary text-white py-16 md:py-24">
          <div className="container text-center">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl md:text-5xl font-serif font-medium mb-3">
              {album.title}
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-2">
              {t(
                `Welcome back, ${album.customerName}!`,
                `!${album.customerName} ,\u05D1\u05E8\u05D5\u05DA \u05D4\u05E9\u05D1`
              )}
            </p>
            <p className="text-sm opacity-75">
              {photos.length}{" "}
              {t("photos", "\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA")}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={shareOnWhatsApp}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
              >
                <Share2 className="w-4 h-4" />
                {t(
                  "Share on WhatsApp",
                  "\u05E9\u05EA\u05E3 \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4"
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Personal Message */}
        {album.message && (
          <div className="container max-w-2xl py-8">
            <div className="bg-card border rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2 italic">
                {t(
                  "A note from your guide",
                  "\u05D4\u05D5\u05D3\u05E2\u05D4 \u05DE\u05D4\u05DE\u05D3\u05E8\u05D9\u05DA"
                )}
              </p>
              <p className="text-foreground leading-relaxed">{album.message}</p>
            </div>
          </div>
        )}

        {/* Photo Grid */}
        <div className="container py-8 md:py-12">
          {photos.length === 0 ? (
            <div className="text-center py-16">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-muted-foreground">
                {t(
                  "Photos are being prepared",
                  "\u05D4\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05D1\u05D4\u05DB\u05E0\u05D4"
                )}
              </h3>
              <p className="text-muted-foreground mt-2">
                {t(
                  "Check back soon - your adventure photos are on their way!",
                  "\u05D7\u05D6\u05E8\u05D5 \u05D1\u05E7\u05E8\u05D5\u05D1 - \u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05D4\u05D4\u05E8\u05E4\u05EA\u05E7\u05D0\u05D4 \u05E9\u05DC\u05DB\u05DD \u05D1\u05D3\u05E8\u05DA!"
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-card"
                >
                  <div
                    className="aspect-[4/3] overflow-hidden bg-muted"
                    onClick={() => setLightboxIndex(index)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLightboxIndex(index);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${t("View photo", "\u05E6\u05E4\u05D4 \u05D1\u05EA\u05DE\u05D5\u05E0\u05D4")} ${index + 1}`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading={index < 6 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
                  </div>

                  {/* Caption & Download */}
                  <div className="p-3 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate flex-1">
                      {photo.caption ||
                        `${t("Photo", "\u05EA\u05DE\u05D5\u05E0\u05D4")} ${index + 1}`}
                    </p>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        void downloadPhoto(photo.url, index);
                      }}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted"
                      aria-label={t(
                        "Download photo",
                        "\u05D4\u05D5\u05E8\u05D3 \u05EA\u05DE\u05D5\u05E0\u05D4"
                      )}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Thank You Banner */}
        <section className="bg-primary/5 py-12 text-center">
          <div className="container max-w-lg">
            <h2 className="text-2xl font-serif font-medium mb-3">
              {t(
                "Thank you for adventuring with us!",
                "\u05EA\u05D5\u05D3\u05D4 \u05E9\u05D4\u05E8\u05E4\u05EA\u05E7\u05EA\u05DD \u05D0\u05D9\u05EA\u05E0\u05D5!"
              )}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t(
                "We hope these photos bring back wonderful memories. See you on your next adventure!",
                "\u05D0\u05E0\u05D5 \u05DE\u05E7\u05D5\u05D5\u05D9\u05DD \u05E9\u05D4\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05D9\u05D7\u05D6\u05D9\u05E8\u05D5 \u05DC\u05DB\u05DD \u05D6\u05DB\u05E8\u05D5\u05E0\u05D5\u05EA \u05E0\u05E4\u05DC\u05D0\u05D9\u05DD. \u05E0\u05EA\u05E8\u05D0\u05D4 \u05D1\u05D4\u05E8\u05E4\u05EA\u05E7\u05D4 \u05D4\u05D1\u05D0\u05D4!"
              )}
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                {t(
                  "Explore More Tours",
                  "\u05D2\u05DC\u05D5 \u05E2\u05D5\u05D3 \u05D8\u05D9\u05D5\u05DC\u05D9\u05DD"
                )}
              </a>
              <TrackedWhatsAppLink
                sourceCode={
                  language === "he" ? "TRIP-ALBUM-HE" : "TRIP-ALBUM-EN"
                }
                humanMessage=""
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </TrackedWhatsAppLink>
            </div>
          </div>
        </section>

        {/* Lightbox */}
        <Dialog
          open={lightboxIndex !== null}
          onOpenChange={open => !open && closeLightbox()}
        >
          <DialogContent
            className="max-w-[95vw] max-h-[95vh] sm:max-w-[90vw] p-0 bg-primary/95 border-none"
            aria-label={t(
              "Photo lightbox viewer",
              "\u05EA\u05E6\u05D5\u05D2\u05EA \u05EA\u05DE\u05D5\u05E0\u05D4 \u05DE\u05D5\u05D2\u05D3\u05DC\u05EA"
            )}
          >
            {lightboxIndex !== null && photos[lightboxIndex] && (
              <div
                className="relative flex flex-col items-center justify-center min-h-[60vh]"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2 rounded-full bg-primary/40 hover:bg-primary/60 transition-colors"
                  aria-label={t("Close", "\u05E1\u05D2\u05D5\u05E8")}
                >
                  <X className="w-6 h-6" />
                </button>

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        goToPrev();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-3 md:p-2 rounded-full bg-primary/40 hover:bg-primary/60 transition-colors touch-manipulation"
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-3 md:p-2 rounded-full bg-primary/40 hover:bg-primary/60 transition-colors touch-manipulation"
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
                  src={photos[lightboxIndex].url}
                  alt={
                    photos[lightboxIndex].caption ||
                    `Photo ${lightboxIndex + 1}`
                  }
                  className="max-w-full max-h-[80vh] object-contain select-none"
                  draggable={false}
                />

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-primary/80 to-transparent text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      {photos[lightboxIndex].caption && (
                        <h3 className="text-lg font-semibold">
                          {photos[lightboxIndex].caption}
                        </h3>
                      )}
                      <p className="text-white/50 text-sm mt-1">
                        {lightboxIndex + 1} / {photos.length}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        downloadPhoto(
                          photos[lightboxIndex!].url,
                          lightboxIndex!
                        )
                      }
                      className="p-3 text-white/80 hover:text-white bg-primary/40 hover:bg-primary/60 rounded-full transition-colors"
                      aria-label={t(
                        "Download photo",
                        "\u05D4\u05D5\u05E8\u05D3 \u05EA\u05DE\u05D5\u05E0\u05D4"
                      )}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
