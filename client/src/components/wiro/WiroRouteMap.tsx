import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { RouteStop } from "@/data/motorcycleRoutes";
import type { RouteMapHandle } from "@/lib/wiroRouteMap";

interface WiroRouteMapProps {
  stops: readonly RouteStop[];
  /** Draw the line through the stops in order (false = pins only). */
  loop: boolean;
  className?: string;
  label: string;
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
  className = "",
  label,
}: WiroRouteMapProps) {
  const { language, t } = useLanguage();
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<RouteMapHandle | null>(null);
  const optsRef = useRef({ stops, loop, lang: language });
  optsRef.current = { stops, loop, lang: language };
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
  useEffect(() => {
    handleRef.current?.update({ stops, loop, lang: language });
  }, [stops, loop, language]);

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
