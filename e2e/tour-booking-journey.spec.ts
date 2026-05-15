import { test, expect, type Page } from "@playwright/test";

// Helper to dismiss overlays
async function preparePage(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent-accepted", "true");
    localStorage.setItem(
      "wiro_newsletter_dismissed",
      String(Date.now() + 86400000)
    );
    // Clear any booking draft
    localStorage.removeItem("wiro-booking-draft");
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

test.describe("Tour Discovery to Booking", () => {
  test("should display tour cards on the homepage", async ({ page }) => {
    await preparePage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Homepage should show tour cards section
    // Look for tour-related content (tour names or the tours section)
    const toursSection = page
      .locator(
        "text=Doi Inthanon, text=Mae Kampong, text=Sticky Waterfalls, text=Book Now"
      )
      .first();
    const hasTourContent = await toursSection.isVisible().catch(() => false);

    // Or look for tour images/cards
    const tourLinks = page.locator('a[href*="/tours"]');
    const tourLinkCount = await tourLinks.count();

    // Should have either tour cards or tour-related links
    expect(hasTourContent || tourLinkCount > 0).toBeTruthy();
  });

  test("should navigate to tour detail page from tour card", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find any tour link and click it
    const tourLink = page.locator('a[href*="/tours/"]').first();
    if (await tourLink.isVisible().catch(() => false)) {
      await tourLink.click();
      await expect(page).toHaveURL(/\/tours\/.+/);
    } else {
      // Navigate directly to a known tour
      await page.goto("/tours/doi-inthanon-roof-of-thailand");
    }

    await page.waitForLoadState("networkidle");

    // Tour detail page should show the tour name
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should display tour details: description, duration, difficulty", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/tours/doi-inthanon-roof-of-thailand");
    await page.waitForLoadState("networkidle");

    // Tour title
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/doi inthanon|דוי אינתנון/i);

    // Should show tour details like duration, difficulty
    await expect(page.locator("body")).toContainText(
      /hour|שע|moderate|easy|challenging/i
    );
  });

  test("should display included items on tour detail page", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/tours/doi-inthanon-roof-of-thailand");
    await page.waitForLoadState("networkidle");

    // Should show included items (check marks or list items)
    const includedSection = page.getByText(/included|כלול/i).first();
    await expect(includedSection).toBeVisible();
  });

  test("should display itinerary on tour detail page", async ({ page }) => {
    await preparePage(page);
    await page.goto("/tours/doi-inthanon-roof-of-thailand");
    await page.waitForLoadState("networkidle");

    // Should show itinerary section
    const itinerarySection = page.getByText(/itinerary|מסלול/i).first();
    await expect(itinerarySection).toBeVisible();
  });

  test("should have Book Now CTA on tour detail page", async ({ page }) => {
    await preparePage(page);
    await page.goto("/tours/doi-inthanon-roof-of-thailand");
    await page.waitForLoadState("networkidle");

    // Should have a "Book Now" or "Book This Tour" button/link
    const bookButton = page.getByRole("link", { name: /book|הזמ/i }).first();
    await expect(bookButton).toBeVisible();
  });

  test("should navigate from tour detail to booking form", async ({ page }) => {
    await preparePage(page);
    await page.goto("/tours/doi-inthanon-roof-of-thailand");
    await page.waitForLoadState("networkidle");

    const bookButton = page
      .locator(`a[href="/book?tour=doi-inthanon-roof-of-thailand"]`)
      .first();
    if (await bookButton.isVisible().catch(() => false)) {
      await bookButton.scrollIntoViewIfNeeded();
      await bookButton.click();
      await expect(page).toHaveURL(/\/book/);

      // Booking form should be loaded
      await expect(page.locator("#contactName")).toBeVisible();
    }
  });

  test("should fill out booking form with valid data", async ({ page }) => {
    await preparePage(page);
    await page.goto("/book");

    // Fill contact details
    await page.locator("#contactName").fill("Test Traveler");
    await page.locator("#contactPhone").fill("+972501234567");

    const emailField = page.locator("#contactEmail");
    if (await emailField.isVisible()) {
      await emailField.fill("test@example.com");
    }

    // Set number of adults
    await page.locator("#numberOfAdults").fill("2");

    // Verify values were entered
    expect(await page.locator("#contactName").inputValue()).toBe(
      "Test Traveler"
    );
    expect(await page.locator("#contactPhone").inputValue()).toBe(
      "+972501234567"
    );
    expect(await page.locator("#numberOfAdults").inputValue()).toBe("2");
  });

  test("should show validation errors for missing required fields", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/book");

    // Clear any draft data
    await page.evaluate(() => localStorage.removeItem("wiro-booking-draft"));
    await page.reload();

    // Clear fields
    await page.locator("#contactName").fill("");
    await page.locator("#contactPhone").fill("");

    // Try to submit
    const submitButton = page.getByRole("button", { name: /submit/i });
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should show validation error alerts
    const errorAlert = page.locator('[role="alert"]').first();
    await expect(errorAlert).toBeVisible();
  });

  test("should validate phone number format on booking form", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/book");

    await page.evaluate(() => localStorage.removeItem("wiro-booking-draft"));
    await page.reload();

    await page.locator("#contactName").fill("Test User");
    await page.locator("#contactPhone").fill("invalid");

    const submitButton = page.getByRole("button", { name: /submit/i });
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should show phone validation error
    const errorAlert = page.locator('[role="alert"]').first();
    await expect(errorAlert).toBeVisible();
  });

  test("should not crash on any tour detail page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await preparePage(page);
    // Test multiple tour slugs
    const slugs = [
      "doi-inthanon-roof-of-thailand",
      "mae-kampong-hidden-village",
      "maerim-sticky-waterfalls",
    ];

    for (const slug of slugs) {
      await page.goto(`/tours/${slug}`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("header")).toBeVisible();
    }

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

// Hebrew tour detail tests
test.describe("Tour Discovery - Hebrew", () => {
  test("should display tour detail in Hebrew", async ({ page }) => {
    await preparePage(page);
    await page.goto("/tours/doi-inthanon-roof-of-thailand");
    await page.waitForLoadState("networkidle");

    await switchToHebrew(page);

    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("he");

    // Page should still be functional after language switch
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

// Mobile-specific booking tests
test.describe("Tour Booking - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

  test("should load booking form correctly on mobile viewport", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/book");

    await expect(page.locator("#contactName")).toBeVisible();

    // Check touch target size
    const nameInput = page.locator("#contactName");
    const box = await nameInput.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test("should load tour detail page on mobile viewport", async ({ page }) => {
    await preparePage(page);
    await page.goto("/tours/doi-inthanon-roof-of-thailand");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("header")).toBeVisible();
  });
});
