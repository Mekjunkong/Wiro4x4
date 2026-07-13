import { test, expect } from "@playwright/test";

// This file is superseded by booking.spec.ts which has comprehensive tests.
// Keeping this file with complementary tests for the full booking user journey.

test.describe("Booking User Journey", () => {
  test("should expose tracked availability and load the booking form", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) {
      // On mobile, navigate directly to booking page
      await page.goto("/book");
    } else {
      // Start from homepage on desktop
      await page.goto("/");

      const availabilityLink = page
        .locator('nav[aria-label="Main navigation"]')
        .getByRole("link", { name: /check availability/i });
      await expect(availabilityLink).toBeVisible();
      await expect(availabilityLink).toHaveAttribute("href", /wa\.me\//);
      await expect(availabilityLink).toHaveAttribute(
        "href",
        /GLOBAL-HEADER-EN/
      );
      await page.goto("/book");
    }

    // Should land on booking page
    await expect(page).toHaveURL(/\/book/);

    // Verify the booking form has loaded with key sections
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("input, select, textarea").first()).toBeVisible();
  });

  test("should fill contact details and trip details", async ({ page }) => {
    await page.goto("/book");

    // Fill contact details
    await page.locator("#contactName").fill("John Smith");
    await page.locator("#contactPhone").fill("+972501234567");

    // Fill email if visible
    const emailField = page.locator("#contactEmail");
    if (await emailField.isVisible()) {
      await emailField.fill("john@example.com");
    }

    // Set number of adults
    await page.locator("#numberOfAdults").fill("3");

    // Verify values persisted
    expect(await page.locator("#contactName").inputValue()).toBe("John Smith");
    expect(await page.locator("#contactPhone").inputValue()).toBe(
      "+972501234567"
    );
    expect(await page.locator("#numberOfAdults").inputValue()).toBe("3");
  });

  test("should handle children toggle and age fields", async ({ page }) => {
    await page.goto("/book");

    // Check the has children checkbox
    const hasChildren = page.locator("#hasChildren");
    await hasChildren.check();

    // Number of children field should appear
    const childrenCount = page.locator("#numberOfChildren");
    await expect(childrenCount).toBeVisible();

    // Set number of children
    await childrenCount.fill("2");
    expect(await childrenCount.inputValue()).toBe("2");

    // Uncheck children
    await hasChildren.uncheck();

    // Children count should be hidden or disabled
    await expect(childrenCount).not.toBeVisible();
  });

  test("should clear draft when navigating away and back", async ({ page }) => {
    await page.goto("/book");

    // Clear any existing draft
    await page.evaluate(() => localStorage.removeItem("wiro-booking-draft"));
    await page.reload();

    // Fill name
    await page.locator("#contactName").fill("Draft Clear Test");

    // Wait for auto-save
    await page.waitForTimeout(1500);

    // Navigate away
    await page.goto("/");

    // Navigate back
    await page.goto("/book");

    // Draft should have been saved
    const nameValue = await page.locator("#contactName").inputValue();
    expect(nameValue).toBe("Draft Clear Test");
  });
});
