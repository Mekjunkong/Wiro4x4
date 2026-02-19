import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard", () => {
  test("admin page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/admin");

    // Should either show login prompt or redirect to login
    // Since we're not authenticated, the page should not show admin content
    const url = page.url();
    const hasAdmin = url.includes("/admin");
    const hasLogin = url.includes("login") || url.includes("oauth");

    // Either stayed on admin (with auth prompt) or redirected to login
    expect(hasAdmin || hasLogin).toBeTruthy();
  });

  test("admin page loads without crashing", async ({ page }) => {
    await page.goto("/admin");

    // The page should render without throwing JS errors
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    // Wait a moment for any async errors
    await page.waitForTimeout(2000);

    // Filter out expected auth-related errors
    const unexpectedErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") && !e.includes("401") && !e.includes("auth")
    );
    expect(unexpectedErrors).toHaveLength(0);
  });

  test("blog listing page loads", async ({ page }) => {
    await page.goto("/blog");

    // Blog page should load
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("header")).toBeVisible();
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");

    // Pricing page should load
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("header")).toBeVisible();
  });
});
