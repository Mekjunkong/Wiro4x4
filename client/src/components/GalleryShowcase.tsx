import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { OptimizedImage } from "@/components/OptimizedImage";
import { PremiumSectionHeading } from "@/components/PremiumSectionHeading";

const LOCAL_GALLERY_IMAGES = [
  {
    src: "wiro_4x4_river_splash",
    caption: "4x4 River Crossing",
    captionHe: "חציית נהר ברכב 4x4",
  },
  {
    src: "elephant_bathing",
    caption: "Elephant Encounter",
    captionHe: "מפגש עם פילים",
  },
  {
    src: "sticky_waterfalls",
    caption: "Sticky Waterfalls",
    captionHe: "המפלים הדביקים",
  },
  {
    src: "mountain_sunset_golden",
    caption: "Mountain Sunset",
    captionHe: "שקיעה בהרים",
  },
  {
    src: "jungle_waterfall_cascade_rocks",
    caption: "Jungle Waterfall",
    captionHe: "מפל בג'ונגל",
  },
  {
    src: "hilltribe_girl_craft_market",
    caption: "Hilltribe Market",
    captionHe: "שוק שבטי ההרים",
  },
  {
    src: "atv_group_mountain_hilltop",
    caption: "Mountain Summit",
    captionHe: "פסגת ההר",
  },
  {
    src: "bamboo_rafting",
    caption: "Bamboo Rafting",
    captionHe: "שייט רפסודות במבוק",
  },
  {
    src: "wiro_crew_team",
    caption: "The Wiro Team",
    captionHe: "צוות WIRO",
  },
  {
    src: "tourists_river_crossing",
    caption: "River Adventure",
    captionHe: "הרפתקת נהר",
  },
  {
    src: "twin_falls_forest_view",
    caption: "Twin Waterfalls",
    captionHe: "מפלי התאומים",
  },
  {
    src: "doi_inthanon_waterfall",
    caption: "Doi Inthanon Waterfall",
    captionHe: "מפל דוי אינתנון",
  },
];

export function GalleryShowcase() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });
  // Keep the homepage edit selective. The complete collection remains on /gallery.
  const images = LOCAL_GALLERY_IMAGES.slice(0, 7);

  return (
    <section ref={sectionRef} className="bg-muted/45 py-20 md:py-28">
      <div className="container">
        <div className="max-w-3xl mx-auto mb-10 md:mb-14 px-4">
          <PremiumSectionHeading
            eyebrow={t("From the trail", "מהשטח")}
            heading={t("A glimpse of the journey", "הצצה למסע")}
            description={t(
              "Mountain tracks, river crossings, and the people who make northern Thailand memorable.",
              "שבילי הרים, חציות נהר והאנשים שהופכים את צפון תאילנד לבלתי נשכח."
            )}
          />
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 px-4 md:px-0">
          {images.map(img => (
            <div
              key={img.src}
              className="group relative break-inside-avoid overflow-hidden rounded-sm"
            >
              <OptimizedImage
                src={img.src}
                alt={t(img.caption, img.captionHe)}
                width={800}
                height={600}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                <span className="text-white text-sm font-medium">
                  {t(img.caption, img.captionHe)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-base font-semibold text-accent-readable transition-colors hover:text-accent-cta-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
          >
            {t("See Full Gallery", "לגלריה המלאה")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
