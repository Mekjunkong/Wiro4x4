import { escapeHtml } from "../shared/escapeHtml";
import {
  COMMERCIAL_LANDING_CONTENT,
  type LocalizedCopy,
} from "../shared/commercialLandingContent";
import { COMPANY_EMAIL, COMPANY_PHONE } from "../shared/const";
import { FAQ_ITEMS } from "../shared/faqItems";
import {
  TRIPADVISOR_REVIEWS,
  TRIPADVISOR_REVIEW_SNAPSHOT,
} from "../shared/tripadvisorReviews";
import { COMPANY_TRIPADVISOR_URL } from "../shared/const";
import {
  MAE_HONG_SON_HIGHLIGHTS,
  MAE_HONG_SON_PACES,
  MAE_HONG_SON_STAGES,
  MAE_HONG_SON_VEHICLE_NOTES,
} from "../shared/maeHongSonLoop";
import {
  MOTORCYCLE_HIGHLIGHTS,
  MOTORCYCLE_TOUR_OPTIONS,
} from "../shared/motorcycleTours";
import {
  SAMOENG_ATTRACTIONS,
  SAMOENG_CATEGORIES,
  SAMOENG_ROUTE_STAGES,
} from "../shared/samoengLoop";
import { getHardcodedPosts } from "../shared/blog/hardcodedPosts";
import { WIRO_TOUR_CATALOG } from "../shared/wiroTourCatalog";
import {
  DIFFICULTY_LABEL,
  DURATION_HE,
  WIRO_TOUR_STORIES,
} from "../shared/wiroTourStories";

/**
 * Page body HTML for the no-JavaScript first paint (and the crawlers that
 * never run JavaScript). Every string comes from the same shared modules
 * the React pages render, and every string is escaped here.
 */

type Lang = "en" | "he";
const pick = (lang: Lang, pair: readonly [string, string]) =>
  lang === "he" ? pair[1] : pair[0];

