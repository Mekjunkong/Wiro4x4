import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { MapPlaceKey } from "@/data/wiroTours";
import type { ReliefMapHandle } from "@/lib/wiroReliefMap";

interface WiroMapProps {
  only?: readonly MapPlaceKey[];
  active: MapPlaceKey | null;
  onPick?: (key: MapPlaceKey) => void;
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
 * The 3D relief map. three.js is loaded on demand the first time the map
 * scrolls near the viewport, and the canvas is torn down on unmount.
 */
export function WiroMap({
  only = [],
  active,
  onPick,
  className = "",
  label,
}: WiroMapProps) {
  const { language, t } = useLanguage();
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ReliefMapHandle | null>(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const optsRef = useRef({ only, active, lang: language });
  optsRef.current = { only, active, lang: language };
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
        import("@/lib/wiroReliefMap")
          .then(({ createReliefMap }) => {
            if (cancelled) return;
            handleRef.current = createReliefMap(host, optsRef.current, key =>
              pickRef.current?.(key)
            );
          })
          .catch(err => {
            console.warn("[WiroMap] failed to load", err);
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

  const onlyKey = only.join(",");
  useEffect(() => {
    handleRef.current?.update({ only, active, lang: language });
    // `only` is compared by value through onlyKey.
  }, [onlyKey, active, language]);

  return (
    <div
      ref={hostRef}
      className={`wx-mapbox ${className}`}
      role="region"
      aria-label={label}
    >
      {failed ? (
        <p className="wx-mapbox__fallback">
          {t(
            "The 3D map needs WebGL. Every route still starts with hotel pickup in Chiang Mai.",
            "המפה התלת־ממדית דורשת WebGL. כל מסלול מתחיל באיסוף מהמלון בצ'יאנג מאי."
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
