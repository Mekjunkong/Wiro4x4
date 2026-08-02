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
  test("should load and display the hero section with WIRO 4x4 heading", async ({
    page,
  }) => {
    await page.goto("/");

    // Hero h1 contains "WIRO 4x4" branding
    const hero = page.locator("h1");
    await expect(hero).toBeVisible();
    await expect(hero).toContainText(/4[×x]4|Chiang Mai/i);
  });

  test("renders the cinematic hero without changing its booking actions", async ({
    page,
  }) => {
    await page.goto("/");

    const hero = page.locator("main section").first();
    await expect(hero.getByTestId("cinematic-hero-background")).toBeVisible();
    await expect(
      hero.getByRole("link", { name: /check availability on whatsapp/i })
    ).toHaveAttribute("href", /wa\.me/);
    await expect(
      hero.getByRole("button", { name: /ask levi first/i })
    ).toBeVisible();
    await expect(
      hero.getByRole("button", { name: "See Route Ideas" })
    ).toBeVisible();
  });

  test("uses the static car-only frame when reduced motion is requested", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const motionState = await page
      .getByTestId("cinematic-hero-background")
      .evaluate(hero => {
        const overlays = Array.from(
          hero.querySelectorAll<HTMLElement>(
            '[data-cinematic-hero-overlay="true"]'
          )
        );
        const baseImage = hero.querySelector<HTMLElement>(
          ".cinematic-hero__image--base"
        );

        return {
          overlayDisplays: overlays.map(
            overlay => getComputedStyle(overlay).display
          ),
          baseAnimation: baseImage
            ? getComputedStyle(baseImage).animationName
            : null,
        };
      });

    expect(motionState.overlayDisplays).toEqual(["none", "none"]);
    expect(motionState.baseAnimation).toBe("none");
    const hero = page.locator("main section").first();
    await expect(
      hero.getByRole("link", { name: /check availability on whatsapp/i })
    ).toBeVisible();
  });

  test("keeps the fallback frame when decorative scenes fail to load", async ({
    page,
  }) => {
    await page.route(/(?:mountain_sunset_golden|4x4_water_splash)/, route =>
      route.abort()
    );
    await page.goto("/");

    const heroSection = page.locator("main section").first();
    const hero = heroSection.getByTestId("cinematic-hero-background");
    await expect(
      hero.locator('img[alt="WIRO 4x4 vehicle on a jungle road in Chiang Mai"]')
    ).toBeVisible();
    await expect(
      heroSection.getByRole("link", { name: /check availability on whatsapp/i })
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
      page.getByRole("link", { name: "Private family 4x4 tours" })
    ).toHaveAttribute("href", "/private-family-tours");
    await expect(
      page.getByRole("link", { name: "Kosher-friendly tour planning" })
    ).toHaveAttribute("href", "/kosher-tours");
    await expect(
      page.getByRole("link", { name: "Hebrew-speaking guide options" })
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
        name: /טיולי 4×4 כשרים בצ'יאנג מאי/,
      })
    ).toBeVisible();
    await expect(page.getByTestId("cinematic-hero-background")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "תכננו לפי צורכי המשפחה, האוכל והשפה",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "טיולי 4x4 פרטיים למשפחות" })
    ).toHaveAttribute("href", "/he/private-family-tours-chiang-mai");
    await expect(
      page.getByRole("link", { name: "תכנון טיול ידידותי לכשרות" })
    ).toHaveAttribute("href", "/he/kosher-tours-chiang-mai");
    await expect(
      page.getByRole("link", { name: "אפשרויות למדריך דובר עברית" })
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
    await expect(nav.getByText("Tours")).toBeVisible();
    await expect(nav.getByText("Pricing")).toBeVisible();
    await expect(nav.getByRole("button", { name: /explore/i })).toBeVisible();
    await expect(nav.getByText("Contact")).toBeVisible();

    await openExploreMenu(page);
    await expect(
      page.getByRole("menuitem", { name: /gallery/i })
    ).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /blog/i })).toBeVisible();
  });

  test("should display the availability action in header", async ({ page }) => {
    await page.goto("/");

    const availabilityAction = page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole("link", { name: /check availability/i });
    await expect(availabilityAction).toBeVisible();
    await expect(availabilityAction).toHaveAttribute("href", /wa\.me/);
  });

  test("should navigate to tours page when clicking Tours nav link", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByText("Tours")
      .click();
    await expect(page).toHaveURL(/\/tours/);
  });

  test("should open the guide chat from the floating actions", async ({
    page,
  }) => {
    await showHomeQuickActions(page);

    await page
      .locator('[role="group"][aria-label="Quick actions"]')
      .getByRole("button", { name: /ask levi/i })
      .click();
    await expect(
      page.getByRole("log", { name: /chat conversation/i })
    ).toBeVisible();
  });

  test("opens Levi from the hero and supports keyboard dismissal", async ({
    page,
  }) => {
    await page.goto("/");

    const hero = page.locator("main section").first();
    const askLevi = hero.getByRole("button", { name: /ask levi first/i });
    await askLevi.click();
    const dialog = page.getByRole("dialog", { name: /levi, wiro assistant/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("textbox")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(askLevi).toBeFocused();
  });

  test("should navigate to gallery page", async ({ page }) => {
    await page.goto("/");

    await openExploreMenu(page);
    await page.getByRole("menuitem", { name: /gallery/i }).click();
    await expect(page).toHaveURL(/\/gallery/);
  });

  test("should navigate to blog page", async ({ page }) => {
    await page.goto("/");

    await openExploreMenu(page);
    await page.getByRole("menuitem", { name: /blog/i }).click();
    await expect(page).toHaveURL(/\/blog/);
  });

  test("should navigate to pricing page", async ({ page }) => {
    await page.goto("/");

    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByText("Pricing")
      .click();
    await expect(page).toHaveURL(/\/pricing/);
  });
});
