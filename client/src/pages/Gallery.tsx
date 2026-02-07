import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

const CATEGORIES = [
  { id: 'all', en: 'All', he: 'הכל' },
  { id: 'tours', en: 'Tours', he: 'סיורים' },
  { id: 'vehicles', en: 'Vehicles', he: 'רכבים' },
  { id: 'destinations', en: 'Destinations', he: 'יעדים' },
  { id: 'activities', en: 'Activities', he: 'פעילויות' },
  { id: 'food', en: 'Food', he: 'אוכל' },
  { id: 'accommodation', en: 'Accommodation', he: 'לינה' },
  { id: 'other', en: 'Other', he: 'אחר' },
];

export default function Gallery() {
  const { t, language } = useLanguage();
  const isHebrew = language === 'he';
  usePageMeta('Photo Gallery', 'Explore adventure photos from WIRO 4x4 kosher off-road tours in Chiang Mai, Northern Thailand.');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: photos, isLoading } = trpc.gallery.list.useQuery();

  const filteredPhotos = photos?.filter(
    (photo) => selectedCategory === 'all' || photo.category === selectedCategory
  ) || [];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goToPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : filteredPhotos.length - 1);
  }, [lightboxIndex, filteredPhotos.length]);

  const goToNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex < filteredPhotos.length - 1 ? lightboxIndex + 1 : 0);
  }, [lightboxIndex, filteredPhotos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, goToPrev, goToNext]);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary to-primary/80 py-16 md:py-20 text-center text-white mt-20">
        <div className="container">
          <Camera className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3 md:mb-4">
            {t('Photo Gallery', 'גלריית תמונות')}
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            {t(
              'Explore our adventures through Northern Thailand - from mountain trails to hidden waterfalls',
              'גלו את ההרפתקאות שלנו בצפון תאילנד - משבילי הרים ועד מפלים נסתרים'
            )}
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {isHebrew ? cat.he : cat.en}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
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
              {t('No photos yet', 'אין תמונות עדיין')}
            </h3>
            <p className="text-muted-foreground">
              {t('Check back soon for amazing adventure photos!', 'חזרו בקרוב לתמונות הרפתקאות מדהימות!')}
            </p>
          </div>
        )}

        {/* Photo Grid */}
        {!isLoading && filteredPhotos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-card"
                onClick={() => openLightbox(index)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-white font-semibold text-lg">{photo.title}</h3>
                  {photo.category && (
                    <Badge variant="secondary" className="mt-1">
                      {CATEGORIES.find(c => c.id === photo.category)?.[isHebrew ? 'he' : 'en'] || photo.category}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] sm:max-w-[90vw] p-0 bg-black/95 border-none">
          {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
            <div className="relative flex flex-col items-center justify-center min-h-[60vh]">
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {filteredPhotos.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}

              <img
                src={filteredPhotos[lightboxIndex].imageUrl}
                alt={filteredPhotos[lightboxIndex].title}
                className="max-w-full max-h-[80vh] object-contain"
              />

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                <h3 className="text-xl font-semibold">{filteredPhotos[lightboxIndex].title}</h3>
                {filteredPhotos[lightboxIndex].description && (
                  <p className="text-white/80 mt-1">{filteredPhotos[lightboxIndex].description}</p>
                )}
                <p className="text-white/50 text-sm mt-2">
                  {lightboxIndex + 1} / {filteredPhotos.length}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
