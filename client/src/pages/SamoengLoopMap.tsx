import { ArrowLeft, ArrowUpRight, Map } from "lucide-react";
import { Link } from "wouter";

import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SamoengMapOverview } from "@/components/SamoengMapOverview";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  SAMOENG_ATTRACTIONS,
  SAMOENG_CATEGORIES,
  SAMOENG_MY_MAPS_EMBED_URL,
  SAMOENG_ROUTE_URL,
  SAMOENG_SAVED_PLACES_URL,
  buildGoogleMapsSearchUrl,
} from "@/data/samoengLoop";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trackEvent } from "@/lib/analytics";

const PAGE_PATH = "/motorcycle-tours/samoeng-loop/map";

/**
 * The detailed Samoeng Loop map: WIRO's Google My Maps course plus every
 * saved place, grouped by category, each linking out to Google Maps.
 */
export default function SamoengLoopMap() {
  const { t, language } = useLanguage();

  usePageMeta({
    title: t(
      "Samoeng Loop Map & Saved Places",
      "מפת לולאת סמואנג והמקומות השמורים"
    ),
    description: t(
      "WIRO's interactive Google map of the Samoeng Loop from Chiang Mai, with every saved waterfall, viewpoint, temple, activity and cafe stop.",
      "המפה האינטראקטיבית של WIRO ללולאת סמואנג מצ׳יאנג מאי, עם כל המפלים, התצפיות, המקדשים, האטרקציות ובתי הקפה השמורים."
    ),
    canonicalPath: PAGE_PATH,
    ogImage:
      "https://www.wiro4x4indochina.com/images/optimized/samoeng_valley.webp",
  });

  const trackMapOpen = (placement: string, attractionId?: string) => {
    trackEvent("map_open", {
      page: PAGE_PATH,
      placement,
      language,
      ...(attractionId ? { tour: attractionId } : {}),
    });
  };

  const groups = SAMOENG_CATEGORIES.filter(c => c.id !== "all")
    .map(category => ({
      category,
      places: SAMOENG_ATTRACTIONS.filter(a => a.category === category.id),
    }))
    .filter(group => group.places.length > 0);

  return (
    <>
      <Header />
      <main id="main-content" dir={language === "he" ? "rtl" : "ltr"}>
        <Breadcrumb
          items={[
            {
              label: t("Motorcycle tours", "טיולי אופנועים"),
              href: "/motorcycle-tours",
            },
            {
              label: t("Samoeng Loop", "לולאת סמואנג"),
              href: "/motorcycle-tours/samoeng-loop",
            },
            { label: t("Map", "מפה") },
          ]}
        />

        <section className="container max-w-6xl pt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            {t("WIRO local route guide", "מדריך מסלול מקומי של WIRO")}
          </p>
          <h1 className="mt-3 text-4xl font-heading leading-[1.04] md:text-6xl">
            {t("The Samoeng Loop map", "המפה של לולאת סמואנג")}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {t(
              `Every place WIRO saved along the loop is on the map below — tap a marker for details. Underneath are the ${SAMOENG_ATTRACTIONS.length} highlights WIRO recommends most, grouped by mood.`,
              `כל המקומות ש-WIRO שמר לאורך הלולאה נמצאים במפה למטה — הקישו על סמן לפרטים. מתחתיה ${SAMOENG_ATTRACTIONS.length} המקומות ש-WIRO הכי ממליץ עליהם, לפי סגנון.`
            )}
          </p>
          <Link
            href="/motorcycle-tours/samoeng-loop"
            className="mt-5 inline-flex items-center text-sm font-bold text-primary underline underline-offset-4"
          >
            <ArrowLeft
              className="me-1.5 size-4 rtl:rotate-180"
              aria-hidden="true"
            />
            {t("Back to the Samoeng Loop guide", "חזרה למדריך לולאת סמואנג")}
          </Link>
        </section>

        <div className="mt-10">
          <SamoengMapOverview
            embedUrl={SAMOENG_MY_MAPS_EMBED_URL}
            routeUrl={SAMOENG_ROUTE_URL}
            onMapFocus={() => trackMapOpen("overview-map")}
            onRouteOpen={() => trackMapOpen("overview-full-route")}
          />
        </div>

        <section
          className="border-t border-border bg-muted/55 py-14 md:py-18"
          aria-labelledby="saved-places-heading"
        >
          <div className="container max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  {t("WIRO highlights", "ההמלצות של WIRO")}
                </p>
                <h2
                  id="saved-places-heading"
                  className="mt-2 text-3xl font-heading md:text-4xl"
                >
                  {t(
                    "The stops worth planning around",
                    "העצירות ששווה לתכנן סביבן"
                  )}
                </h2>
              </div>
              <a
                href={SAMOENG_SAVED_PLACES_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackMapOpen("saved-list")}
                className="inline-flex min-h-11 items-center border border-primary px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Map className="me-2 size-4" aria-hidden="true" />
                {t(
                  "Open the saved list in Google Maps",
                  "פתחו את הרשימה השמורה ב-Google Maps"
                )}
                <ArrowUpRight className="ms-2 size-4" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-10 grid gap-10 md:grid-cols-2">
              {groups.map(({ category, places }) => (
                <div key={category.id}>
                  <h3 className="border-b border-accent/45 pb-2 text-lg font-semibold">
                    {t(category.label.en, category.label.he)}
                    <span className="ms-2 text-sm font-normal text-muted-foreground">
                      {places.length}
                    </span>
                  </h3>
                  <ul className="mt-3 grid gap-1">
                    {places.map(place => (
                      <li key={place.id}>
                        <a
                          href={buildGoogleMapsSearchUrl(place.searchQuery)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackMapOpen("attraction", place.id)}
                          className="group flex items-start justify-between gap-4 rounded-sm px-2 py-3 transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <span>
                            <span className="block font-semibold">
                              {place.name}
                            </span>
                            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                              {t(place.description.en, place.description.he)}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="mt-1 size-4 shrink-0 text-primary opacity-60 transition-opacity group-hover:opacity-100"
                            aria-label={t(
                              `Open ${place.name} in Google Maps`,
                              `פתחו את ${place.name} ב-Google Maps`
                            )}
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
