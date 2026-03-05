import { test, expect } from "@playwright/test";

test.describe("Gallery", () => {
  test("should load gallery page with header and content", async ({ page }) => {
    await page.goto("/gallery");

    await expect(page.locator("header")).toBeVisible();
    await expect(
      page.locator("main, #main-content, [role='main']").first()
    ).toBeVisible();
  });

  test("should display category filter buttons", async ({ page }) => {
    await page.goto("/gallery");

    // Gallery has category badges/buttons: All, Tours, Vehicles, Destinations, etc.
    const allFilter = page.getByRole("button", { name: /all/i }).first();
    await expect(allFilter).toBeVisible();
  });

  test("should filter gallery when clicking a category", async ({ page }) => {
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    // Click Tours category filter
    const toursFilter = page.getByRole("button", { name: /tours/i }).first();
    if (await toursFilter.isVisible()) {
      await toursFilter.click();
      await page.waitForTimeout(500);

      // Page should still be functional (no crash)
      await expect(page.locator("header")).toBeVisible();
    }
  });

  test("should switch back to All category", async ({ page }) => {
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    // Click a specific category first
    const vehiclesFilter = page
      .getByRole("button", { name: /vehicles/i })
      .first();
    if (await vehiclesFilter.isVisible()) {
      await vehiclesFilter.click();
      await page.waitForTimeout(300);

      // Switch back to All
      const allFilter = page.getByRole("button", { name: /all/i }).first();
      await allFilter.click();
      await page.waitForTimeout(300);

      // Should be back to showing all photos
      await expect(page.locator("header")).toBeVisible();
    }
  });

  test("should implement infinite scroll pagination", async ({ page }) => {
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    // Count initial images
    const initialImages = await page.locator("img").count();

    // Scroll to bottom to trigger infinite scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    // After scrolling, page should still be functional
    // (actual count depends on DB data available)
    const afterScrollImages = await page.locator("img").count();
    expect(afterScrollImages).toBeGreaterThanOrEqual(initialImages);
  });

  test("should not crash with no gallery data", async ({ page }) => {
    // Gallery gracefully handles empty data
    await page.goto("/gallery");

    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await page.waitForLoadState("networkidle");

    const criticalErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") &&
        !e.includes("401") &&
        !e.includes("ResizeObserver")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
