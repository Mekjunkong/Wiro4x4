import { test, expect } from "@playwright/test";

const commercialRoutes = [
  {
    hebrewPath: "/he/kosher-tours-chiang-mai",
    englishPath: "/kosher-tours",
    h1: "טיולים כשרים בצ׳אנג מאי",
    title: "טיולים כשרים בצ׳אנג מאי למשפחות",
  },
  {
    hebrewPath: "/he/hebrew-guide-chiang-mai",
    englishPath: "/hebrew-guide",
    h1: "מדריך דובר עברית בצ׳אנג מאי",
    title: "מדריך דובר עברית בצ׳אנג מאי לטיולים פרטיים",
  },
  {
    hebrewPath: "/he/private-family-tours-chiang-mai",
    englishPath: "/private-family-tours",
    h1: "טיולי 4x4 פרטיים למשפחות בצ׳אנג מאי",
    title: "טיולי 4x4 פרטיים למשפחות בצ׳אנג מאי",
  },
] as const;

const allCommercialRoutes = [
  {
    path: "/kosher-tours",
    h1: "Kosher-Friendly Tours in Chiang Mai",
    included: "Included",
  },
  {
    path: "/hebrew-guide",
    h1: "Hebrew-Speaking Guide in Chiang Mai",
    included: "Included",
  },
  {
    path: "/private-family-tours",
    h1: "Private Family 4x4 Tours in Chiang Mai",
    included: "Included",
  },
  ...commercialRoutes.map(route => ({
    path: route.hebrewPath,
    h1: route.h1,
    included: "מה כלול",
  })),
] as const;

test.describe("Hebrew commercial routes", () => {
  for (const route of commercialRoutes) {
    test(`${route.hebrewPath} renders Hebrew before any English heading`, async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.setItem("wiro-preferred-language", "en");
        const firstRender: { h1?: string; lang?: string; dir?: string } = {};
        Object.defineProperty(window, "__wiroFirstCommercialRender", {
          value: firstRender,
          writable: false,
        });
        new MutationObserver(() => {
          if (firstRender.h1) return;
          const heading = document.querySelector("main h1");
          if (!heading) return;
          firstRender.h1 = heading.textContent?.trim();
          firstRender.lang = document.documentElement.lang;
          firstRender.dir = document.documentElement.dir;
        }).observe(document, { childList: true, subtree: true });
      });

      await page.goto(route.hebrewPath);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        route.h1
      );
      await expect(page.locator("html")).toHaveAttribute("lang", "he");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(
        page
          .getByRole("navigation", { name: "Breadcrumb" })
          .getByRole("link", { name: "דף הבית", exact: true })
      ).toBeVisible();

      const firstRender = await page.evaluate(
        () =>
          (
            window as Window & {
              __wiroFirstCommercialRender?: {
                h1?: string;
                lang?: string;
                dir?: string;
              };
            }
          ).__wiroFirstCommercialRender
      );
      expect(firstRender).toEqual({
        h1: route.h1,
        lang: "he",
        dir: "rtl",
      });
    });

    test(`${route.hebrewPath} has unique reciprocal metadata`, async ({
      page,
    }) => {
      await page.goto(route.hebrewPath);

      await expect(page).toHaveTitle(new RegExp(`^${route.title}`));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        /[א-ת]/
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://www.wiro4x4indochina.com${route.hebrewPath}`
      );
      await expect(
        page.locator('link[rel="alternate"][hreflang="he"]')
      ).toHaveAttribute(
        "href",
        `https://www.wiro4x4indochina.com${route.hebrewPath}`
      );
      await expect(
        page.locator('link[rel="alternate"][hreflang="en"]')
      ).toHaveAttribute(
        "href",
        `https://www.wiro4x4indochina.com${route.englishPath}`
      );
      await expect(
        page.locator('link[rel="alternate"][hreflang="x-default"]')
      ).toHaveAttribute(
        "href",
        `https://www.wiro4x4indochina.com${route.englishPath}`
      );
    });
  }

  test("an English preference is restored after client navigation from Hebrew", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("wiro-preferred-language", "en");
    });
    await page.goto("/he/private-family-tours-chiang-mai");

    await page.getByRole("link", { name: "העמוד באנגלית" }).click();

    await expect(page).toHaveURL(/\/private-family-tours$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Private Family 4x4 Tours in Chiang Mai"
    );
  });
});

