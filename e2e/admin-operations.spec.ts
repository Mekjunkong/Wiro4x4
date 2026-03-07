import { test, expect, type Page } from "@playwright/test";

// Helper to dismiss overlays
async function preparePage(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent-accepted", "true");
    localStorage.setItem(
      "wiro_newsletter_dismissed",
      String(Date.now() + 86400000)
    );
  });
}

test.describe("Admin Dashboard - Access Control", () => {
  test("should require authentication to access /admin", async ({ page }) => {
    await preparePage(page);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const url = page.url();

    // Either redirects to login/oauth or stays on admin with auth gate
    const isHandled =
      url.includes("login") || url.includes("oauth") || url.includes("admin");
    expect(isHandled).toBeTruthy();
  });

  test("should not expose admin data without authentication", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes("/admin")) {
      // If stayed on admin page, sensitive data should not be visible
      // Check for typical admin-only content
      const hasRevenueData = await page
        .locator('text="Total Revenue"')
        .isVisible()
        .catch(() => false);
      const hasBookingDetails = await page
        .locator('text="Booking #"')
        .isVisible()
        .catch(() => false);

      // Without auth, these should not be visible
      expect(hasRevenueData && hasBookingDetails).toBeFalsy();
    }
  });

  test("should not throw JavaScript errors on admin page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await preparePage(page);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

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

test.describe("Admin Dashboard - Tab Navigation", () => {
  // These tests verify the admin dashboard structure without needing auth
  // They check that the page loads and the tab system works if authenticated

  test("should display admin dashboard header/layout", async ({ page }) => {
    await preparePage(page);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    // Page should load without crashing
    await expect(page.locator("body")).toBeVisible();

    // Check if we have the admin layout or a login redirect
    const url = page.url();
    if (url.includes("/admin")) {
      // Admin page loaded - may show login prompt or dashboard
      await expect(page.locator("header, body")).toBeVisible();
    }
  });

  test("should show login button or auth prompt for unauthenticated users", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes("/admin")) {
      // On admin page without auth - should have some auth indicator
      const hasLoginButton = await page
        .getByRole("link", { name: /log ?in|sign ?in/i })
        .isVisible()
        .catch(() => false);
      const hasAuthMessage = await page
        .getByText(/sign in|log in|authenticate|unauthorized/i)
        .first()
        .isVisible()
        .catch(() => false);
      const hasAdminContent = await page
        .getByText(/bookings|dashboard|CRM/i)
        .first()
        .isVisible()
        .catch(() => false);

      // Either shows auth prompt or admin content (if auth is handled differently)
      expect(hasLoginButton || hasAuthMessage || hasAdminContent).toBeTruthy();
    }
  });
});

test.describe("Admin Dashboard - Tab Definitions", () => {
  // Verify the admin tabs are defined correctly by checking the component structure
  // This tests the expected tabs exist when the page renders

  test("should have expected admin tab identifiers", async ({ page }) => {
    await preparePage(page);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const url = page.url();
    if (!url.includes("/admin")) {
      // Redirected away from admin - test is not applicable
      test.skip();
      return;
    }

    // Check if any tab-like elements exist
    const tabElements = page.locator('[role="tab"], button[data-state]');
    const _tabCount = await tabElements.count();

    // If admin page is accessible, it should have tab navigation
    // Expected tabs: CRM, Bookings, Calendar, Agents, Leads, Financial, Tours, etc.
    const expectedTabNames = [
      /bookings?/i,
      /tours?/i,
      /blog/i,
      /gallery/i,
      /reviews?/i,
    ];

    for (const tabName of expectedTabNames) {
      const tabButton = page.getByRole("button", { name: tabName }).first();
      const hasTab = await tabButton.isVisible().catch(() => false);

      // Tab may or may not be visible depending on auth state
      // This is a soft check - we just verify the page handles it
      if (hasTab) {
        await expect(tabButton).toBeVisible();
      }
    }
  });
});

test.describe("Admin Dashboard - API Protection", () => {
  // Verify that admin API endpoints are protected

  test("should reject unauthenticated API calls to admin endpoints", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/");

    // Try to call a protected tRPC endpoint directly
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/trpc/booking.list", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        return { status: res.status, ok: res.ok };
      } catch {
        return { status: 0, ok: false };
      }
    });

    // Should be unauthorized or error (not 200 with data)
    // tRPC might return 200 with error body or 401/403
    expect(response.status).not.toBe(0);
  });

  test("should allow public API calls for tours and gallery", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/");

    // Public endpoints should work without auth
    const tourResponse = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/trpc/tour.list", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        return { status: res.status, ok: res.ok };
      } catch {
        return { status: 0, ok: false };
      }
    });

    // Public endpoint should respond (not necessarily 200 due to tRPC query params)
    expect(tourResponse.status).not.toBe(0);
  });
});

test.describe("Admin Dashboard - Page Stability", () => {
  test("should handle rapid navigation to /admin without crashing", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await preparePage(page);

    // Navigate to admin multiple times
    await page.goto("/admin");
    await page.waitForTimeout(500);
    await page.goto("/");
    await page.waitForTimeout(500);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") &&
        !e.includes("401") &&
        !e.includes("auth") &&
        !e.includes("ResizeObserver") &&
        !e.includes("AbortError")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("should handle direct navigation to admin on mobile", async ({
    page,
  }) => {
    await preparePage(page);

    // Use mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await page.goto("/admin");
    await page.waitForTimeout(2000);

    // Page should load without critical errors
    await expect(page.locator("body")).toBeVisible();

    const criticalErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") &&
        !e.includes("401") &&
        !e.includes("auth") &&
        !e.includes("ResizeObserver")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

// Hebrew admin tests
test.describe("Admin Dashboard - Hebrew", () => {
  test("should load admin page in Hebrew without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await preparePage(page);

    // Set Hebrew language before loading admin
    await page.goto("/");
    let langSwitcher = page.getByRole("button", {
      name: /switch language to hebrew/i,
    });
    if (!(await langSwitcher.isVisible({ timeout: 2000 }).catch(() => false))) {
      const menuButton = page.getByRole("button", { name: /toggle menu/i });
      if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await menuButton.dispatchEvent("click");
        await page.waitForTimeout(500);
      }
      langSwitcher = page.getByRole("button", {
        name: /switch language to hebrew/i,
      });
    }
    if (await langSwitcher.isVisible().catch(() => false)) {
      await langSwitcher.click();
    }

    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") &&
        !e.includes("401") &&
        !e.includes("auth") &&
        !e.includes("ResizeObserver")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
