import { useState } from "react";
import { ArrowUpRight, Map } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

interface SamoengMapOverviewProps {
  embedUrl: string;
  routeUrl: string;
  onMapFocus: () => void;
  onRouteOpen: () => void;
}

export function isAllowedGoogleMyMapsEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname === "www.google.com" &&
      url.pathname === "/maps/d/u/0/embed" &&
      Boolean(url.searchParams.get("mid"))
    );
  } catch {
    return false;
  }
}

export function SamoengMapOverview({
  embedUrl,
  routeUrl,
  onMapFocus,
  onRouteOpen,
}: SamoengMapOverviewProps) {
  const { t } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  const canEmbed = isAllowedGoogleMyMapsEmbedUrl(embedUrl);

  return (
    <section
      className="container max-w-6xl pb-16 md:pb-20"
      aria-labelledby="route-overview-heading"
    >
      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            {t("Route overview", "מפת המסלול")}
          </p>
          <h2
            id="route-overview-heading"
            className="mt-2 text-3xl font-heading md:text-4xl"
          >
            {t(
              "Explore the complete Samoeng Loop",
              "גלו את לולאת סמואנג המלאה"
            )}
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            {t(
              "Move around the map and tap a marker for place details. Open the full route when you are ready to navigate.",
              "הזיזו את המפה ולחצו על סמן כדי לראות פרטים על המקום. כשתהיו מוכנים לניווט, פתחו את המסלול המלא."
            )}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          <Map className="size-3.5 text-primary" aria-hidden="true" />
          {t("38 saved places", "38 מקומות שמורים")}
        </span>
      </div>

      <div className="overflow-hidden rounded-sm border border-border bg-muted shadow-sm">
        <div className="relative h-[350px] md:h-[480px]">
          {!isLoaded && canEmbed ? (
            <div
              className="absolute inset-0 grid place-items-center bg-muted text-sm text-muted-foreground"
              role="status"
            >
              {t("Loading route overview…", "מפת המסלול נטענת…")}
            </div>
          ) : null}

          {canEmbed ? (
            <iframe
              src={embedUrl}
              title={t(
                "Interactive Google My Maps overview of the Samoeng Loop and 38 saved places",
                "מפת Google My Maps אינטראקטיבית של לולאת סמואנג ו-38 מקומות שמורים"
              )}
              className={`h-full w-full border-0 transition-opacity duration-300 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              onLoad={() => setIsLoaded(true)}
              onFocus={onMapFocus}
            />
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-sm leading-relaxed text-muted-foreground">
              {t(
                "The interactive map is unavailable right now. You can still open the complete route or browse the stops below.",
                "המפה האינטראקטיבית אינה זמינה כרגע. עדיין אפשר לפתוח את המסלול המלא או לעבור על העצירות שבהמשך."
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 border-t border-border bg-card p-4 sm:p-5 md:grid-cols-[1fr_auto] md:items-center">
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {t(
              "This overview uses Google My Maps driving display. Use WIRO’s full-route button for the supplied motorcycle course and live navigation.",
              "תצוגת הסקירה מבוססת על מצב נהיגה של Google My Maps. השתמשו בכפתור המסלול המלא של WIRO למסלול האופנוע שסופק ולניווט בזמן אמת."
            )}
          </p>
          <a
            href={routeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onRouteOpen}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-primary px-5 py-3 text-center font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 md:w-auto"
          >
            {t(
              "Open full route in Google Maps",
              "פתחו את המסלול המלא ב-Google Maps"
            )}
            <ArrowUpRight className="ms-2 size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
