import { COMMERCIAL_SEO_ROUTE_PAIRS } from "../shared/commercialSeo";
import { commercialBody, faqBody, toursListBody } from "./seoPageBody";

interface SearchPage {
  title: string;
  description: string;
  canonicalPath: string;
  lang?: string;
  /** Pre-escaped page body from `seoPageBody.ts` (tour, blog, package). */
  bodyHtml?: string;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    character =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!
  );
}

/** Visible initial content for every visitor, replaced by React on mount.
 * Uses the same page metadata and tour catalog as the app, never user-agent detection.
 */
export function injectPageContent(html: string, page: SearchPage): string {
  const he = page.lang === "he";
  const heading = page.title.replace(/\s*\|\s*WIRO 4x4.*$/, "");
  const links = [
    {
      path: "/tours",
      label: he ? "טיולי 4x4 בצ׳יאנג מאי" : "Chiang Mai 4x4 day tours",
    },
    {
      path: "/packages",
      label: he ? "חבילות טיול למספר ימים" : "Multi-day tour packages",
    },
    {
      path: "/motorcycle-tours",
      label: he
        ? "טיולי אופנועים בצפון תאילנד"
        : "Northern Thailand motorcycle tours",
    },
    {
      path: "/motorcycle-tours/samoeng-loop",
      label: he
        ? "מדריך אופנועים ללולאת סמואנג"
        : "Samoeng Loop motorcycle route guide",
    },
    {
      path: "/motorcycle-tours/mae-hong-son-loop",
      label: he
        ? "מדריך ללולאת מאה הונג סון באופנוע או 4x4"
        : "Mae Hong Son Loop motorcycle and 4x4 guide",
    },
    ...COMMERCIAL_SEO_ROUTE_PAIRS.map(pair => ({
      path: pair.paths[he ? "he" : "en"],
      label: pair.metadata[he ? "he" : "en"].title,
    })),
    {
      path: "/about",
      label: he ? "הכירו את Wiro" : "Meet Wiro, your local guide",
    },
    {
      path: "/contact",
      label: he ? "צרו קשר לתכנון הטיול" : "Contact WIRO to plan your trip",
    },
  ];
  const linkList = links
    .filter(link => link.path !== page.canonicalPath)
    .map(
      link =>
        `<li><a href="${escapeHtml(link.path)}">${escapeHtml(link.label)}</a></li>`
    )
    .join("");
  const lang = he ? "he" : "en";
  const body =
    page.bodyHtml ??
    (page.canonicalPath === "/" || page.canonicalPath === "/tours"
      ? toursListBody(lang)
      : page.canonicalPath === "/faq"
        ? faqBody(lang)
        : commercialBody(page.canonicalPath, lang));
  const content = `<main id="main-content" lang="${he ? "he" : "en"}" dir="${he ? "rtl" : "ltr"}" class="container py-16"><a href="/">WIRO 4x4</a><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(page.description)}</p>${body}<nav aria-label="${he ? "טיולים ותכנון" : "Tours and planning"}"><ul>${linkList}</ul></nav></main>`;
  // The shell and this fallback contain no nested divs; replacing it is idempotent.
  return html.replace(
    /(<div\s+id="root"\s*>)[\s\S]*?<\/div>/,
    (_match, open: string) => `${open}${content}</div>`
  );
}
