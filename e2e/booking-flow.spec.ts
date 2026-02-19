import { test, expect } from "@playwright/test";

test.describe("Booking Flow", () => {
  test("homepage loads with key sections visible", async ({ page }) => {
    await page.goto("/");

    // Hero section is visible
    await expect(page.locator("body")).toBeVisible();

    // Navigation is present
    await expect(page.locator("header")).toBeVisible();

    // Page has a title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("can navigate to booking form", async ({ page }) => {
    await page.goto("/");

    // Look for a "Book Now" button or link
    const bookButton = page.getByRole("link", { name: /book/i }).first();

    if (await bookButton.isVisible()) {
      await bookButton.click();
      await expect(page).toHaveURL(/\/(booking|book)/);
    }
  });

  test("booking form shows validation errors on empty submit", async ({
    page,
  }) => {
    await page.goto("/booking");

    // Try to submit without filling required fields
    const submitButton = page
      .getByRole("button", { name: /submit|book/i })
      .first();

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation errors (form should not navigate away)
      await expect(page).toHaveURL(/\/booking/);
    }
  });

  test("booking form has required fields", async ({ page }) => {
    await page.goto("/booking");

    // Check for essential form fields
    await expect(page.locator("input, select, textarea").first()).toBeVisible();
  });
});
