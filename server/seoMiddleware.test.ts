import { describe, it, expect } from "vitest";
import {
  injectNoindex,
  isClientOnlyRoute,
  isContentSlugPath,
  absoluteUrl,
  truncateDescription,
  injectMeta,
  renderStaticRouteHtml,
  resolveDynamicMeta,
} from "./seoMiddleware";

const SITE_URL = "https://www.wiro4x4indochina.com";
const commercialRoutes = [
  {
    path: "/kosher-tours",
    language: "en",
    direction: "ltr",
    title: "Kosher-Friendly Tours in Chiang Mai for Families",
    description:
      "Plan a private kosher-friendly 4x4 tour from Chiang Mai with realistic meal logistics, Shabbat-aware timing, and Hebrew or English support.",
    en: "/kosher-tours",
    he: "/he/kosher-tours-chiang-mai",
  },
  {
    path: "/he/kosher-tours-chiang-mai",
    language: "he",
    direction: "rtl",
    title: "טיולים כשרים בצ׳אנג מאי למשפחות",
    description:
      "תכננו טיול 4x4 פרטי וידידותי לכשרות מצ׳אנג מאי, עם לוגיסטיקת אוכל מציאותית, תזמון שמתחשב בשבת ותמיכה בעברית.",
    en: "/kosher-tours",
    he: "/he/kosher-tours-chiang-mai",
  },
  {
    path: "/hebrew-guide",
    language: "en",
    direction: "ltr",
    title: "Hebrew-Speaking Guide in Chiang Mai for Private Tours",
    description:
      "Check a Hebrew-speaking guide for a private Chiang Mai 4x4 tour, with family-paced routes and kosher-aware planning when requested.",
    en: "/hebrew-guide",
    he: "/he/hebrew-guide-chiang-mai",
  },
  {
    path: "/he/hebrew-guide-chiang-mai",
    language: "he",
    direction: "rtl",
    title: "מדריך דובר עברית בצ׳אנג מאי לטיולים פרטיים",
    description:
      "בדקו זמינות של מדריך דובר עברית לטיול 4x4 פרטי בצ׳אנג מאי, עם מסלולים בקצב משפחתי ותכנון כשרות לפי הצורך.",
    en: "/hebrew-guide",
    he: "/he/hebrew-guide-chiang-mai",
  },
  {
    path: "/private-family-tours",
    language: "en",
    direction: "ltr",
    title: "Private Family 4x4 Tours in Chiang Mai",
    description:
      "Compare private family 4x4 routes from Chiang Mai with flexible pacing, hotel pickup, clear inclusions, and English or Hebrew planning.",
    en: "/private-family-tours",
    he: "/he/private-family-tours-chiang-mai",
  },
  {
    path: "/he/private-family-tours-chiang-mai",
    language: "he",
    direction: "rtl",
    title: "טיולי 4x4 פרטיים למשפחות בצ׳אנג מאי",
    description:
      "השוו מסלולי 4x4 פרטיים למשפחות מצ׳אנג מאי, עם קצב גמיש, איסוף מהמלון, פירוט ברור ותכנון בעברית או באנגלית.",
    en: "/private-family-tours",
    he: "/he/private-family-tours-chiang-mai",
  },
] as const;

describe("seoMiddleware route classification", () => {
  it("flags auth and transactional SPA routes as client-only (noindex, 200)", () => {
    expect(isClientOnlyRoute("/login")).toBe(true);
    expect(isClientOnlyRoute("/register")).toBe(true);
    expect(isClientOnlyRoute("/forgot-password")).toBe(true);
    expect(isClientOnlyRoute("/booking/success")).toBe(true);
    expect(isClientOnlyRoute("/booking/cancel")).toBe(true);
    expect(isClientOnlyRoute("/admin")).toBe(true);
    expect(isClientOnlyRoute("/admin/cost-calculator")).toBe(true);
    expect(isClientOnlyRoute("/album/abc123")).toBe(true);
    expect(isClientOnlyRoute("/404")).toBe(true);
  });

  it("does not flag marketing pages or content slugs as client-only", () => {
    expect(isClientOnlyRoute("/")).toBe(false);
    expect(isClientOnlyRoute("/tours")).toBe(false);
    expect(isClientOnlyRoute("/tours/doi-inthanon-roof-of-thailand")).toBe(
      false
    );
    expect(isClientOnlyRoute("/kosher-tours")).toBe(false);
    // Prefix must not over-match
    expect(isClientOnlyRoute("/administrator")).toBe(false);
  });

  it("recognizes content slug shapes for tours, packages, and blog", () => {
    expect(isContentSlugPath("/tours/some-tour")).toBe(true);
    expect(isContentSlugPath("/packages/northern-thailand-3d2n")).toBe(true);
    expect(isContentSlugPath("/blog/kosher-food-chiang-mai")).toBe(true);
    expect(isContentSlugPath("/tours")).toBe(false);
    expect(isContentSlugPath("/random-page")).toBe(false);
    expect(isContentSlugPath("/tours/UPPER_case!")).toBe(false);
  });
});