test.describe("English commercial routes", () => {
  for (const route of allCommercialRoutes.slice(0, 3)) {
    test(`${route.path} forces English before paint for a stored Hebrew preference`, async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.setItem("wiro-preferred-language", "he");
        const firstRender: { h1?: string; lang?: string; dir?: string } = {};
        Object.defineProperty(window, "__wiroFirstCommercialRender", {
          value: firstRender,
          writable: false,
        });
        new MutationObserver(() => {
          if (firstRender.h1) return;
          const heading = document.querySelector("main h1");
          if (!heading) return;
          firstRender.h1 = heading.textContent?.trim();
          firstRender.lang = document.documentElement.lang;
          firstRender.dir = document.documentElement.dir;
        }).observe(document, { childList: true, subtree: true });
      });

      await page.goto(route.path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        route.h1
      );
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
      await expect(page).toHaveTitle(/\| WIRO 4x4 Kosher Adventures$/);

      const firstRender = await page.evaluate(
        () =>
          (
            window as Window & {
              __wiroFirstCommercialRender?: {
                h1?: string;
                lang?: string;
                dir?: string;
              };
            }
          ).__wiroFirstCommercialRender
      );
      expect(firstRender).toEqual({
        h1: route.h1,
        lang: "en",
        dir: "ltr",
      });
    });
  }

  test("a Hebrew preference is restored after client navigation to an unrelated route", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("wiro-preferred-language", "he");
    });
    await page.goto("/private-family-tours");

    await page
      .getByRole("link", { name: "View the real trip gallery" })
      .click();

    await expect(page).toHaveURL(/\/gallery$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "he");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });
});

test.describe("SPA page metadata ownership", () => {
  test("removes a route-owned og locale after leaving a localized route", async ({
    page,
  }) => {
    await page.goto("/he/private-family-tours-chiang-mai");
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "he_IL"
    );

    await page.getByRole("link", { name: "גלריית טיולים אמיתית" }).click();

    await expect(page).toHaveURL(/\/gallery$/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveCount(0);
  });

  test("restores a server-owned og locale after leaving a localized route", async ({
    page,
  }) => {
    await page.route("**/he/private-family-tours-chiang-mai", async route => {
      const response = await route.fetch();
      const body = (await response.text()).replace(
        "</head>",
        '<meta property="og:locale" content="en_GB" data-server-owned="true"></head>'
      );
      await route.fulfill({ response, body });
    });

    await page.goto("/he/private-family-tours-chiang-mai");
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "he_IL"
    );

    await page.getByRole("link", { name: "גלריית טיולים אמיתית" }).click();

    await expect(page).toHaveURL(/\/gallery$/);
    await expect(
      page.locator('meta[property="og:locale"][data-server-owned="true"]')
    ).toHaveAttribute("content", "en_GB");
  });
});

