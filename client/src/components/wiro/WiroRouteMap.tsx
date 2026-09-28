import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { RouteStop } from "@/data/motorcycleRoutes";
import type { RouteMapHandle } from "@/lib/wiroRouteMap";

interface WiroRouteMapProps {
  stops: readonly RouteStop[];
  /** Draw the line through the stops in order (false = pins only). */
  loop: boolean;
  /** Highlight only the stops between these indices (inclusive). */
  focus?: readonly [from: number, to: number] | null;
  /** Hide overlapping labels instead of stacking them (small maps). */
  cullLabels?: boolean;
  className?: string;
  label: string;
}

/**
 * Bring a map into view when a stage button far down the page changes it
 * (on phones the map is not sticky). Does nothing if the map is visible.
 */
export function revealMap(el: HTMLElement | null) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (r.top >= 0 && r.bottom <= window.innerHeight) return;
  const reduce = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The 3D Northern Thailand route map for multi-day loops. three.js is loaded
 * on demand the first time the map scrolls near the viewport, and the canvas
 * is torn down on unmount.
 */
export function WiroRouteMap({
  stops,
  loop,
  focus = null,
  cullLabels = false,
  className = "",
  label,
}: WiroRouteMapProps) {
  const { language, t } = useLanguage();
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<RouteMapHandle | null>(null);
  const optsRef = useRef({ stops, loop, focus, cullLabels, lang: language });
  optsRef.current = { stops, loop, focus, cullLabels, lang: language };
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!hasWebGL()) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    const io = new IntersectionObserver(
      entries => {
        if (!entries.some(e => e.isIntersecting)) return;
        io.disconnect();
        import("@/lib/wiroRouteMap")
          .then(({ createRouteMap }) => {
            if (cancelled) return;
            handleRef.current = createRouteMap(host, optsRef.current);
          })
          .catch(err => {
            console.warn("[WiroRouteMap] failed to load", err);
            if (!cancelled) setFailed(true);
          });
      },
      { rootMargin: "300px" }
    );
    io.observe(host);
    return () => {
      cancelled = true;
      io.disconnect();
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, []);

  // `stops` arrays are module constants, so identity is a safe change signal.
  const [focusFrom, focusTo] = focus ?? [-1, -1];
  useEffect(() => {
    handleRef.current?.update({
      stops,
      loop,
      focus: focusFrom < 0 ? null : [focusFrom, focusTo],
      cullLabels,
      lang: language,
    });
  }, [stops, loop, focusFrom, focusTo, cullLabels, language]);

  return (
    <div
      ref={hostRef}
      className={`wx-mapbox ${className}`}
      role="img"
      aria-label={label}
    >
      {failed ? (
        <p className="wx-mapbox__fallback">
          {t(
            "The 3D map needs WebGL. Every motorcycle loop starts and ends in Chiang Mai.",
            "המפה התלת־ממדית דורשת WebGL. כל לולאת אופנועים מתחילה ומסתיימת בצ׳יאנג מאי."
          )}
        </p>
      ) : (
        <span className="wx-mapbox__hint wx-caps">
          {t("Drag to look around", "גררו כדי להסתכל מסביב")}
        </span>
      )}
    </div>
  );
}
