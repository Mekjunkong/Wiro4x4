import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trpc } from "@/lib/trpc";
import { WaCta } from "@/components/wiro/WaCta";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TourCard } from "@/components/wiro/TourCard";
import { getWiroTours } from "@/data/wiroTours";
import { tourPath } from "@shared/tourPaths";

type Diff = "all" | "easy" | "moderate" | "challenging";
type Dur = "all" | "half" | "full";

const DIFFS: readonly [Diff, string, string][] = [
  ["all", "All", "הכל"],
  ["easy", "Easy", "קל"],
  ["moderate", "Moderate", "בינוני"],
  ["challenging", "Challenging", "מאתגר"],
];
const DURS: readonly [Dur, string, string][] = [
  ["all", "All durations", "כל הזמנים"],
  ["half", "Shorter day (5-7h)", "יום קצר (5-7 שעות)"],
  ["full", "Long day (7-9h)", "יום ארוך (7-9 שעות)"],
];

export default function ToursListing() {
  const { t, language } = useLanguage();
  const [diff, setDiff] = useState<Diff>("all");
  const [dur, setDur] = useState<Dur>("all");
  const { data: dbTours } = trpc.tour.list.useQuery();

  usePageMeta({
    title: t("Chiang Mai 4x4 Tours", "טיולי 4x4 בצ'יאנג מאי"),
    description: t(
      "Choose from 6 unique off-road day tours in Chiang Mai. Doi Inthanon, Mae Kampong, Sticky Waterfalls, Doi Suthep, Mae Wang, and Samoeng Loop.",
      "בחרו מ-6 טיולי שטח ייחודיים ביום אחד בצ'יאנג מאי. דוי אינטנון, מאה קמפונג, מפלים דביקים, דוי סוטפ, מאה וואנג ולולאת סמואנג."
    ),
    canonicalPath: "/tours",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "https://www.wiro4x4indochina.com/tours#webpage",
      url: "https://www.wiro4x4indochina.com/tours",
      name: "Chiang Mai 4x4 Tours",
      description:
        "Private 4x4 day tours from Chiang Mai to mountain, jungle, waterfall, and village destinations across Northern Thailand.",
      isPartOf: { "@id": "https://www.wiro4x4indochina.com/#website" },
      about: { "@id": "https://www.wiro4x4indochina.com/#organization" },
      inLanguage: ["en", "he"],
    },
  });

  const tours = useMemo(
    () =>
      getWiroTours(
        (dbTours ?? []).map(r => ({
          slug: r.slug,
          price: r.price,
          duration: r.duration,
          difficulty: r.difficulty,
        }))
      ),
    [dbTours]
  );
  const filtered = tours.filter(
    x =>
      (diff === "all" || x.difficulty === diff) &&
      (dur === "all" || (dur === "half" ? x.hours <= 6 : x.hours > 6))
  );

  return (
    <div className="wx" style={{ minHeight: "100vh" }}>
      <Header />
      <main id="main-content">
        <section className="wx-pagehead">
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <Breadcrumb items={[{ label: t("One-Day Tours", "טיולי יום") }]} />
            <p
              className="wx-caps"
              style={{ color: "var(--wx-gold-ink)", margin: "12px 0 0" }}
            >
              {t("Six routes from Chiang Mai", "שישה מסלולים מצ'יאנג מאי")}
            </p>
            <h1>{t("Chiang Mai 4x4 Tours", "טיולי 4x4 בצ'יאנג מאי")}</h1>
            <p className="wx-lede" style={{ margin: "18px 0 0" }}>
              {t(
                "Every day is private: your group, your vehicle and your guide, with kosher-friendly meal planning on all of them. Start with the high mountains of ",
                "כל יום הוא פרטי: הקבוצה שלכם, הרכב שלכם והמדריך שלכם, עם תכנון ארוחות ידידותי לכשרות בכולם. התחילו בהרים הגבוהים של "
              )}
              <Link
                href={tourPath("doi-inthanon-roof-of-thailand", language)}
                className="wx-inline-link"
              >
                {t("Doi Inthanon", "דוי אינתנון")}
              </Link>
              {t(
                " or compare them with the jungle and rivers of ",
                " או השוו אותם לג'ונגל ולנהרות של "
              )}
              <Link
                href={tourPath("mae-wang-jungle-wilderness", language)}
                className="wx-inline-link"
              >
                {t("Mae Wang", "מאה וואנג")}
              </Link>
              .
            </p>
            <div
              role="group"
              aria-label={t("Filter tours", "סינון טיולים")}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 32,
                alignItems: "center",
              }}
            >
              {DIFFS.map(([k, en, he]) => (
                <button
                  key={k}
                  type="button"
                  className={`wx-filter ${diff === k ? "is-on" : ""}`}
                  aria-pressed={diff === k}
                  onClick={() => setDiff(k)}
                >
                  {t(en, he)}
                </button>
              ))}
              <span
                style={{
                  width: 1,
                  height: 28,
                  background: "var(--wx-line)",
                  margin: "0 6px",
                }}
              />
              {DURS.map(([k, en, he]) => (
                <button
                  key={k}
                  type="button"
                  className={`wx-filter ${dur === k ? "is-on" : ""}`}
                  aria-pressed={dur === k}
                  onClick={() => setDur(k)}
                >
                  {t(en, he)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          id="tours"
          style={{
            padding:
              "clamp(40px,6vw,72px) clamp(16px,3vw,32px) clamp(80px,10vw,128px)",
          }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            {filtered.length ? (
              <div className="wx-cards">
                {filtered.map(tour => (
                  <TourCard key={tour.slug} tour={tour} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "64px 0",
                  color: "var(--wx-muted)",
                }}
              >
                <p style={{ margin: 0 }}>
                  {t(
                    "No tours match the selected filters.",
                    "לא נמצאו טיולים התואמים לסינון שנבחר."
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDiff("all");
                    setDur("all");
                  }}
                  style={{
                    marginTop: 12,
                    background: "none",
                    border: 0,
                    color: "var(--wx-gold-ink)",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: 15,
                    minHeight: 44,
                  }}
                >
                  {t("Clear filters", "נקה סינונים")}
                </button>
              </div>
            )}
            <div className="wx-listend">
              <div>
                <h2 className="wx-listend__title">
                  {t("Not sure which day fits?", "לא בטוחים איזה יום מתאים?")}
                </h2>
                <p className="wx-listend__text">
                  {t(
                    "Send your dates, group size and pickup area. We reply with the route that suits your group.",
                    "שלחו תאריכים, מספר מטיילים ואזור איסוף, ונחזור אליכם עם המסלול שמתאים לכם."
                  )}
                </p>
              </div>
              <div className="wx-listend__actions">
                <WaCta source="TOURS-LIST">
                  {t("Ask on WhatsApp", "שאלו בוואטסאפ")}
                </WaCta>
                <Link href="/packages" className="wx-inline-link">
                  {t(
                    "Planning several days? See packages",
                    "מתכננים כמה ימים? לחבילות"
                  )}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