test.describe("Commercial route dossiers", () => {
  for (const route of allCommercialRoutes) {
    test(`${route.path} exposes one primary inquiry and concrete planning details`, async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.setItem("wiro-preferred-language", "en");
      });
      await page.goto(route.path);

      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.locator("main h1")).toHaveText(route.h1);
      const geometry = await page.evaluate(() => ({
        headerBottom: document.querySelector("header")!.getBoundingClientRect()
          .bottom,
        breadcrumbTop: document
          .querySelector('nav[aria-label="Breadcrumb"] ol')!
          .getBoundingClientRect().top,
      }));
      expect(geometry.breadcrumbTop).toBeGreaterThanOrEqual(
        geometry.headerBottom - 0.5
      );
      await expect(page.locator('main a[href*="wa.me"]')).toHaveCount(1);
      await expect(page.locator('main a[href*="wa.me"] button')).toHaveCount(0);
      await expect(
        page.getByRole("heading", { name: route.included, exact: true })
      ).toBeVisible();
      await expect(page.locator("main")).toContainText("3,500");
      await expect(page.locator("main img").first()).toHaveJSProperty(
        "complete",
        true
      );
    });
  }

  test("all six routes have unique metadata and reciprocal alternates", async ({
    page,
  }) => {
    const pairs = commercialRoutes.map(route => ({
      en: route.englishPath,
      he: route.hebrewPath,
    }));
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const pair of pairs) {
      for (const language of ["en", "he"] as const) {
        await page.goto(pair[language]);
        await expect(page.locator("html")).toHaveAttribute("lang", language);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          "href",
          `https://www.wiro4x4indochina.com${pair[language]}`
        );
        await expect(
          page.locator('link[rel="alternate"][hreflang="en"]')
        ).toHaveAttribute("href", `https://www.wiro4x4indochina.com${pair.en}`);
        await expect(
          page.locator('link[rel="alternate"][hreflang="he"]')
        ).toHaveAttribute("href", `https://www.wiro4x4indochina.com${pair.he}`);

        titles.add(await page.title());
        descriptions.add(
          (await page
            .locator('meta[name="description"]')
            .getAttribute("content")) ?? ""
        );
      }
    }

    expect(titles.size).toBe(6);
    expect(descriptions.size).toBe(6);
  });

  for (const route of [
    {
      path: "/private-family-tours",
      language: "en",
      galleryLabel: "View the real trip gallery",
      reviewsLabel: "Read public guest reviews",
    },
    {
      path: "/he/private-family-tours-chiang-mai",
      language: "he",
      galleryLabel: "גלריית טיולים אמיתית",
      reviewsLabel: "ביקורות אורחים ציבוריות",
    },
  ] as const) {
    test(`${route.path} tracks each dossier proof link once before navigation`, async ({
      page,
    }) => {
      const captured: Array<{
        eventName: string;
        options: { props?: Record<string, unknown> };
      }> = [];
      await page.exposeFunction(
        "capturePlausibleEvent",
        (eventName: string, options: { props?: Record<string, unknown> }) => {
          captured.push({ eventName, options });
        }
      );
      await page.addInitScript(() => {
        Object.defineProperty(window, "plausible", {
          configurable: true,
          value: (eventName: string, options: unknown) => {
            void (
              window as Window & {
                capturePlausibleEvent: (
                  name: string,
                  detail: unknown
                ) => Promise<void>;
              }
            ).capturePlausibleEvent(eventName, options);
          },
        });
      });

      await page.goto(route.path);
      await page.getByRole("link", { name: route.galleryLabel }).click();
      await expect(page).toHaveURL(/\/gallery$/);
      await expect
        .poll(() => captured.filter(event => event.eventName === "proof_open"))
        .toHaveLength(1);

      await page.goto(route.path);
      await page.getByRole("link", { name: route.reviewsLabel }).click();
      await expect(page).toHaveURL(/\/reviews$/);
      await expect
        .poll(() => captured.filter(event => event.eventName === "proof_open"))
        .toHaveLength(2);

      expect(
        captured.filter(event => event.eventName === "proof_open")
      ).toEqual([
        {
          eventName: "proof_open",
          options: {
            props: {
              page: route.path,
              placement: "dossier-gallery",
              language: route.language,
            },
          },
        },
        {
          eventName: "proof_open",
          options: {
            props: {
              page: route.path,
              placement: "dossier-reviews",
              language: route.language,
            },
          },
        },
      ]);
    });
  }
});

