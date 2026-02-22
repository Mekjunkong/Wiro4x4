import { useLanguage } from "@/contexts/LanguageContext";

export function SectionBanner() {
  const { t } = useLanguage();

  return (
    <section className="relative h-64 md:h-80 overflow-hidden">
      <img
        src="/images/1000000140.jpg"
        alt={t("4x4 adventure in Northern Thailand", "הרפתקת 4x4 בצפון תאילנד")}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h2
          className="text-3xl md:text-5xl lg:text-6xl font-light text-white text-center tracking-wide px-4"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {t("Experience the Road Less Traveled", "חוו את הדרך הפחות סלולה")}
        </h2>
      </div>
    </section>
  );
}
