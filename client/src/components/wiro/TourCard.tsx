import type { MouseEvent } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DIFFICULTY_LABEL,
  DURATION_HE,
  photo,
  type WiroTour,
} from "@/data/wiroTours";
import { ArrowIcon, ClockIcon, MountainIcon } from "./icons";
import { prefersReducedMotion } from "./useViewport";
import { tourPath } from "@shared/tourPaths";

function onTilt(e: MouseEvent<HTMLAnchorElement>) {
  if (prefersReducedMotion()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.transition = "transform 120ms linear, box-shadow 400ms";
  el.style.transform = `perspective(1000px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 11).toFixed(2)}deg) translateY(-6px)`;
  el.style.boxShadow =
    "0 24px 48px -12px rgba(0,0,0,0.28), 0 0 0 1px rgba(212,175,55,0.35)";
  const gl = el.querySelector<HTMLElement>("[data-glare]");
  if (gl) {
    gl.style.opacity = "1";
    gl.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(251,248,241,0.55), rgba(251,248,241,0) 55%)`;
  }
  const im = el.querySelector<HTMLElement>("[data-par]");
  if (im)
    im.style.transform = `scale(1.12) translate(${(-x * 14).toFixed(1)}px, ${(-y * 14).toFixed(1)}px)`;
}

function offTilt(e: MouseEvent<HTMLAnchorElement>) {
  const el = e.currentTarget;
  el.style.transition = "";
  el.style.transform = "";
  el.style.boxShadow = "";
  const gl = el.querySelector<HTMLElement>("[data-glare]");
  if (gl) gl.style.opacity = "0";
  const im = el.querySelector<HTMLElement>("[data-par]");
  if (im) im.style.transform = "";
}

/** Image-led tour card with a pointer tilt (design "tilt" variant). */
export function TourCard({ tour }: { tour: WiroTour }) {
  const { t, language } = useLanguage();
  const name = t(tour.shortName[0], tour.shortName[1]);
  const tags = [
    t("Kosher-friendly", "ידידותי לכשרות"),
    t("Private", "פרטי"),
    ...(tour.shabbatFriendly ? [t("Shabbat-aware", "מותאם שבת")] : []),
  ];
  return (
    <Link
      href={tourPath(tour.slug, language)}
      className="wx-card"
      onMouseMove={onTilt}
      onMouseLeave={offTilt}
    >
      <div className="wx-card__media">
        <img data-par src={photo(tour.image).md} alt={name} loading="lazy" />
        <span className="wx-card__badge">
          {t(tour.badge[0], tour.badge[1])}
        </span>
      </div>
      <span data-glare className="wx-card__glare" />
      <div className="wx-card__body">
        <div
          className="wx-caps"
          style={{ fontSize: 11, color: "var(--wx-gold-ink)" }}
        >
          {t(tour.tag[0], tour.tag[1])}
        </div>
        <h3>{name}</h3>
        <p className="wx-card__desc">{t(tour.desc[0], tour.desc[1])}</p>
        <div className="wx-card__facts">
          <span>
            <span style={{ color: "var(--wx-gold-ink)", display: "flex" }}>
              <ClockIcon />
            </span>
            {language === "he"
              ? (DURATION_HE[tour.duration] ?? tour.duration)
              : tour.duration}
          </span>
          <span>
            <span style={{ color: "var(--wx-gold-ink)", display: "flex" }}>
              <MountainIcon />
            </span>
            {t(...DIFFICULTY_LABEL[tour.difficulty])}
          </span>
        </div>
        <div className="wx-tags">
          {tags.map(tag => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="wx-card__more">
          {t("View details", "לפרטים נוספים")}
          <ArrowIcon />
        </div>
      </div>
    </Link>
  );
}
