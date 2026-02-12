import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, ArrowRight } from "lucide-react";

const DESTINATIONS = [
  {
    id: "waterfalls",
    en: "Sticky Waterfalls",
    he: "מפלים דביקים",
    descEn:
      "Climb natural limestone waterfalls barefoot — a unique Chiang Mai experience",
    descHe: "טפסו על מפלי אבן גיר יחפים — חוויה ייחודית בצ'יאנג מאי",
    image: "/images/1000000126_compressed.jpg",
    tourSlug: "waterfall-adventure-tour",
  },
  {
    id: "doi-inthanon",
    en: "Doi Inthanon",
    he: "דוי אינתנון",
    descEn: "Thailand's highest peak with misty trails and royal pagodas",
    descHe: "הפסגה הגבוהה בתאילנד עם שבילים ערפיליים ופגודות מלכותיות",
    image: "/images/vietnam_rice_terraces.jpg",
    tourSlug: "mountain-valley-explorer",
  },
  {
    id: "jungle",
    en: "Northern Jungle",
    he: "הג'ונגל הצפוני",
    descEn:
      "Dense tropical forests with river crossings and hidden swimming holes",
    descHe: "יערות טרופיים צפופים עם חציית נהרות ובריכות שחייה נסתרות",
    image: "/images/laos_jungle.jpg",
    tourSlug: "jungle-river-expedition",
  },
  {
    id: "rice-fields",
    en: "Rice Terraces",
    he: "טרסות האורז",
    descEn: "Stunning layered rice paddies and traditional farming villages",
    descHe: "טרסות אורז מרהיבות וכפרי חקלאות מסורתיים",
    image: "/images/1000000149.jpg",
    tourSlug: "rice-fields-culture-tour",
  },
  {
    id: "elephants",
    en: "Elephant Sanctuary",
    he: "מקלט הפילים",
    descEn: "Ethical elephant encounters in their natural forest habitat",
    descHe: "מפגש אתי עם פילים בסביבתם הטבעית ביער",
    image: "/images/1000000140.jpg",
    tourSlug: "elephant-sanctuary-visit",
  },
  {
    id: "hill-tribes",
    en: "Hill Tribe Villages",
    he: "כפרי שבטי ההרים",
    descEn: "Visit authentic mountain communities and learn ancient traditions",
    descHe: "בקרו בקהילות הרים אותנטיות והכירו מסורות עתיקות",
    image: "/images/1000000135.jpg",
    tourSlug: "hill-tribe-cultural-journey",
  },
];

export function DestinationShowcase() {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("Explore Northern Thailand", "גלו את צפון תאילנד")}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            {t(
              "From misty mountain peaks to lush jungle valleys — discover the best of Chiang Mai and beyond",
              "מפסגות הרים ערפיליות ועד עמקי ג'ונגל ירוקים — גלו את המיטב של צ'יאנג מאי והסביבה"
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 px-4 md:px-0">
          {DESTINATIONS.map(dest => (
            <a
              key={dest.id}
              href={`/tours/${dest.tourSlug}`}
              className="group relative rounded-xl overflow-hidden h-64 md:h-72 block"
            >
              <img
                src={dest.image}
                alt={t(dest.en, dest.he)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {t("Chiang Mai Region", "אזור צ'יאנג מאי")}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {t(dest.en, dest.he)}
                </h3>
                <p className="text-sm text-white/80 line-clamp-2">
                  {t(dest.descEn, dest.descHe)}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-secondary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {t("Explore Tour", "לפרטי הטיול")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
