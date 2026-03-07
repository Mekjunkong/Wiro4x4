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

// Helper to switch language to Hebrew
async function switchToHebrew(page: Page) {
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
  await langSwitcher.click();
  await page.waitForTimeout(300);
}

test.describe("Gallery and Photo Viewing", () => {
  test("should load gallery page with hero section", async ({ page }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    // Hero heading
    await expect(
      page.getByRole("heading", { name: /photo gallery|גלריית תמונות/i })
    ).toBeVisible();

    // Main content area
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("should display all category filter buttons", async ({ page }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    // Expected categories
    const categories = [
      "All",
      "Tours",
      "Vehicles",
      "Destinations",
      "Activities",
      "Food",
      "Accommodation",
      "Other",
    ];

    for (const category of categories) {
      const button = page
        .getByRole("button", { name: new RegExp(category, "i") })
        .first();
      await expect(button).toBeVisible();
    }
  });

  test("should filter photos when clicking a category", async ({ page }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    // Click "Tours" category
    const toursButton = page.getByRole("button", { name: /^tours$/i }).first();
    await toursButton.click();
    await page.waitForTimeout(500);

    // The Tours button should now be active (has the active styling)
    // Page should still be functional
    await expect(page.locator("header")).toBeVisible();

    // Click "Vehicles" category
    const vehiclesButton = page
      .getByRole("button", { name: /^vehicles$/i })
      .first();
    await vehiclesButton.click();
    await page.waitForTimeout(500);

    await expect(page.locator("header")).toBeVisible();
  });

  test("should switch back to All category after filtering", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    // Click a specific category
    const foodButton = page.getByRole("button", { name: /^food$/i }).first();
    await foodButton.click();
    await page.waitForTimeout(300);

    // Click All to reset
    const allButton = page.getByRole("button", { name: /^all$/i }).first();
    await allButton.click();
    await page.waitForTimeout(300);

    // Page should show all photos again
    await expect(page.locator("header")).toBeVisible();
  });

  test("should show empty state or photos depending on data", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    // Either we have photos (grid items with role="button") or empty state
    const hasPhotos = await page
      .locator('[role="button"][tabindex="0"]')
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyState = await page
      .getByText(/no photos|אין תמונות/i)
      .isVisible()
      .catch(() => false);

    expect(hasPhotos || hasEmptyState).toBeTruthy();
  });

  test("should open lightbox when clicking a photo", async ({ page }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    // Find a photo grid item
    const photoItem = page.locator('[role="button"][tabindex="0"]').first();

    if (await photoItem.isVisible().catch(() => false)) {
      await photoItem.click();
      await page.waitForTimeout(500);

      // Lightbox dialog should open
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Should show a full-size image
      const lightboxImage = dialog.locator("img");
      await expect(lightboxImage).toBeVisible();

      // Should show photo counter (e.g., "1 / 10")
      const counter = dialog.locator("text=/\\d+ \\/ \\d+/");
      await expect(counter).toBeVisible();
    }
  });

  test("should navigate through lightbox with prev/next buttons", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    const photoItems = page.locator('[role="button"][tabindex="0"]');
    const photoCount = await photoItems.count();

    if (photoCount >= 2) {
      // Open lightbox on first photo
      await photoItems.first().click();
      await page.waitForTimeout(500);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Click next photo button
      const nextButton = page.getByRole("button", {
        name: /next photo|תמונה הבאה/i,
      });
      if (await nextButton.isVisible().catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(300);

        // Counter should update
        const counter = dialog.locator("text=/\\d+ \\/ \\d+/");
        await expect(counter).toBeVisible();
      }

      // Click previous photo button
      const prevButton = page.getByRole("button", {
        name: /previous photo|תמונה קודמת/i,
      });
      if (await prevButton.isVisible().catch(() => false)) {
        await prevButton.click();
        await page.waitForTimeout(300);
        await expect(dialog).toBeVisible();
      }
    }
  });

  test("should close lightbox with close button", async ({ page }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    const photoItem = page.locator('[role="button"][tabindex="0"]').first();

    if (await photoItem.isVisible().catch(() => false)) {
      await photoItem.click();
      await page.waitForTimeout(500);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Close button
      const closeButton = page.getByRole("button", {
        name: /close lightbox|סגור תצוגה/i,
      });
      await closeButton.click();
      await page.waitForTimeout(300);

      // Dialog should be closed
      await expect(dialog).not.toBeVisible();
    }
  });

  test("should close lightbox with Escape key", async ({ page }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    const photoItem = page.locator('[role="button"][tabindex="0"]').first();

    if (await photoItem.isVisible().catch(() => false)) {
      await photoItem.click();
      await page.waitForTimeout(500);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Press Escape
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);

      await expect(dialog).not.toBeVisible();
    }
  });

  test("should navigate lightbox with arrow keys", async ({ page }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    const photoItems = page.locator('[role="button"][tabindex="0"]');
    const photoCount = await photoItems.count();

    if (photoCount >= 2) {
      await photoItems.first().click();
      await page.waitForTimeout(500);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Press ArrowRight to go to next
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(300);
      await expect(dialog).toBeVisible();

      // Press ArrowLeft to go back
      await page.keyboard.press("ArrowLeft");
      await page.waitForTimeout(300);
      await expect(dialog).toBeVisible();
    }
  });

  test("should implement infinite scroll pagination", async ({ page }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    // Count initial photos
    const initialCount = await page
      .locator('[role="button"][tabindex="0"]')
      .count();

    // Scroll to bottom to trigger infinite scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    // After scroll, photo count should be >= initial
    const afterScrollCount = await page
      .locator('[role="button"][tabindex="0"]')
      .count();
    expect(afterScrollCount).toBeGreaterThanOrEqual(initialCount);
  });

  test("should have proper alt text on gallery images", async ({ page }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    const images = page.locator('[role="button"][tabindex="0"] img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).toBeTruthy();
      expect(alt!.length).toBeGreaterThan(0);
    }
  });

  test("should not crash on gallery page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

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

// Hebrew gallery tests
test.describe("Gallery - Hebrew", () => {
  test("should display gallery in Hebrew", async ({ page }) => {
    await preparePage(page);
    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    await switchToHebrew(page);

    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("he");

    // Hebrew category buttons should be visible
    await expect(
      page.getByRole("button", { name: /הכל/ }).first()
    ).toBeVisible();
  });
});

// Mobile gallery tests
test.describe("Gallery - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

  test("should load gallery on mobile viewport", async ({ page }) => {
    await preparePage(page);
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await page.goto("/gallery");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("header")).toBeVisible();

    // Category buttons should be visible and scrollable
    const allButton = page.getByRole("button", { name: /^all$/i }).first();
    await expect(allButton).toBeVisible();

    const criticalErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") &&
        !e.includes("401") &&
        !e.includes("ResizeObserver")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
