import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GoldDivider } from "@/components/GoldDivider";
import { MapPin, ArrowRight } from "lucide-react";

const DESTINATIONS = [
  {
    id: "doi-inthanon",
    en: "Doi Inthanon",
    he: "דוי אינתנון",
    descEn:
      "Thailand's highest peak — cloud forests, hidden trails, and Karen village coffee",
    descHe:
      "הפסגה הגבוהה ביותר בתאילנד — יערות ענן, שבילים נסתרים וקפה בכפר קארן",
    image: "/images/optimized/VmAKaqoyTR8S.jpg",
    imageWebp: "/images/optimized/VmAKaqoyTR8S.webp",
    tourSlug: "doi-inthanon-roof-of-thailand",
  },
  {
    id: "mae-kampong",
    en: "Mae Kampong Village",
    he: "כפר מאה קמפונג",
    descEn:
      "A hidden 700-year-old eco-village with wild gibbons and ancient tea traditions",
    descHe: "כפר אקולוגי נסתר בן 700 שנה עם גיבונים בר ומסורות תה עתיקות",
    image: "/images/optimized/1000000149.jpg",
    imageWebp: "/images/optimized/1000000149.webp",
    tourSlug: "mae-kampong-hidden-village",
  },
  {
    id: "sticky-waterfalls",
    en: "Sticky Waterfalls",
    he: "מפלים דביקים",
    descEn:
      "Climb UP a waterfall barefoot, canopy walkway 20m high, and upper falls no one reaches",
    descHe:
      "טפסו למעלה על מפל יחפים, עברו על גשר צמרות בגובה 20 מ' וגלו קומות עליונות שאף אחד לא מגיע אליהן",
    image: "/images/optimized/1000000126_compressed.jpg",
    imageWebp: "/images/optimized/1000000126_compressed.webp",
    tourSlug: "maerim-sticky-waterfalls",
  },
  {
    id: "doi-suthep",
    en: "Doi Suthep — Beyond the Temple",
    he: "דוי סוטפ — מעבר למקדש",
    descEn:
      "Hike the Monk's Trail, then continue where tourists turn back — hidden coffee village and secluded falls",
    descHe:
      "טיילו בשביל הנזירים, ואז המשיכו הלאה, לשם שהתיירים כבר לא מגיעים — כפר קפה נסתר ומפלים מבודדים",
    image: "/images/optimized/UJvZx4ZA7cn3.jpg",
    imageWebp: "/images/optimized/UJvZx4ZA7cn3.webp",
    tourSlug: "doi-suthep-pui-beyond-temple",
  },
  {
    id: "mae-wang",
    en: "Mae Wang Jungle",
    he: "ג'ונגל מאה וואנג",
    descEn:
      "Real off-road through jungle — canyon, elephants, bamboo rafting, and hidden waterfalls",
    descHe: "שטח אמיתי דרך ג'ונגל — קניון, פילים, שייט במבוק ומפלים נסתרים",
    image: "/images/optimized/1000000140.jpg",
    imageWebp: "/images/optimized/1000000140.webp",
    tourSlug: "mae-wang-jungle-wilderness",
  },
  {
    id: "samoeng-loop",
    en: "Samoeng Mountain Loop",
    he: "לולאת הרי סמאנג",
    descEn:
      "100km mountain circuit — rare Lanna temple, hilltop farm, Hmong village, lakeside sunset",
    descHe:
      'מעגל הרים של 100 ק"מ — מקדש לאנה נדיר, חווה על פסגת הר, כפר המונג, שקיעה על האגם',
    image: "/images/optimized/1000000143.jpg",
    imageWebp: "/images/optimized/1000000143.webp",
    tourSlug: "samoeng-loop-mountain-circuit",
  },
];

export function DestinationShowcase() {
  const { t } = useLanguage();
  const gridRef = useScrollReveal<HTMLDivElement>({ stagger: 0.15 });

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-4">
            {t("Explore Northern Thailand", "גלו את צפון תאילנד")}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            {t(
              "From misty mountain peaks to lush jungle valleys — discover the best of Chiang Mai and beyond",
              "מפסגות הרים ערפיליות ועד עמקי ג'ונגל ירוקים — גלו את המיטב של צ'יאנג מאי והסביבה"
            )}
          </p>
          <GoldDivider />
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0"
        >
          {DESTINATIONS.map(dest => (
            <a
              key={dest.id}
              href={`/tours/${dest.tourSlug}`}
              className="group relative rounded-sm overflow-hidden h-64 md:h-72 block"
            >
              <picture>
                <source srcSet={dest.imageWebp} type="image/webp" />
                <img
                  src={dest.image}
                  alt={t(dest.en, dest.he)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </picture>
              {/* Permanent gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {/* Gold tint overlay on hover */}
              <div className="absolute inset-0 bg-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {t("Chiang Mai Region", "אזור צ'יאנג מאי")}
                </div>
                <h3 className="text-white uppercase tracking-[0.2em] text-sm font-medium mb-1 group-hover:-translate-y-1 transition-transform duration-300">
                  {t(dest.en, dest.he)}
                </h3>
                <p className="text-sm text-white/80 line-clamp-2">
                  {t(dest.descEn, dest.descHe)}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-[#D4AF37] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
