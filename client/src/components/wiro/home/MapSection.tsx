import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { getWiroTourStory, type MapPlaceKey } from "@/data/wiroTours";
import { WiroMap } from "../WiroMap";
import { ArrowIcon, ClockIcon } from "../icons";
import { tourPath } from "@shared/tourPaths";

type Bi = readonly [string, string];
const PLACES: readonly {
  k: MapPlaceKey;
  slug: string;
  name: Bi;
  line: Bi;
  drive: Bi;
}[] = [
  {
    k: "inthanon",
    slug: "doi-inthanon-roof-of-thailand",
    name: ["Doi Inthanon", "דוי אינתנון"],
    line: [
      "Summit, cloud forest, royal pagodas",
      "פסגה, יער ענן ופגודות מלכותיות",
    ],
    drive: ["About 1h 45m drive", "כשעה ו-45 דקות נסיעה"],
  },
  {
    k: "sticky",
    slug: "maerim-sticky-waterfalls",
    name: ["Sticky Waterfalls", "המפלים הדביקים"],
    line: ["Limestone falls you climb up", "מפלי גיר שמטפסים עליהם"],
    drive: ["About 1h drive", "כשעת נסיעה"],
  },
  {
    k: "kampong",
    slug: "mae-kampong-hidden-village",
    name: ["Mae Kampong", "מאה קמפונג"],
    line: ["Tea, coffee and an old mountain village", "תה, קפה וכפר הרים ותיק"],
    drive: ["About 1h 15m drive", "כשעה ורבע נסיעה"],
  },
  {
    k: "phachor",
    slug: "mae-wang-jungle-wilderness",
    name: ["Pha Chor Canyon", "קניון פה צ'ור"],
    line: ["Eroded canyon walls in Mae Wang", "קירות קניון שחוקים במאה וואנג"],
    drive: ["About 1h 30m drive", "כשעה וחצי נסיעה"],
  },
  {
    k: "elephant",
    slug: "mae-wang-jungle-wilderness",
    name: ["Elephant Sanctuary", "מקלט הפילים"],
    line: [
      "Optional on the Mae Wang day — no riding",
      "לבחירה ביום מאה וואנג — בלי רכיבה",
    ],
    drive: ["About 1h drive", "כשעת נסיעה"],
  },
];

/** "Every trail starts in Chiang Mai" — place list + 3D relief map. */
export function MapSection() {
  const { t, language } = useLanguage();
  const [active, setActive] = useState<MapPlaceKey>("inthanon");
  const sel = PLACES.find(p => p.k === active) ?? PLACES[0];
  const story = getWiroTourStory(sel.slug);

  return (
    <section
      className="wx"
      aria-labelledby="wx-map-title"
      style={{ padding: "clamp(80px,10vw,128px) 0" }}
    >
      <div className="wx-wrap">
        <div style={{ maxWidth: 720 }}>
          <p className="wx-caps wx-eyebrow" style={{ margin: 0 }}>
            {t("Where we go", "לאן נוסעים")}
          </p>
          <h2
            id="wx-map-title"
            className="wx-h2"
            style={{ fontSize: "clamp(36px,5vw,64px)" }}
          >
            {t("Every trail starts in Chiang Mai", "כל שביל מתחיל בצ'יאנג מאי")}
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: 32,
            marginTop: 48,
            alignItems: "start",
          }}
        >
          <div>
            <div className="wx-places">
              {PLACES.map((p, i) => (
                <button
                  key={p.k}
                  type="button"
                  className={`wx-place ${p.k === active ? "is-on" : ""}`}
                  aria-pressed={p.k === active}
                  onClick={() => setActive(p.k)}
                >
                  <span className="wx-place__num wx-latin">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <span
                      className="wx-serif"
                      style={{ fontSize: 24, lineHeight: 1.1 }}
                    >
                      {t(p.name[0], p.name[1])}
                    </span>
                    <span style={{ fontSize: 14, color: "var(--wx-muted)" }}>
                      {t(p.line[0], p.line[1])}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        color: "var(--wx-gold-ink)",
                        marginTop: 2,
                      }}
                    >
                      <ClockIcon size={14} />
                      {t(p.drive[0], p.drive[1])}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            {story && (
              <Link
                href={tourPath(sel.slug, language)}
                className="wx-link wx-caps"
                style={{ marginTop: 20, color: "var(--wx-ink)" }}
              >
                {t("See the tour:", "לטיול:")}{" "}
                {t(story.shortName[0], story.shortName[1])}
                <ArrowIcon />
              </Link>
            )}
          </div>
          <WiroMap
            only={PLACES.map(p => p.k)}
            active={active}
            onPick={k => PLACES.some(p => p.k === k) && setActive(k)}
            label={t(
              "3D map of WIRO routes from Chiang Mai",
              "מפה תלת־ממדית של מסלולי WIRO מצ'יאנג מאי"
            )}
            className="wx-mapbox--home"
          />
        </div>
      </div>
    </section>
  );
}
