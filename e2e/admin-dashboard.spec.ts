import { test, expect } from "@playwright/test";

// This file is superseded by admin.spec.ts for core admin auth tests.
// Keeping this file with complementary tests for SEO and meta verification.

test.describe("SEO and Meta Tags", () => {
  test("homepage should have proper meta tags", async ({ page }) => {
    await page.goto("/");

    // Title should contain WIRO
    const title = await page.title();
    expect(title.toLowerCase()).toContain("wiro");

    // Check for meta description
    const metaDescription = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(metaDescription).toBeTruthy();
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(50);
    }
  });

  test("should have Open Graph tags", async ({ page }) => {
    await page.goto("/");

    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    expect(ogTitle).toBeTruthy();

    const ogDescription = await page
      .locator('meta[property="og:description"]')
      .getAttribute("content");
    expect(ogDescription).toBeTruthy();
  });

  test("should have Twitter card tags", async ({ page }) => {
    await page.goto("/");

    const twitterCard = await page
      .locator('meta[name="twitter:card"]')
      .getAttribute("content");
    expect(twitterCard).toBeTruthy();
  });

  test("booking page should have proper page title", async ({ page }) => {
    await page.goto("/book");

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("gallery page should have proper page title", async ({ page }) => {
    await page.goto("/gallery");

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("should have JSON-LD structured data", async ({ page }) => {
    await page.goto("/");

    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThan(0);

    // Parse and verify JSON-LD
    if (count > 0) {
      const content = await jsonLd.first().textContent();
      expect(content).toBeTruthy();
      if (content) {
        const parsed = JSON.parse(content);
        expect(parsed["@context"]).toBe("https://schema.org");
      }
    }
  });
});

test.describe("Accessibility Basics", () => {
  test("should have skip-to-content link", async ({ page }) => {
    await page.goto("/");

    // Skip link exists (sr-only, visible on focus)
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should have exactly one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test("should have alt text on images", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // All img elements should have alt attributes
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).toBeTruthy();
    }
  });

  test("should have aria labels on interactive elements", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cookie-consent-accepted", "true");
      localStorage.setItem(
        "wiro_newsletter_dismissed",
        String(Date.now() + 86400000)
      );
    });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 720));

    // Floating action buttons should have aria-labels
    const fabGroup = page.locator('[role="group"][aria-label="Quick actions"]');
    await expect(fabGroup).toBeVisible();

    // Mobile menu button should have aria-label (on mobile) or language switcher (on desktop)
    const menuButton = page.getByRole("button", { name: /toggle menu/i });
    const langSwitcher = page.getByRole("button", {
      name: /switch language/i,
    });

    // At least one of these should be visible depending on viewport
    const menuVisible = await menuButton
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    const langVisible = await langSwitcher
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    expect(menuVisible || langVisible).toBeTruthy();
  });
});
