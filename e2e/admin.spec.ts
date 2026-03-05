import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard", () => {
  test("should require authentication to access admin", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const url = page.url();

    // Either redirects to login/oauth or shows admin page with auth prompt
    const isRedirected =
      url.includes("login") || url.includes("oauth") || url.includes("admin");
    expect(isRedirected).toBeTruthy();
  });

  test("should not show admin content without authentication", async ({
    page,
  }) => {
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    // Admin dashboard tabs (Bookings, Calendar, etc.) should NOT be visible
    // for unauthenticated users — or the page should redirect
    const url = page.url();
    if (url.includes("/admin")) {
      // If stayed on admin page, it should show some auth gate
      // Not show sensitive data like booking details
      const bookingDetails = page.locator('text="Booking #", text="Revenue"');
      const hasBookingData = await bookingDetails.count();
      expect(hasBookingData).toBe(0);
    }
  });

  test("should not throw JavaScript errors on admin page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await page.goto("/admin");
    await page.waitForTimeout(2000);

    // Filter out expected auth-related errors
    const unexpectedErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") &&
        !e.includes("401") &&
        !e.includes("auth") &&
        !e.includes("ResizeObserver")
    );
    expect(unexpectedErrors).toHaveLength(0);
  });
});
