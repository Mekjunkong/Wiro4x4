import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { photo } from "@/data/wiroTours";
import { prefersReducedMotion } from "../useViewport";

type Bi = readonly [string, string];
interface Spot {
  x: number;
  y: number;
  title: Bi;
  body: Bi;
  stat: Bi;
  statLabel: Bi;
}

const SPOTS: readonly Spot[] = [
  {
    x: 34,
    y: 72,
    title: ["Your guide", "המדריך שלכם"],
    body: [
      "Local roads, Hebrew-speaking planning, and a clear plan for where lunch happens.",
      "דרכים מקומיות, תכנון בעברית ותוכנית ברורה איפה עוצרים לאכול.",
    ],
    stat: ["עב", "עב"],
    statLabel: ["Hebrew planning available", "תכנון בעברית"],
  },
  {
    x: 72,
    y: 42,
    title: ["Your truck, your group", "הרכב שלכם, הקבוצה שלכם"],
    body: [
      "Private all day. No strangers, no fixed bus schedule.",
      "פרטי כל היום. בלי זרים, בלי לוח זמנים של אוטובוס.",
    ],
    stat: ["Private", "פרטי"],
    statLabel: ["one group per vehicle", "קבוצה אחת לרכב"],
  },
  {
    x: 60,
    y: 19,
    title: ["Loaded roof rack", "גגון עמוס"],
    body: [
      "Lunch, cold water and recovery gear ride with you.",
      "ארוחת צהריים, מים קרים וציוד חילוץ — הכול נוסע איתכם.",
    ],
    stat: ["Lunch", "ארוחה"],
    statLabel: ["planned before your day", "מתוכננת לפני היום"],
  },
  {
    x: 8,
    y: 86,
    title: ["Real off-road", "שטח אמיתי"],
    body: [
      "4×4 low range for river crossings and jungle tracks.",
      "הילוך כוח לחציית נהרות ודרכי ג'ונגל.",
    ],
    stat: ["4×4", "4×4"],
    statLabel: ["low range for real tracks", "הילוך כוח לשטח אמיתי"],
  },
  {
    x: 53,
    y: 72,
    title: ["Cool inside", "קריר בפנים"],
    body: [
      "A/C, cold drinks and room to stretch between stops.",
      "מיזוג, שתייה קרה ומקום להתמתח בין העצירות.",
    ],
    stat: ["A/C", "מיזוג"],
    statLabel: ["cold water all day", "מים קרים כל היום"],
  },
];

/** "The machine" — hotspots over a real photo of the WIRO trucks. */
export function MachineSection() {
  const { t } = useLanguage();
  const [spot, setSpot] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || prefersReducedMotion()) return;
    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const my = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (imgRef.current)
        imgRef.current.style.transform = `scale(1.06) translate(${(mx * -14).toFixed(1)}px, ${(my * -10).toFixed(1)}px)`;
    };
    box.addEventListener("pointermove", onMove);
    return () => box.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section className="wx wx-dark" aria-labelledby="wx-machine-title">
      <div className="wx-wrap wx-machine__intro">
        <div>
          <p className="wx-caps wx-eyebrow" style={{ margin: 0 }}>
            {t("The machine", "הרכב")}
          </p>
          <h2
            id="wx-machine-title"
            className="wx-h2"
            style={{ fontSize: "clamp(44px,6vw,92px)", lineHeight: 0.92 }}
          >
            {t("Your private 4×4.", "4×4 פרטי.")}
            <br />
            <em style={{ color: "var(--wx-gold)" }}>
              {t("Your pace.", "הקצב שלכם.")}
            </em>
          </h2>
        </div>
        <div className="wx-machine__note">
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.65,
              color: "rgba(251,248,241,0.85)",
              margin: 0,
            }}
          >
            {t(
              "A real photo of the WIRO trucks — no staging. One group per vehicle, all day, at the pace you choose.",
              "תמונה אמיתית של רכבי WIRO — בלי בימוי. קבוצה אחת לרכב, כל היום, בקצב שאתם בוחרים."
            )}
          </p>
          <p
            className="wx-caps"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 18,
              fontSize: 11,
              color: "var(--wx-gold)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                border: "2px solid var(--wx-gold)",
                boxShadow: "0 0 0 4px rgba(212,175,55,0.2)",
              }}
            />
            {t("Tap the gold points", "לחצו על הנקודות הזהובות")}
          </p>
        </div>
      </div>

      <div ref={boxRef} className="wx-machine__photo">
        <img
          ref={imgRef}
          src={photo("wiro_thumbsup_between_trucks").lg}
          alt={t(
            "WIRO guide giving a thumbs-up from a black 4×4",
            "מדריך WIRO מרים אגודל מתוך ג'יפ 4×4 שחור"
          )}
          style={{ transform: "scale(1.06)" }}
        />
        <div className="wx-machine__fade" />
        {SPOTS.map((p, i) => {
          const on = i === spot;
          const end = p.x > 55;
          return (
            <div
              key={i}
              className={`wx-spot ${on ? "is-on" : ""}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: on ? 5 : 2 }}
            >
              <button
                type="button"
                className="wx-spot__btn"
                aria-label={t(p.title[0], p.title[1])}
                aria-pressed={on}
                onMouseEnter={() => setSpot(i)}
                onFocus={() => setSpot(i)}
                onClick={() => setSpot(i)}
              >
                <span className="wx-spot__ring" />
                <span className="wx-spot__dot" />
              </button>
              <div
                className={`wx-spot__card ${end ? "wx-spot__card--end" : "wx-spot__card--start"}`}
                style={end ? { right: 34 } : { left: 34 }}
                aria-hidden={!on}
              >
                <div
                  className="wx-caps"
                  style={{ fontSize: 11, color: "var(--wx-gold)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  className="wx-serif"
                  style={{ fontSize: 24, lineHeight: 1.1, marginTop: 6 }}
                >
                  {t(p.title[0], p.title[1])}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.5,
                    color: "rgba(251,248,241,0.85)",
                    marginTop: 6,
                  }}
                >
                  {t(p.body[0], p.body[1])}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="wx-wrap wx-machine__caption" aria-live="polite">
        <div className="wx-serif" style={{ fontSize: 24, lineHeight: 1.1 }}>
          {t(SPOTS[spot].title[0], SPOTS[spot].title[1])}
        </div>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.5,
            color: "rgba(251,248,241,0.85)",
            margin: "6px 0 0",
          }}
        >
          {t(SPOTS[spot].body[0], SPOTS[spot].body[1])}
        </p>
      </div>

      <div className="wx-wrap wx-stats">
        {SPOTS.map((p, i) => (
          <button
            key={i}
            type="button"
            className={`wx-stat ${i === spot ? "is-on" : ""}`}
            onMouseEnter={() => setSpot(i)}
            onClick={() => setSpot(i)}
            aria-pressed={i === spot}
          >
            <div className="wx-stat__num">{t(p.stat[0], p.stat[1])}</div>
            <div className="wx-stat__label">
              {t(p.statLabel[0], p.statLabel[1])}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
