import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Camera, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GoldDivider } from "@/components/GoldDivider";
import { OptimizedImage } from "@/components/OptimizedImage";

const LOCAL_GALLERY_IMAGES = [
  { src: "mountain_sunset_golden", caption: "Mountain Sunset" },
  { src: "elephant_bathing", caption: "Elephant Encounter" },
  { src: "doi_suthep_golden_chedi", caption: "Doi Suthep Temple" },
  { src: "offroad_trail_driving", caption: "4x4 Off-Road Adventure" },
  { src: "jungle_waterfall_cascade_rocks", caption: "Jungle Waterfall" },
  { src: "sticky_waterfalls", caption: "Sticky Waterfalls" },
  { src: "hilltribe_community_visit", caption: "Hilltribe Village" },
  { src: "golden_triangle_mekong", caption: "Golden Triangle" },
  { src: "bamboo_rafting_adventure", caption: "Bamboo Rafting" },
  { src: "4x4_water_splash", caption: "4x4 Water Crossing" },
  { src: "mae_salong_tea_plantation", caption: "Tea Plantation" },
  { src: "doi_inthanon_royal_pagoda", caption: "Doi Inthanon Pagodas" },
];

export function GalleryShowcase() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });
  // Always use local images — DB gallery photos may have broken/unwanted S3 URLs
  const images = LOCAL_GALLERY_IMAGES;

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 px-4">
          <Camera className="w-8 h-8 text-accent mx-auto mb-3" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
            {t("Adventure Gallery", "גלריית הרפתקאות")}
          </h2>
          <GoldDivider />
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 px-4 md:px-0">
          {images.map(img => (
            <div
              key={img.src}
              className="relative overflow-hidden rounded-lg group break-inside-avoid"
            >
              <OptimizedImage
                src={img.src}
                alt={img.caption}
                width={800}
                height={600}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-sm font-medium">
                  {img.caption}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-cta-hover font-semibold text-lg transition-colors"
          >
            {t("See Full Gallery", "לגלריה המלאה")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
