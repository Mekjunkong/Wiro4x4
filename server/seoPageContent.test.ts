import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { injectPageContent } from "./seoPageContent";
import {
  renderStaticRouteHtml,
  resolveDynamicMeta,
  injectMeta,
} from "./seoMiddleware";
import { WIRO_TOUR_CATALOG } from "../shared/wiroTourCatalog";

const shell = readFileSync("client/index.html", "utf8");

describe("initial HTML available without JavaScript", () => {
  it("provides readable tour content and all six crawlable route links", () => {
    const html = renderStaticRouteHtml(shell, "/tours")!;
    expect(html).toContain("<h1>Chiang Mai 4x4 Tours</h1>");
    expect(html).not.toContain('<h1 class="sr-only">');
    for (const tour of WIRO_TOUR_CATALOG) {
      expect(html).toContain(`href="/tours/${tour.slug}"`);
    }
    // /tours renders without a DB lookup, so it must not state prices that
    // could contradict the live ones.
    expect(html).not.toMatch(/priceCurrency|฿|\$\d/);
    expect(html).toContain('src="/src/main.tsx"');
  });

  it("serves Hebrew content, reciprocal links and the Hebrew social locale", () => {
    const html = renderStaticRouteHtml(shell, "/he/kosher-tours-chiang-mai")!;
    expect(html).toContain('lang="he" dir="rtl"');
    expect(html).toContain(
      "<h1>טיולי ג׳יפים ידידותיים לכשרות בצ׳יאנג מאי</h1>"
    );
    expect(html).toContain('property="og:locale" content="he_IL"');
    expect(html).toContain(
      'hreflang="en" href="https://www.wiro4x4indochina.com/kosher-tours"'
    );
    expect(html).toContain('href="/he/hebrew-guide-chiang-mai"');
    expect(html).toContain('href="/motorcycle-tours/mae-hong-son-loop"');
    expect(html).toContain("מדריך ללולאת מאה הונג סון");
  });

  it("exposes the Mae Hong Son guide in English fallback navigation", () => {
    const html = renderStaticRouteHtml(shell, "/motorcycle-tours")!;

    expect(html).toContain('href="/motorcycle-tours/mae-hong-son-loop"');
    expect(html).toContain("Mae Hong Son Loop motorcycle and 4x4 guide");
  });

  it("preserves route content when the tour database is unavailable", async () => {
    const meta = await resolveDynamicMeta(
      "/tours/doi-inthanon-roof-of-thailand",
      {
        loadTourBySlug: async () => {
          throw new Error("database unavailable");
        },
      }
    );
    expect(meta).not.toBeNull();
    const html = injectMeta(shell, meta!);
    expect(html).toMatch(/<h1>[^<]*Doi Inthanon/);
    expect(html).toContain('href="/contact"');
  });

  it("escapes database text and replaces previous fallback content on repeat rendering", () => {
    const page = {
      title: '<img src=x onerror="alert(1)">',
      description: "A & B <script>alert(1)</script>",
      canonicalPath: "/tours/example",
    };
    const first = injectPageContent(shell, page);
    const second = injectPageContent(first, {
      ...page,
      title: "Another route",
    });
    expect(first).toContain("&lt;script&gt;");
    expect(first).not.toContain("<img src=x");
    expect(second.match(/<main /g)).toHaveLength(1);
    expect(second).toContain("<h1>Another route</h1>");
    expect(second).not.toContain("&lt;img src=x");
  });

  it("gives crawlers the full tour day: facts, itinerary, booking link, no price", async () => {
    const meta = await resolveDynamicMeta("/tours/mae-kampong-hidden-village", {
      loadTourBySlug: async () => {
        throw new Error("database unavailable");
      },
    });
    const html = injectMeta(shell, meta!);
    expect(html).toContain("The day, hour by hour");
    expect(html).toContain("On request, private group");
    expect(html).toContain('href="/book?tour=mae-kampong-hidden-village"');
    // Public prices are hidden, so neither the body nor JSON-LD may state one.
    expect(html).not.toMatch(/priceCurrency|"price"|฿/);
    expect(html).toContain('property="og:type" content="product"');
  });

  it("never leaks the database price to crawlers", async () => {
    const meta = await resolveDynamicMeta("/tours/mae-kampong-hidden-village", {
      loadTourBySlug: async () =>
        ({
          name: "Mae Kampong — Hidden Mountain Village",
          price: 3900,
          description: "DB **story** line",
        }) as never,
    });
    const html = injectMeta(shell, meta!);
    expect(html).not.toContain("3,900");
    expect(html).not.toContain('"price":3900');
    expect(html).toContain("<strong>story</strong>");
  });

  it("renders a hardcoded blog article body for crawlers", async () => {
    const meta = await resolveDynamicMeta("/blog/mae-kampong-or-samoeng", {
      loadBlogPostBySlug: async () => undefined,
    });
    const html = injectMeta(shell, meta!);
    const words = html
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/).length;
    expect(html).toContain("<article>");
    expect(words).toBeGreaterThan(400);
  });

  it("renders the FAQ questions and answers", () => {
    const html = renderStaticRouteHtml(shell, "/faq")!;
    expect(html).toContain("What is your cancellation policy?");
  });

  it("renders the motorcycle route guides from their shared data", () => {
    const hub = renderStaticRouteHtml(shell, "/motorcycle-tours")!;
    expect(hub).toContain("Ride Beyond Borders");
    const samoeng = renderStaticRouteHtml(
      shell,
      "/motorcycle-tours/samoeng-loop"
    )!;
    expect(samoeng).toContain("Chiang Mai to Mae Rim");
    const mhs = renderStaticRouteHtml(
      shell,
      "/motorcycle-tours/mae-hong-son-loop"
    )!;
    expect(mhs).toContain("Mae Sariang");
    expect(mhs).toContain("Motorcycle or 4x4");
  });

  it("serves Hebrew tour pages with Hebrew content and reciprocal hreflang", async () => {
    const fail = async () => {
      throw new Error("database unavailable");
    };
    const he = injectMeta(
      shell,
      (await resolveDynamicMeta("/he/tours/mae-kampong-hidden-village", {
        loadTourBySlug: fail,
      }))!
    );
    expect(he).toContain('lang="he" dir="rtl"');
    expect(he).toMatch(/<h1>[^<]*מאה קמפונג/);
    expect(he).toContain("היום, שעה אחר שעה");
    expect(he).toContain(
      'rel="canonical" href="https://www.wiro4x4indochina.com/he/tours/mae-kampong-hidden-village"'
    );
    expect(he).toContain(
      'hreflang="en" href="https://www.wiro4x4indochina.com/tours/mae-kampong-hidden-village"'
    );

    const en = injectMeta(
      shell,
      (await resolveDynamicMeta("/tours/mae-kampong-hidden-village", {
        loadTourBySlug: fail,
      }))!
    );
    expect(en).toContain(
      'hreflang="he" href="https://www.wiro4x4indochina.com/he/tours/mae-kampong-hidden-village"'
    );
    expect(
      await resolveDynamicMeta("/he/tours/not-a-tour", { loadTourBySlug: fail })
    ).toBeNull();
  });
});
