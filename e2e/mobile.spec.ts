import { test, expect, type Page } from "@playwright/test";

test.describe("Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true }); // iPhone SE

  // Helper to dismiss overlays and prepare page for interaction
  async function preparePage(page: Page) {
    // Pre-set localStorage to skip cookie consent and newsletter popup
    await page.addInitScript(() => {
      localStorage.setItem("cookie-consent-accepted", "true");
      localStorage.setItem(
        "wiro_newsletter_dismissed",
        String(Date.now() + 86400000)
      );
    });
  }

  // Helper to open mobile menu reliably
  async function openMobileMenu(page: Page) {
    const menuButton = page.getByRole("button", { name: /toggle menu/i });
    await expect(menuButton).toBeVisible();
    await page.waitForTimeout(500);
    // Use dispatchEvent to avoid event interception issues
    await menuButton.dispatchEvent("click");
    const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');
    await expect(mobileNav).toBeVisible({ timeout: 5000 });
    return mobileNav;
  }

  test("should show mobile hamburger menu button", async ({ page }) => {
    await preparePage(page);
    await page.goto("/");

    const menuButton = page.getByRole("button", {
      name: /toggle menu/i,
    });
    await expect(menuButton).toBeVisible();
  });

  test("should open mobile menu on hamburger click", async ({ page }) => {
    await preparePage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const mobileNav = await openMobileMenu(page);

    // Tours link should be visible inside mobile nav
    await expect(mobileNav.getByText("Tours")).toBeVisible();
  });

  test("should navigate from mobile menu", async ({ page }) => {
    await preparePage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const mobileNav = await openMobileMenu(page);

    // Click Tours link inside mobile nav
    await mobileNav.getByText("Tours").click();

    await expect(page).toHaveURL(/\/tours/);
  });

  test("should close mobile menu after navigation", async ({ page }) => {
    await preparePage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const mobileNav = await openMobileMenu(page);

    // Navigate via mobile menu
    await mobileNav.getByText("Gallery").click();

    // Menu should close after navigation
    await expect(mobileNav).not.toBeVisible();
  });

  test("should hide desktop navigation on mobile", async ({ page }) => {
    await preparePage(page);
    await page.goto("/");

    // Desktop nav is hidden on mobile (has class md:flex = hidden by default)
    const desktopNav = page.locator('nav[aria-label="Main navigation"]');
    await expect(desktopNav).not.toBeVisible();
  });

  test("should display floating action buttons on mobile", async ({ page }) => {
    await preparePage(page);
    await page.goto("/");

    // FAB group should be visible
    const fabGroup = page.locator('[role="group"][aria-label="Quick actions"]');
    await expect(fabGroup).toBeVisible();
  });

  test("should load booking form correctly on mobile", async ({ page }) => {
    await preparePage(page);
    await page.goto("/book");

    // Form should be usable on mobile
    await expect(page.locator("#contactName")).toBeVisible();

    // Input should have adequate touch target
    const nameInput = page.locator("#contactName");
    const box = await nameInput.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40); // min touch target
    }
  });

  test("should load gallery page on mobile", async ({ page }) => {
    await preparePage(page);
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("header")).toBeVisible();

    const criticalErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") &&
        !e.includes("401") &&
        !e.includes("ResizeObserver")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("should have readable text on mobile (minimum font size)", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/");

    // Check that body text is at least 14px
    const paragraphs = page.locator("p");
    const count = await paragraphs.count();

    if (count > 0) {
      const fontSize = await paragraphs
        .first()
        .evaluate(el => window.getComputedStyle(el).fontSize);
      const fontSizeNum = parseFloat(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(14);
    }
  });

  test("should have Book Now button in mobile menu", async ({ page }) => {
    await preparePage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const mobileNav = await openMobileMenu(page);

    // Book Now button should be in mobile menu
    const bookNow = mobileNav.getByRole("button", { name: /book now/i });
    await expect(bookNow).toBeVisible();
  });
});
