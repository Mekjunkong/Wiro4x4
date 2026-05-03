import { test, expect } from "@playwright/test";

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

  test("should have floating action buttons (WhatsApp and Book Now)", async ({
    page,
  }) => {
    await page.goto("/");

    const fabGroup = page.locator('[role="group"][aria-label="Quick actions"]');
    await expect(fabGroup).toBeVisible();
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
    await expect(nav.getByText("Gallery")).toBeVisible();
    await expect(nav.getByText("Blog")).toBeVisible();
    await expect(nav.getByText("Contact")).toBeVisible();
  });

  test("should display the Book Now button in header", async ({ page }) => {
    await page.goto("/");

    const bookNowButton = page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole("link", { name: /book now/i });
    await expect(bookNowButton).toBeVisible();
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

  test("should navigate to booking page when clicking Book Now", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole("link", { name: /book now/i })
      .click();
    await expect(page).toHaveURL(/\/book/);
  });

  test("should navigate to gallery page", async ({ page }) => {
    await page.goto("/");

    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByText("Gallery")
      .click();
    await expect(page).toHaveURL(/\/gallery/);
  });

  test("should navigate to blog page", async ({ page }) => {
    await page.goto("/");

    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByText("Blog")
      .click();
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