describe("injectNoindex", () => {
  it("replaces the index,follow robots meta with noindex", () => {
    const html = `<head><meta name="robots" content="index, follow" /></head>`;
    const result = injectNoindex(html);
    expect(result).toContain(
      '<meta name="robots" content="noindex, nofollow" />'
    );
    expect(result).not.toContain('content="index, follow"');
  });
});

describe("SEO metadata helpers", () => {
  it.each([
    {
      path: "/tours/doi-inthanon-roof-of-thailand",
      title:
        "Private Doi Inthanon Tour from Chiang Mai — Roof of Thailand 4x4",
    },
    {
      path: "/tours/mae-wang-jungle-wilderness",
      title: "Mae Wang Jungle 4x4 Adventure — Private Tour from Chiang Mai",
    },
  ])("uses the shared tour override for $path", async ({ path, title }) => {
    const meta = await resolveDynamicMeta(path, {
      loadTourBySlug: async () => undefined,
    });

    expect(meta).toMatchObject({
      canonicalPath: path,
      title,
    });
  });

  it("keeps generic tour metadata for non-overridden routes", async () => {
    const meta = await resolveDynamicMeta(
      "/tours/mae-kampong-hidden-village",
      { loadTourBySlug: async () => undefined }
    );

    expect(meta).toMatchObject({
      canonicalPath: "/tours/mae-kampong-hidden-village",
      title:
        "Mae Kampong — Hidden Mountain Village — Chiang Mai 4x4 Tour",
    });
  });

  it("renders About and Tours structured data for crawlers", () => {
    const shell = `<html lang="en"><head>
      <title>App</title>
      <meta name="description" content="default" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="default" />
      <meta property="og:description" content="default" />
      <meta property="og:image" content="/default.jpg" />
      <meta property="og:url" content="https://example.com" />
      <meta name="twitter:title" content="default" />
      <meta name="twitter:description" content="default" />
      <meta name="twitter:image" content="/default.jpg" />
      <link rel="canonical" href="https://example.com" />
    </head></html>`;

    const about = renderStaticRouteHtml(shell, "/about");
    const tours = renderStaticRouteHtml(shell, "/tours");

    expect(about).toContain('"@type":"AboutPage"');
    expect(about).toContain('"@type":"Person"');
    expect(about).toContain(
      '<link rel="canonical" href="https://www.wiro4x4indochina.com/about" />'
    );
    expect(tours).toContain('"@type":"CollectionPage"');
    expect(tours).toContain('"name":"Chiang Mai 4x4 Tours"');
  });

  it("keeps core package metadata indexable when the database is unavailable", async () => {
    const meta = await resolveDynamicMeta("/packages/northern-thailand-3d2n", {
      loadPackageBySlug: async () => {
        throw new Error("database unavailable");
      },
    });

    expect(meta).toMatchObject({
      canonicalPath: "/packages/northern-thailand-3d2n",
      title: expect.stringContaining("Northern Thailand Mountain Loop"),
    });
  });

  it("keeps fallback blog posts indexable when the database is unavailable", async () => {
    const meta = await resolveDynamicMeta("/blog/off-road-adventure-guide", {
      loadBlogPostBySlug: async () => {
        throw new Error("database unavailable");
      },
    });

    expect(meta).toMatchObject({
      canonicalPath: "/blog/off-road-adventure-guide",
      title: "What to Expect on a 4x4 Off-Road Tour",
      ogType: "article",
    });
    expect(meta?.description).toContain("private Chiang Mai 4x4 tour");
  });

  it("does not invent a blog page for an unknown slug during a database outage", async () => {
    const meta = await resolveDynamicMeta("/blog/not-a-real-article", {
      loadBlogPostBySlug: async () => {
        throw new Error("database unavailable");
      },
    });

    expect(meta).toBeNull();
  });

  it("replaces one marked page JSON-LD script without duplicating baked organization data", () => {
    const shell = `<html lang="en"><head>
      <title>App</title>
      <meta name="description" content="default" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="default" />
      <meta property="og:description" content="default" />
      <meta property="og:image" content="/default.jpg" />
      <meta property="og:url" content="https://example.com" />
      <meta name="twitter:title" content="default" />
      <meta name="twitter:description" content="default" />
      <meta name="twitter:image" content="/default.jpg" />
      <link rel="canonical" href="https://example.com" />
      <script type="application/ld+json">{"@type":"Organization","name":"WIRO 4x4"}</script>
    </head></html>`;

    const first = renderStaticRouteHtml(shell, "/kosher-tours");
    expect(first).not.toBeNull();
    const second = renderStaticRouteHtml(first!, "/kosher-tours");

    expect(second).toBe(first);
    expect(second?.match(/id="page-json-ld"/g)).toHaveLength(1);
    expect(second?.match(/"@type":"Organization"/g)).toHaveLength(1);
    expect(second?.match(/type="application\/ld\+json"/g)).toHaveLength(2);
  });

  it("serializes hostile metadata without allowing JSON-LD script breakout", () => {
    const shell = `<html lang="en"><head>
      <title>App</title>
      <meta name="description" content="default" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="default" />
      <meta property="og:description" content="default" />
      <meta property="og:image" content="/default.jpg" />
      <meta property="og:url" content="https://example.com" />
      <meta name="twitter:title" content="default" />
      <meta name="twitter:description" content="default" />
      <meta name="twitter:image" content="/default.jpg" />
      <link rel="canonical" href="https://example.com" />
      <script type="application/ld+json">{"@type":"Organization"}</script>
    </head></html>`;
    const hostile = `tour</script><script id="injected">alert(1)</script>`;

    const html = injectMeta(shell, {
      title: hostile,
      description: hostile,
      canonicalPath: "/hostile",
      jsonLd: { "@type": "WebPage", name: hostile },
    });

    expect(html).not.toContain('<script id="injected">');
    expect(html).toContain(
      'tour\\u003c/script>\\u003cscript id=\\"injected\\"'
    );
    expect(html.match(/<script\b/g)).toHaveLength(2);
    expect(html.match(/<\/script>/g)).toHaveLength(2);
  });

  it("keeps each commercial search snippet unique", () => {
    expect(new Set(commercialRoutes.map(route => route.title)).size).toBe(6);
    expect(new Set(commercialRoutes.map(route => route.description)).size).toBe(
      6
    );
  });

  it("normalizes image URLs and keeps descriptions on word boundaries", () => {
    expect(absoluteUrl("/images/post.jpg")).toBe(
      "https://www.wiro4x4indochina.com/images/post.jpg"
    );
    expect(absoluteUrl("https://cdn.example.com/post.jpg")).toBe(
      "https://cdn.example.com/post.jpg"
    );
    expect(truncateDescription("one two three four", 13)).toBe("one two…");
  });

  it("injects absolute social images into the HTML shell", () => {
    const shell = `<html lang="en"><head>
      <title>App</title>
      <meta name="description" content="default" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="default" />
      <meta property="og:description" content="default" />
      <meta property="og:image" content="/default.jpg" />
      <meta property="og:url" content="https://example.com" />
      <meta name="twitter:title" content="default" />
      <meta name="twitter:description" content="default" />
      <meta name="twitter:image" content="/default.jpg" />
      <link rel="canonical" href="https://example.com" />
    </head></html>`;
    const result = injectMeta(shell, {
      title: "Post",
      description: "one two three four",
      ogImage: "/images/post.jpg",
      canonicalPath: "/blog/post",
    });

    expect(result).toContain(
      'property="og:image" content="https://www.wiro4x4indochina.com/images/post.jpg"'
    );
    expect(result).toContain(
      'name="twitter:image" content="https://www.wiro4x4indochina.com/images/post.jpg"'
    );
    expect(result).toContain('name="description" content="one two three four"');
  });

  it.each(commercialRoutes)(
    "renders crawlable, localized raw HTML for $path",
    route => {
      const shell = `<html lang="en"><head>
        <title>App</title>
        <meta name="description" content="default" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="default" />
        <meta property="og:description" content="default" />
        <meta property="og:image" content="/default.jpg" />
        <meta property="og:url" content="https://example.com" />
        <meta name="twitter:title" content="default" />
        <meta name="twitter:description" content="default" />
        <meta name="twitter:image" content="/default.jpg" />
        <link rel="canonical" href="https://example.com" />
      </head><body></body></html>`;

      const html = renderStaticRouteHtml(shell, route.path);

      expect(html).not.toBeNull();
      expect(html).toContain(
        `<title>${route.title} | WIRO 4x4 Kosher Adventures</title>`
      );
      expect(html).toContain(
        `<meta name="description" content="${route.description}" />`
      );
      expect(html).toContain('<meta name="robots" content="index, follow" />');
      expect(html).toContain(
        `<link rel="canonical" href="${SITE_URL}${route.path}" />`
      );
      expect(html).toContain(
        `<link rel="alternate" hreflang="en" href="${SITE_URL}${route.en}" />`
      );
      expect(html).toContain(
        `<link rel="alternate" hreflang="he" href="${SITE_URL}${route.he}" />`
      );
      expect(html).toContain(
        `<link rel="alternate" hreflang="x-default" href="${SITE_URL}${route.en}" />`
      );
      expect(html).toMatch(
        new RegExp(
          `<html(?=[^>]*lang="${route.language}")(?=[^>]*dir="${route.direction}")[^>]*>`
        )
      );
    }
  );

  it("keeps the English Hebrew-guide route explicitly English and LTR", () => {
    const shell = `<html lang="he" dir="rtl"><head>
      <title>App</title>
      <meta name="description" content="default" />
      <meta name="robots" content="index, follow" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="default" />
      <meta property="og:description" content="default" />
      <meta property="og:image" content="/default.jpg" />
      <meta property="og:url" content="https://example.com" />
      <meta name="twitter:title" content="default" />
      <meta name="twitter:description" content="default" />
      <meta name="twitter:image" content="/default.jpg" />
      <link rel="canonical" href="https://example.com" />
    </head></html>`;

    expect(renderStaticRouteHtml(shell, "/hebrew-guide")).toMatch(
      /<html(?=[^>]*lang="en")(?=[^>]*dir="ltr")[^>]*>/
    );
  });
});
