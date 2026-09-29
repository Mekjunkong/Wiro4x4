import { test, expect, type Page } from "@playwright/test";

async function prepareQuickActions(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent-accepted", "true");
    localStorage.setItem(
      "wiro_newsletter_dismissed",
      String(Date.now() + 86400000)
    );
  });
}

async function showHomeQuickActions(page: Page) {
  await prepareQuickActions(page);
  await page.goto("/");
  await expect(page.locator("#main-content")).toBeVisible();
  await page.evaluate(() => {
    window.scrollTo(0, 720);
    window.dispatchEvent(new Event("scroll"));
  });
}

async function openExploreMenu(page: Page) {
  const nav = page.locator('nav[aria-label="Main navigation"]');
  await nav.getByRole("button", { name: /explore/i }).click();
}

test.describe("Homepage", () => {
  test("should load and display the night-drive hero", async ({ page }) => {
    await page.goto("/");

    const hero = page.locator("main section").first();
    await expect(hero.getByRole("heading", { level: 1 })).toContainText(
      /journey in the North/i
    );
    // The banner is shown from the first frame; no scroll needed.
    await expect(hero.getByRole("heading", { level: 1 })).toBeInViewport();
  });

  test("renders the hero with WhatsApp first and routes second", async ({
    page,
  }) => {
    await page.goto("/");

    const hero = page.locator("main section").first();
    const whatsapp = hero.getByRole("link", { name: /plan with wiro/i });
    await expect(whatsapp).toHaveAttribute("href", /wa\.me/);
    await expect(whatsapp).toHaveAttribute("href", /HOME-HERO-EN/);
    await expect(
      hero.getByRole("link", { name: /explore the routes/i })
    ).toHaveAttribute("href", "#wx-trail-title");
    await expect(hero.getByRole("link")).toHaveCount(2);
    await expect(hero.getByRole("button")).toHaveCount(0);
  });

  test("skips the scroll zoom and video when reduced motion is requested", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const hero = page.locator("main section").first();
    await expect(hero.locator("video")).toHaveCount(0);
    await expect(hero.locator(".wx-night__end")).toHaveCSS("opacity", "1");
    await expect(
      hero.getByRole("link", { name: /plan with wiro/i })
    ).toBeVisible();
  });

  test("keeps the hero usable when the video and poster fail to load", async ({
    page,
  }) => {
    await page.route(/wiro-seedance/, route => route.abort());
    await page.goto("/");

    const hero = page.locator("main section").first();
    await expect(hero.getByRole("heading", { level: 1 })).toBeAttached();
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.6));
    await expect(hero.locator(".wx-night__end")).toHaveCSS("opacity", "1");
    await expect(
      hero.getByRole("link", { name: /plan with wiro/i })
    ).toBeVisible();
  });

  test("should display key homepage sections", async ({ page }) => {
    await page.goto("/");

    // Main content area exists
    await expect(page.locator("#main-content")).toBeVisible();

    // Footer exists
    await expect(page.locator("footer")).toBeVisible();
  });

  test("should have a valid page title", async ({ page }) => {
    await page.goto("/");

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toContain("wiro");
  });

  test("should not have any console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") &&
        !e.includes("401") &&
        !e.includes("auth") &&
        !e.includes("ResizeObserver")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("should have floating WhatsApp and guide actions", async ({ page }) => {
    await showHomeQuickActions(page);

    const fabGroup = page.locator('[role="group"][aria-label="Quick actions"]');
    await expect(fabGroup).toBeVisible();
  });

  test("links families to the three commercial planning guides", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("link", { name: "Private family 4x4 tours", exact: true })
    ).toHaveAttribute("href", "/private-family-tours");
    await expect(
      page.getByRole("link", {
        name: "Kosher-friendly tour planning",
        exact: true,
      })
    ).toHaveAttribute("href", "/kosher-tours");
    await expect(
      page.getByRole("link", {
        name: "Hebrew-speaking guide options",
        exact: true,
      })
    ).toHaveAttribute("href", "/hebrew-guide");
  });

  test("localizes the planning guides for a stored Hebrew preference", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("wiro-preferred-language", "he");
    });
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /המסע שלכם בצפון/,
      })
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "מדריכי תכנון לטיולים" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "טיולי 4x4 פרטיים למשפחות", exact: true })
    ).toHaveAttribute("href", "/he/private-family-tours-chiang-mai");
    await expect(
      page.getByRole("link", { name: "תכנון טיול ידידותי לכשרות", exact: true })
    ).toHaveAttribute("href", "/he/kosher-tours-chiang-mai");
    await expect(
      page.getByRole("link", {
        name: "אפשרויות למדריך דובר עברית",
        exact: true,
      })
    ).toHaveAttribute("href", "/he/hebrew-guide-chiang-mai");
  });
});

// Desktop-only navigation tests (require desktop viewport for nav[aria-label="Main navigation"])
test.describe("Homepage Desktop Navigation", () => {
  test.skip(
    ({ isMobile }) => isMobile,
    "Desktop navigation is hidden on mobile"
  );

  test("should display navigation with key links", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator('nav[aria-label="Main navigation"]');
    for (const name of ["Tours", "Gallery", "Book"]) {
      await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole("button", { name: /explore/i })).toBeVisible();

    await openExploreMenu(page);
    await expect(
      page.getByRole("menuitem", { name: /packages/i })
    ).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /blog/i })).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: /contact/i })
    ).toBeVisible();
  });

  test("should display the availability action in header", async ({ page }) => {
    await page.goto("/");

    const availabilityAction = page
      .locator("header")
      .getByRole("link", { name: /check availability/i });
    await expect(availabilityAction).toBeVisible();
    await expect(availabilityAction).toHaveAttribute("href", /wa\.me/);
    await expect(availabilityAction).toHaveAttribute(
      "href",
      /GLOBAL-HEADER-EN/
    );
  });

  test("should navigate to tours page when clicking Tours nav link", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole("link", { name: "Tours", exact: true })
      .click();
    await expect(page).toHaveURL(/\/tours$/);
  });

  test("should navigate to gallery page", async ({ page }) => {
    await page.goto("/");

    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole("link", { name: "Gallery", exact: true })
      .click();
    await expect(page).toHaveURL(/\/gallery/);
  });

  test("should navigate to blog page", async ({ page }) => {
    await page.goto("/");

    await openExploreMenu(page);
    await page.getByRole("menuitem", { name: /blog/i }).click();
    await expect(page).toHaveURL(/\/blog/);
  });

  test("should navigate to the booking stepper", async ({ page }) => {
    await page.goto("/");

    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole("link", { name: "Book", exact: true })
      .click();
    await expect(page).toHaveURL(/\/book$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Book your day" })
    ).toBeVisible();
  });
});