test.describe("Language Switching", () => {
  test.skip(
    ({ isMobile }) => isMobile,
    "Language switcher is in a mobile menu that is unreliable to open in headless CI; desktop Chrome covers this flow"
  );

  test("should display language switcher button", async ({ page }) => {
    await page.goto("/");

    // On desktop, language switcher is in the header nav
    // On mobile, it might be in the mobile menu or directly visible
    const langSwitcher = page.getByRole("button", {
      name: /switch language/i,
    });

    // On mobile, we may need to open the menu first
    if (!(await langSwitcher.isVisible({ timeout: 2000 }).catch(() => false))) {
      // Try opening mobile menu
      const menuButton = page.getByRole("button", { name: /toggle menu/i });
      if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await menuButton.click();
        await page.waitForTimeout(500);
      }
    }

    await expect(langSwitcher.first()).toBeVisible();
  });

  test("should update document language attribute when switching", async ({
    page,
  }) => {
    await page.goto("/");

    // Initially English
    const initialLang = await page.locator("html").getAttribute("lang");
    expect(initialLang).toBe("en");

    // Find the language switcher (may need to open mobile menu first)
    let langSwitcher = page.getByRole("button", {
      name: /switch language to hebrew/i,
    });

    if (!(await langSwitcher.isVisible({ timeout: 2000 }).catch(() => false))) {
      const menuButton = page.getByRole("button", { name: /toggle menu/i });
      if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await menuButton.click();
        await page.waitForTimeout(500);
      }
      langSwitcher = page.getByRole("button", {
        name: /switch language to hebrew/i,
      });
    }

    await langSwitcher.click();

    // Document lang should update to Hebrew
    const newLang = await page.locator("html").getAttribute("lang");
    expect(newLang).toBe("he");
  });

  test("should switch back to English from Hebrew", async ({ page }) => {
    await page.goto("/");

    // Helper to find and click language switcher
    async function clickLangSwitcher(name: RegExp) {
      let switcher = page.getByRole("button", { name });
      if (!(await switcher.isVisible({ timeout: 2000 }).catch(() => false))) {
        const menuButton = page.getByRole("button", {
          name: /toggle menu/i,
        });
        if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await menuButton.click();
          await page.waitForTimeout(500);
        }
        switcher = page.getByRole("button", { name });
      }
      await switcher.click();
    }

    // Switch to Hebrew
    await clickLangSwitcher(/switch language to hebrew/i);

    const hebrewLang = await page.locator("html").getAttribute("lang");
    expect(hebrewLang).toBe("he");

    // Switch back to English
    await clickLangSwitcher(/switch language to english/i);

    const englishLang = await page.locator("html").getAttribute("lang");
    expect(englishLang).toBe("en");
  });

  test("should persist language on navigation", async ({ page }) => {
    await page.goto("/");

    // Find and click language switcher to Hebrew
    let langSwitcher = page.getByRole("button", {
      name: /switch language to hebrew/i,
    });
    if (!(await langSwitcher.isVisible({ timeout: 2000 }).catch(() => false))) {
      const menuButton = page.getByRole("button", { name: /toggle menu/i });
      if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await menuButton.click();
        await page.waitForTimeout(500);
      }
      langSwitcher = page.getByRole("button", {
        name: /switch language to hebrew/i,
      });
    }

    await langSwitcher.click();

    // Navigate to pricing
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");

    // Language should still be Hebrew
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("he");
  });
});

// Desktop-only language test that checks nav text changes
test.describe("Language Switching - Desktop Nav", () => {
  test.skip(
    ({ isMobile }) => isMobile,
    "Desktop navigation is hidden on mobile"
  );

  test("should switch nav text from English to Hebrew", async ({ page }) => {
    await page.goto("/");

    // Initially in English - nav should show "Tours"
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav.getByText("Tours")).toBeVisible();

    // Click language switcher
    const langSwitcher = page.getByRole("button", {
      name: /switch language to hebrew/i,
    });
    await langSwitcher.click();

    // After switching, English nav text should be gone
    await expect(nav.getByText("Tours")).not.toBeVisible();
  });
});
