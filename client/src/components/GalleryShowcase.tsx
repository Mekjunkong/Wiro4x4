import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Camera, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GoldDivider } from "@/components/GoldDivider";

const FALLBACK_IMAGES = [
  { src: "/images/optimized/hero-wiro.jpg", caption: "Chiang Mai Adventure" },
  {
    src: "/images/optimized/accessible_doi_inthanon_summit.jpg",
    caption: "Doi Inthanon Summit",
  },
  {
    src: "/images/optimized/mae-kampong-village.jpg",
    caption: "Mae Kampong Village",
  },
  {
    src: "/images/optimized/sticky_waterfalls.jpg",
    caption: "Sticky Waterfalls",
  },
  {
    src: "/images/optimized/doi_suthep_temple.jpg",
    caption: "Doi Suthep Temple",
  },
  {
    src: "/images/optimized/mae_wang_elephants.jpg",
    caption: "Mae Wang Jungle",
  },
];

export function GalleryShowcase() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });
  const { data: photos } = trpc.gallery.list.useQuery();

  const images =
    photos && photos.length >= 6
      ? photos.slice(0, 8).map(p => ({
          src: p.s3Url || FALLBACK_IMAGES[0].src,
          caption: p.title || "",
        }))
      : FALLBACK_IMAGES;

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 px-4">
          <Camera className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
            {t("Adventure Gallery", "גלריית הרפתקאות")}
          </h2>
          <GoldDivider />
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 px-4 md:px-0">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg group break-inside-avoid"
            >
              <img
                src={img.src}
                alt={img.caption}
                loading="lazy"
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
            className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#c5a033] font-semibold text-lg transition-colors"
          >
            {t("See Full Gallery", "לגלריה המלאה")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
