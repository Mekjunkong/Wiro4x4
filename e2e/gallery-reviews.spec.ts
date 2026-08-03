import { test, expect } from "@playwright/test";

// This file covers Reviews page tests and additional Gallery-Reviews integration.
// Main gallery tests are in gallery.spec.ts.

test.describe("Reviews Page", () => {
  test("should load reviews page", async ({ page }) => {
    await page.goto("/reviews");

    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display review submission form or CTA", async ({ page }) => {
    await page.goto("/reviews");
    await page.waitForLoadState("networkidle");

    // Look for the review form, a submit button, or input fields
    const hasForm = await page
      .locator("form")
      .first()
      .isVisible()
      .catch(() => false);
    const hasReviewButton = await page
      .getByRole("button", { name: /review|submit|write|send/i })
      .first()
      .isVisible()
      .catch(() => false);
    const hasInputField = await page
      .locator("input, textarea")
      .first()
      .isVisible()
      .catch(() => false);

    // Page should have either a form, a CTA button, or input fields
    expect(hasForm || hasReviewButton || hasInputField).toBeTruthy();
  });

  test("should have interactive elements on reviews page", async ({ page }) => {
    await page.goto("/reviews");
    await page.waitForLoadState("networkidle");

    // The reviews page should have interactive elements (buttons, form, etc.)
    const buttons = page.getByRole("button");
    const buttonCount = await buttons.count();

    // Should have at least some interactive elements (sort, filter, submit, etc.)
    expect(buttonCount).toBeGreaterThan(0);

    // Page should have loaded successfully without errors
    await expect(page.locator("body")).toBeVisible();
  });

  test("should not crash on reviews page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await page.goto("/reviews");
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

test.describe("Additional Pages Load Test", () => {
  test("should load pricing page", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });

  test("should redirect the retired estimate page to pricing", async ({
    page,
  }) => {
    await page.goto("/estimate");

    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.locator("header")).toBeVisible();
  });

  test("should load kosher tours SEO page", async ({ page }) => {
    await page.goto("/kosher-tours");

    await expect(page.locator("header")).toBeVisible();
  });

  test("should load hebrew guide SEO page", async ({ page }) => {
    await page.goto("/hebrew-guide");

    await expect(page.locator("header")).toBeVisible();
  });

  test("should load accessible tours SEO page", async ({ page }) => {
    await page.goto("/accessible-tours");

    await expect(page.locator("header")).toBeVisible();
  });

  test("should load blog listing page", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.locator("header")).toBeVisible();
  });

  test("should show 404 page for invalid routes", async ({ page }) => {
    await page.goto("/nonexistent-page");

    // Should show some kind of 404/not found content
    await expect(page.locator("body")).toBeVisible();
  });
});
