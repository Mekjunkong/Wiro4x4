import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { photo } from "@/data/wiroTours";
import { WIRO_SERVICES } from "@/data/wiroServices";
import { ArrowIcon } from "../icons";
import { useViewportWidth } from "../useViewport";

/** "Your journey, your way" — a 3D cover-flow of the five WIRO services. */
export function TrailCarousel() {
  const tours = WIRO_SERVICES;
  const { t, language } = useLanguage();
  const [, navigate] = useLocation();
  const w = useViewportWidth();
  const [idx, setIdx] = useState(0);
  const hover = useRef(false);
  const lastTouch = useRef(0);
  const downX = useRef<number | null>(null);
  const dragged = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const n = tours.length;
  const dirxRef = useRef(1);
  dirxRef.current = language === "he" ? -1 : 1;

  // Laptop trackpads move the carousel with a two-finger horizontal swipe,
  // which arrives as wheel deltaX. Non-passive so the swipe doesn't also
  // trigger the browser's back/forward gesture.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || n < 2) return undefined;
    let acc = 0;
    let lockedUntil = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = Date.now();
      if (now < lockedUntil) return;
      acc += e.deltaX;
      if (Math.abs(acc) < 40) return;
      const d = (acc > 0 ? 1 : -1) * dirxRef.current;
      acc = 0;
      lockedUntil = now + 600;
      lastTouch.current = now;
      setIdx(i => (i + d + n) % n);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [n]);

  useEffect(() => {
    if (n < 2) return;
    const id = window.setInterval(() => {
      if (hover.current || document.hidden) return;
      if (Date.now() - lastTouch.current < 8000) return;
      setIdx(i => (i + 1) % n);
    }, 4500);
    return () => window.clearInterval(id);
  }, [n]);

  if (!n) return null;
  const step = (d: number) => {
    lastTouch.current = Date.now();
    setIdx(i => (i + d + n) % n);
  };
  const narrow = w < 900;
  const cw = Math.round(Math.min(420, w * (narrow ? 0.7 : 0.3)));
  const sp = Math.round(Math.min(w * (narrow ? 0.5 : 0.26), 380));
  const dirx = language === "he" ? -1 : 1;
  const active = tours[idx];

  return (
    <section
      className="wx wx-trail"
      aria-labelledby="wx-trail-title"
      aria-roledescription="carousel"
    >
      {tours.map((tour, i) => (
        <img
          key={tour.id}
          src={photo(tour.image).sm}
          alt=""
          aria-hidden="true"
          className={`wx-trail__bg ${i === idx ? "is-on" : ""}`}
        />
      ))}
      <div className="wx-trail__veil" />

      <div className="wx-marquee" aria-hidden="true" dir="ltr">
        <div className="wx-marquee__track">
          {[...tours, ...tours].map((m, i) => (
            <span
              key={i}
              className="wx-marquee__item"
              style={{
                color: i % 2 ? "var(--wx-ink)" : "var(--wx-gold-ink)",
                fontStyle: i % 2 ? "italic" : "normal",
              }}
            >
              {t(...m.label)}
            </span>
          ))}
        </div>
      </div>

      <div className="wx-wrap wx-trail__head">
        <div>
          <p className="wx-caps wx-eyebrow" style={{ margin: 0 }}>
            {t("The WIRO way", "הדרך של WIRO")}
          </p>
          <h2 id="wx-trail-title" className="wx-h2">
            {t("Your journey, your way", "המסע שלכם, בדרך שלכם")}
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            className="wx-round"
            onClick={() => step(-1)}
            aria-label={t("Previous services", "לאפשרויות הקודמות")}
          >
            <ArrowIcon size={20} back />
          </button>
          <span
            dir="ltr"
            aria-live="polite"
            style={{
              fontSize: 13,
              letterSpacing: "0.18em",
              color: "var(--wx-muted)",
              minWidth: 64,
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <button
            type="button"
            className="wx-round"
            onClick={() => step(1)}
            aria-label={t("Next services", "לאפשרויות הבאות")}
          >
            <ArrowIcon size={20} />
          </button>
        </div>
      </div>

      <div
        className="wx-stage"
        style={{ height: Math.round((cw * 4) / 3) + 20 }}
        onMouseEnter={() => (hover.current = true)}
        onMouseLeave={() => (hover.current = false)}
        ref={stageRef}
        onPointerDown={e => {
          if (e.button !== 0) return;
          downX.current = e.clientX;
          dragged.current = false;
        }}
        onPointerMove={e => {
          if (downX.current == null || dragged.current) return;
          if (Math.abs(e.clientX - downX.current) > 8) {
            // Capture only once it's really a drag, so plain clicks still
            // land on the card underneath.
            dragged.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        }}
        onPointerUp={e => {
          if (downX.current == null) return;
          const dx = e.clientX - downX.current;
          downX.current = null;
          if (Math.abs(dx) > 40) step((dx < 0 ? 1 : -1) * dirx);
          if (dragged.current)
            window.setTimeout(() => (dragged.current = false), 50);
        }}
        onPointerCancel={() => {
          downX.current = null;
          dragged.current = false;
        }}
        onKeyDown={e => {
          if (e.key === "ArrowRight") step(dirx);
          else if (e.key === "ArrowLeft") step(-dirx);
        }}
      >
        {tours.map((tour, i) => {
          let d = i - idx;
          if (d > n / 2) d -= n;
          if (d < -n / 2) d += n;
          const ad = Math.abs(d);
          const on = d === 0;
          const name = t(...tour.label);
          return (
            <button
              key={tour.id}
              type="button"
              className="wx-stage__card"
              tabIndex={ad > 1 ? -1 : 0}
              onClick={() => {
                if (dragged.current) return;
                if (on) navigate(tour.href);
                else {
                  lastTouch.current = Date.now();
                  setIdx(i);
                }
              }}
              style={{
                width: cw,
                marginInlineStart: 0,
                marginLeft: -cw / 2,
                transform: `translateX(${d * sp * dirx}px) translateZ(${-ad * 260}px) rotateY(${-d * dirx * 32}deg)`,
                opacity: ad > 2 ? 0 : 1,
                zIndex: 10 - ad,
                pointerEvents: ad > 2 ? "none" : "auto",
                boxShadow: on
                  ? "0 50px 100px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(212,175,55,0.35)"
                  : "0 30px 60px -20px rgba(0,0,0,0.7)",
              }}
            >
              {/* The verb joins the visible text so the spoken name contains it. */}
              <span className="sr-only">
                {on ? t("Open", "פתחו") : t("Show", "הציגו")}{" "}
              </span>
              <img
                src={photo(tour.image).md}
                alt=""
                aria-hidden="true"
                draggable={false}
                style={{ transform: `scale(${on ? 1.06 : 1})` }}
              />
              <span className="wx-stage__shade" />
              <span
                className="wx-stage__dim"
                style={{ opacity: on ? 0 : ad === 1 ? 0.35 : 0.6 }}
              />
              <span
                className="wx-stage__frame"
                style={{ opacity: on ? 1 : 0 }}
              />
              <span className="wx-stage__top">
                <span className="wx-badge">{t(...tour.badge)}</span>
                <span
                  className="wx-latin"
                  style={{ fontSize: 20, color: "var(--wx-gold)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="wx-stage__body">
                <span
                  className="wx-caps"
                  style={{ color: "var(--wx-gold)", fontSize: 11 }}
                >
                  {t(...tour.audience)}
                </span>
                <h3>{name}</h3>
                <span className="wx-stage__meta" style={{ display: "block" }}>
                  {t(...tour.summary)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="wx-wrap"
        style={{
          position: "relative",
          maxWidth: 720,
          margin: "clamp(28px,4vw,44px) auto 0",
          textAlign: "center",
        }}
      >
        <h3
          className="wx-h3"
          style={{
            margin: 0,
            fontSize: 24,
            lineHeight: 1.3,
            textWrap: "balance",
          }}
        >
          {t(...active.heading)}
        </h3>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            margin: "12px 0 0",
            color: "var(--wx-muted)",
            textWrap: "balance",
          }}
        >
          {t(...active.subheading)}
        </p>
        <ul className="wx-trail__bullets">
          {active.bullets.map(b => (
            <li key={b[0]}>{t(...b)}</li>
          ))}
        </ul>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            marginTop: 24,
          }}
        >
          <Link
            href={active.href}
            className="wx-btn wx-btn--gold wx-btn--sharp"
          >
            {t(...active.cta)}
            <ArrowIcon />
          </Link>
        </div>
        <div className="wx-dots">
          {tours.map((tour, i) => (
            <button
              key={tour.id}
              type="button"
              className={i === idx ? "is-on" : ""}
              aria-label={t(...tour.label)}
              aria-current={i === idx}
              onClick={() => {
                lastTouch.current = Date.now();
                setIdx(i);
              }}
            />
          ))}
        </div>
        <Link
          href="/tours"
          className="wx-link wx-caps"
          style={{ marginTop: 28, color: "var(--wx-ink)" }}
        >
          {t("See the day tours", "לכל טיולי היום")}
        </Link>
      </div>
    </section>
  );
}