function inline(text: string): string {
  // Escape first, then re-enable **bold** and safe [links](…).
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]*)\)/g,
      (_m, label: string, href: string) => `<a href="${href}">${label}</a>`
    )
    .replace(/[*_`]/g, "");
}

/**
 * Minimal markdown → HTML for blog bodies: headings, lists, paragraphs.
 * The page already has its <h1>, so `#` headings become <h2> and a leading
 * heading that repeats the title is dropped.
 */
export function markdownToHtml(markdown: string, title?: string): string {
  const out: string[] = [];
  let list: { tag: "ul" | "ol"; items: string[] } | null = null;
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list)
      out.push(
        `<${list.tag}>${list.items.map(i => `<li>${inline(i)}</li>`).join("")}</${list.tag}>`
      );
    list = null;
  };
  // Letters and digits only (Hebrew kept); used to spot a repeated title.
  const norm = (s: string) =>
    s.toLowerCase().replace(/[\s!-/:-@[-`{-~\u2013\u2014\u2019]+/g, "");
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    const bullet = line.match(/^[-*+]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (!line || /^(-{3,}|\*{3,})$/.test(line)) {
      flushPara();
      flushList();
    } else if (heading) {
      flushPara();
      flushList();
      const text = heading[2];
      if (!out.length && title && norm(text) && norm(text) === norm(title))
        continue;
      const tag = heading[1].length <= 2 ? "h2" : "h3";
      out.push(`<${tag}>${inline(text)}</${tag}>`);
    } else if (bullet || numbered) {
      flushPara();
      const tag = bullet ? "ul" : "ol";
      if (list && list.tag !== tag) flushList();
      list ??= { tag, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return out.join("");
}

export function blogBody(
  slug: string,
  dbContent: string | null | undefined,
  title: string,
  lang: Lang
): string {
  const content =
    dbContent?.trim() ||
    getHardcodedPosts((en, he) => (lang === "he" ? he : en))[slug]?.content;
  return content ? `<article>${markdownToHtml(content, title)}</article>` : "";
}

interface TourFacts {
  price?: number | null;
  duration?: string | null;
  difficulty?: string | null;
  description?: string | null;
}

/** Tour detail: the story, facts, itinerary and a booking link. */
export function tourBody(slug: string, facts: TourFacts, lang: Lang): string {
  const story = WIRO_TOUR_STORIES.find(s => s.slug === slug);
  const catalog = WIRO_TOUR_CATALOG.find(t => t.slug === slug);
  if (!story && !catalog) return "";
  const he = lang === "he";
  const duration = facts.duration || catalog?.duration;
  const difficulty = (facts.difficulty ||
    catalog?.difficulty) as keyof typeof DIFFICULTY_LABEL;
  const rows = [
    duration && [
      he ? "משך" : "Duration",
      he ? (DURATION_HE[duration] ?? duration) : duration,
    ],
    DIFFICULTY_LABEL[difficulty] && [
      he ? "רמת קושי" : "Difficulty",
      pick(lang, DIFFICULTY_LABEL[difficulty]),
    ],
    // Public prices are hidden on the site, so crawlers get the same answer.
    [
      he ? "מחיר" : "Price",
      he
        ? "לפי בקשה, לקבוצה פרטית ברכב משלכם"
        : "On request, private group in your own vehicle",
    ],
    [
      he ? "כולל" : "Includes",
      he
        ? "רכב 4x4 פרטי ונהג-מדריך, איסוף ממרכז צ׳יאנג מאי או מרוב האזורים הקרובים, תכנון ארוחות ידידותי לכשרות"
        : "Private 4x4 vehicle and driver-guide, pickup from Chiang Mai city centre or most nearby areas, kosher-friendly meal planning",
    ],
  ].filter(Boolean) as [string, string][];
  const parts: string[] = [];
  if (story) parts.push(`<p>${escapeHtml(pick(lang, story.desc))}</p>`);
  parts.push(
    `<dl>${rows.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join("")}</dl>`
  );
  const longDescription = facts.description?.trim();
  if (longDescription) parts.push(markdownToHtml(longDescription));
  if (story?.itinerary.length) {
    parts.push(
      `<h2>${he ? "היום, שעה אחר שעה" : "The day, hour by hour"}</h2><ol>${story.itinerary
        .map(
          ([time, en, heText]) =>
            `<li>${escapeHtml(time)}: ${escapeHtml(he ? heText : en)}</li>`
        )
        .join("")}</ol>`
    );
  }
  if (story) parts.push(`<p>${escapeHtml(pick(lang, story.meal))}</p>`);
  parts.push(
    `<p><a href="/book?tour=${escapeHtml(slug)}">${he ? "הזמינו את היום הזה" : "Book this day"}</a></p>`
  );
  return `<section>${parts.join("")}</section>`;
}

/** The six day tours with what each day is about (no prices: see tests). */
export function toursListBody(lang: Lang): string {
  const he = lang === "he";
  const items = WIRO_TOUR_CATALOG.map(tour => {
    const story = WIRO_TOUR_STORIES.find(s => s.slug === tour.slug);
    const name = he ? tour.nameHe : tour.name;
    const duration = he
      ? (DURATION_HE[tour.duration] ?? tour.duration)
      : tour.duration;
    const text = story ? pick(lang, story.desc) : tour.highlights.join(", ");
    return `<li><h3><a href="/tours/${escapeHtml(tour.slug)}">${escapeHtml(name)}</a></h3><p>${escapeHtml(text)}</p><p>${escapeHtml(duration)} · ${escapeHtml(pick(lang, DIFFICULTY_LABEL[tour.difficulty]))}</p></li>`;
  }).join("");
  return `<section><h2>${he ? "טיולי יום פרטיים מצ׳יאנג מאי" : "Private day tour routes from Chiang Mai"}</h2><ul>${items}</ul></section>`;
}

export function faqBody(lang: Lang): string {
  const he = lang === "he";
  return `<section>${FAQ_ITEMS.map(
    item =>
      `<h2>${escapeHtml(he ? item.questionHe : item.questionEn)}</h2><p>${escapeHtml(he ? item.answerHe : item.answerEn)}</p>`
  ).join("")}</section>`;
}

/** Kosher / Hebrew guide / family landing pages, from their shared copy. */
export function commercialBody(path: string, lang: Lang): string {
  const page = Object.values(COMMERCIAL_LANDING_CONTENT).find(
    c => c.paths.en === path || c.paths.he === path
  );
  if (!page) return "";
  const he = lang === "he";
  const c = (copy: LocalizedCopy) => escapeHtml(he ? copy.he : copy.en);
  const list = (items: LocalizedCopy[]) =>
    `<ul>${items.map(i => `<li>${c(i)}</li>`).join("")}</ul>`;
  const facts: [string, LocalizedCopy][] = [
    [he ? "משך" : "Duration", page.duration],
    [he ? "איסוף" : "Pickup", page.pickup],
    [he ? "גודל קבוצה" : "Group size", page.groupSize],
    [he ? "למשפחות" : "Families", page.familySuitability],
  ];
  const planning = page.planningSection;
  return `<section><p>${c(page.intro)}</p><p>${c(page.audience)}</p><dl>${facts
    .map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${c(v)}</dd>`)
    .join("")}</dl><p>${c(page.planningBoundary)}</p><h2>${
    he ? "איך נראה היום" : "How the day runs"
  }</h2><ol>${page.itinerary
    .map(step => `<li><strong>${c(step.title)}</strong> ${c(step.detail)}</li>`)
    .join(
      ""
    )}</ol><h2>${he ? "כלול" : "Included"}</h2>${list(page.included)}<h2>${
    he ? "לא כלול" : "Not included"
  }</h2>${list(page.excluded)}${
    planning ? `<h2>${c(planning.title)}</h2><p>${c(planning.body)}</p>` : ""
  }<h2>${he ? "טיולים קשורים" : "Related tours"}</h2><ul>${page.relatedTours
    .map(r => `<li><a href="${escapeHtml(r.href)}">${c(r.label)}</a></li>`)
    .join("")}</ul></section>`;
}

type Copy = { en: string; he: string };
const tx = (lang: Lang, copy: Copy) =>
  escapeHtml(lang === "he" ? copy.he : copy.en);

/** Motorcycle hub: the trip options day by day plus highlights. */
export function motorcycleToursBody(lang: Lang): string {
  const he = lang === "he";
  return `<section>${MOTORCYCLE_TOUR_OPTIONS.map(
    o =>
      `<h2>${tx(lang, o.title)}</h2><p>${tx(lang, o.summary)}</p><p>${tx(lang, o.meta)}</p><ul>${o.details
        .map(d => `<li>${tx(lang, d)}</li>`)
        .join("")}</ul>`
  ).join(
    ""
  )}<h2>${he ? "נקודות עיקריות בדרך" : "Highlights on the way"}</h2><ul>${MOTORCYCLE_HIGHLIGHTS.map(
    h => `<li>${tx(lang, h)}</li>`
  ).join(
    ""
  )}</ul><p><a href="/motorcycle-tours/samoeng-loop">${he ? "מדריך לולאת סמואנג" : "Samoeng Loop route guide"}</a> · <a href="/motorcycle-tours/mae-hong-son-loop">${he ? "מדריך לולאת מאה הונג סון" : "Mae Hong Son Loop guide"}</a></p></section>`;
}

/** Samoeng Loop guide: route stages and every saved place. */
export function samoengBody(lang: Lang): string {
  const he = lang === "he";
  const categories = new Map(
    SAMOENG_CATEGORIES.map(c => [c.id, c.label] as const)
  );
  return `<section><h2>${he ? "המסלול, שלב אחר שלב" : "The route, stage by stage"}</h2><ol>${SAMOENG_ROUTE_STAGES.map(
    s =>
      `<li><strong>${tx(lang, s.name)}</strong> ${tx(lang, s.description)}</li>`
  ).join(
    ""
  )}</ol><h2>${he ? "מקומות לעצור בהם" : "Places to stop"}</h2><ul>${SAMOENG_ATTRACTIONS.map(
    a => {
      const cat = categories.get(a.category);
      return `<li><strong>${escapeHtml(a.name)}</strong>${cat ? ` (${tx(lang, cat)})` : ""}: ${tx(lang, a.description)}</li>`;
    }
  ).join("")}</ul></section>`;
}

/** Mae Hong Son Loop guide: stages, paces, highlights and vehicle notes. */
export function maeHongSonBody(lang: Lang): string {
  const he = lang === "he";
  const notes = (
    Object.keys(MAE_HONG_SON_VEHICLE_NOTES) as Array<
      keyof typeof MAE_HONG_SON_VEHICLE_NOTES
    >
  )
    .map(
      v =>
        `<h3>${v === "4x4" ? "4x4" : he ? "אופנוע" : "Motorcycle"}</h3><ul>${MAE_HONG_SON_VEHICLE_NOTES[
          v
        ]
          .map(n => `<li>${tx(lang, n)}</li>`)
          .join("")}</ul>`
    )
    .join("");
  return `<section><h2>${he ? "שלבי הלולאה" : "The loop, stage by stage"}</h2><ol>${MAE_HONG_SON_STAGES.map(
    s =>
      `<li><strong>${tx(lang, s.name)}</strong> (${tx(lang, s.route)}): ${tx(lang, s.description)}</li>`
  ).join(
    ""
  )}</ol><h2>${he ? "4, 5 או 6 ימים" : "4, 5 or 6 days"}</h2>${MAE_HONG_SON_PACES.map(
    p =>
      `<h3>${tx(lang, p.label)}: ${tx(lang, p.eyebrow)}</h3><p>${tx(lang, p.summary)}</p><ol>${p.days
        .map(d => `<li>${tx(lang, d)}</li>`)
        .join("")}</ol>`
  ).join(
    ""
  )}<h2>${he ? "מה לראות בדרך" : "What to see on the way"}</h2><ul>${MAE_HONG_SON_HIGHLIGHTS.map(
    h =>
      `<li><strong>${tx(lang, h.name)}</strong>: ${tx(lang, h.description)}</li>`
  ).join(
    ""
  )}</ul><h2>${he ? "אופנוע או 4x4" : "Motorcycle or 4x4"}</h2>${notes}</section>`;
}

/** Contact: the same channels the page lists. */
export function contactBody(lang: Lang): string {
  const he = lang === "he";
  return `<section><ul><li>${he ? "וואטסאפ / טלפון" : "WhatsApp / phone"}: <a href="tel:${escapeHtml(COMPANY_PHONE.replace(/\s/g, ""))}">${escapeHtml(COMPANY_PHONE)}</a></li><li>${he ? "אימייל" : "Email"}: <a href="mailto:${escapeHtml(COMPANY_EMAIL)}">${escapeHtml(COMPANY_EMAIL)}</a></li><li>${he ? "מיקום: צ׳יאנג מאי, תאילנד" : "Location: Chiang Mai, Thailand"}</li></ul></section>`;
}

/** Reviews page: the dated Tripadvisor snapshot and verbatim excerpts. */
export function reviewsBody(lang: Lang): string {
  const he = lang === "he";
  const { rating, reviewCount, checkedOn } = TRIPADVISOR_REVIEW_SNAPSHOT;
  const intro = he
    ? `דירוג ${rating} ב-Tripadvisor מתוך ${reviewCount} ביקורות ציבוריות (נבדק ${checkedOn}).`
    : `Rated ${rating} on Tripadvisor from ${reviewCount} public reviews (checked ${checkedOn}).`;
  const items = TRIPADVISOR_REVIEWS.map(
    r =>
      `<li><blockquote cite="${escapeHtml(r.url)}"><p>${escapeHtml(r.excerpt)}</p></blockquote><p><a href="${escapeHtml(r.url)}">${escapeHtml(r.title)}</a>, ${escapeHtml(r.author)}, ${escapeHtml(r.visited)}</p></li>`
  ).join("");
  return `<section><p>${escapeHtml(intro)} <a href="${escapeHtml(COMPANY_TRIPADVISOR_URL)}">${he ? "לכל הביקורות ב-Tripadvisor" : "Read every review on Tripadvisor"}</a></p><ul>${items}</ul></section>`;
}
