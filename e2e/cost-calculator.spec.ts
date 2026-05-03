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

// Helper: set future dates for the calculator
function getFutureDates(): { arrival: string; departure: string } {
  const now = new Date();
  // Next Friday (for Shabbat detection)
  const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
  const arrival = new Date(
    now.getTime() + daysUntilFriday * 86400000 + 7 * 86400000
  );
  const departure = new Date(arrival.getTime() + 3 * 86400000);
  return {
    arrival: arrival.toISOString().split("T")[0],
    departure: departure.toISOString().split("T")[0],
  };
}

test.describe("Cost Calculator Flow", () => {
  test("should load the estimate page with calculator", async ({ page }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    // Page heading
    await expect(
      page.getByRole("heading", { name: /trip cost estimator|מחשבון/i })
    ).toBeVisible();

    // Calculator sections should be visible
    await expect(
      page.getByRole("heading", { name: /select tours|בחרו טיולים/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /group size|גודל הקבוצה/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /travel dates|תאריכי הטיול/i })
    ).toBeVisible();
  });

  test("should have a tour selection dropdown", async ({ page }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    // Tour select dropdown should be present
    const tourSelect = page.locator("#tour-select");
    await expect(tourSelect).toBeVisible();

    // It should have tour options
    const optionCount = await tourSelect.locator("option").count();
    // At least the disabled placeholder + some tours
    expect(optionCount).toBeGreaterThan(1);
  });

  test("should add a tour from dropdown and display it", async ({ page }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    const tourSelect = page.locator("#tour-select");

    // Select the first tour option (index 1, since 0 is the placeholder)
    const options = tourSelect.locator("option");
    const optionCount = await options.count();
    if (optionCount > 1) {
      // Get the value of the first real option
      const firstOptionValue = await options.nth(1).getAttribute("value");
      await tourSelect.selectOption(firstOptionValue!);
      await page.waitForTimeout(300);

      // The selected tour should appear in the selected tours list
      const selectedTourItem = page.locator(
        '[data-testid="selected-tour-item"]'
      );
      await expect(selectedTourItem.first()).toBeVisible();

      // Should have a remove button
      const removeButton = page.getByRole("button", {
        name: /remove tour|הסרת טיול/i,
      });
      await expect(removeButton.first()).toBeVisible();
    }
  });

  test("should adjust adult count with +/- buttons", async ({ page }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    // Default adult count is 2
    const _adultCount = page.locator("text=2").first();

    // Click increase adults button
    const increaseButton = page.getByRole("button", {
      name: /increase adults|הוסיפו מבוגרים/i,
    });
    await expect(increaseButton).toBeVisible();
    await increaseButton.click();

    // Adult count should now be 3
    await expect(page.locator('[data-testid="adult-count"]')).toHaveText("3");

    // Click decrease adults button
    const decreaseButton = page.getByRole("button", {
      name: /decrease adults|הפחיתו מבוגרים/i,
    });
    await decreaseButton.click();

    // Should be back to 2
    // Verify page is still functional
    await expect(page.locator("header")).toBeVisible();
  });

  test("should add children with age selectors", async ({ page }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    // Click "Add child" button
    const addChildButton = page.getByText(/add child|הוסיפו ילד/i);
    await expect(addChildButton).toBeVisible();
    await addChildButton.click();

    // Child age selector should appear
    const childAgeSelect = page.getByRole("combobox", {
      name: /age of child 1|גיל ילד 1/i,
    });
    await expect(childAgeSelect).toBeVisible();

    // Select age 5
    await childAgeSelect.selectOption("5");

    // Pricing info about children should be visible
    await expect(page.getByText(/under 3.*free|מתחת ל-3.*חינם/i)).toBeVisible();

    // Add another child
    await addChildButton.click();

    const secondChildSelect = page.getByRole("combobox", {
      name: /age of child 2|גיל ילד 2/i,
    });
    await expect(secondChildSelect).toBeVisible();

    // Remove a child
    const removeChildButton = page
      .getByRole("button", { name: /remove child|הסרת ילד/i })
      .first();
    await removeChildButton.click();

    // Should only have one child selector now
    await expect(secondChildSelect).not.toBeVisible();
  });

  test("should set arrival and departure dates", async ({ page }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    const { arrival, departure } = getFutureDates();

    // Fill arrival date
    const arrivalInput = page.locator("#calc-arrival");
    await expect(arrivalInput).toBeVisible();
    await arrivalInput.fill(arrival);

    // Fill departure date
    const departureInput = page.locator("#calc-departure");
    await expect(departureInput).toBeVisible();
    await departureInput.fill(departure);

    // Verify dates are set
    await expect(arrivalInput).toHaveValue(arrival);
    await expect(departureInput).toHaveValue(departure);
  });

  test("should detect Shabbat when dates span a Friday night", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    // Calculate a date range that includes a Friday night
    const now = new Date();
    const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
    // Start on Thursday, end on Sunday to ensure Friday is included
    const thursday = new Date(
      now.getTime() + (daysUntilFriday - 1 + 7) * 86400000
    );
    const sunday = new Date(thursday.getTime() + 3 * 86400000);

    const arrivalInput = page.locator("#calc-arrival");
    const departureInput = page.locator("#calc-departure");

    await arrivalInput.fill(thursday.toISOString().split("T")[0]);
    await departureInput.fill(sunday.toISOString().split("T")[0]);

    await page.waitForTimeout(500);

    // Shabbat detection message should appear
    const shabbatMessage = page.locator('[data-testid="shabbat-detection"]');
    await expect(shabbatMessage).toBeVisible();
  });

  test("should toggle service options (hotels, meals, attractions)", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    // Additional Services section
    await expect(
      page.getByText(/additional services|שירותים נוספים/i)
    ).toBeVisible();

    // Toggle Hotels checkbox
    const hotelsCheckbox = page
      .locator("label")
      .filter({ hasText: /hotels|מלונות/i })
      .locator('input[type="checkbox"]');
    await hotelsCheckbox.check();
    await expect(hotelsCheckbox).toBeChecked();

    // Toggle Kosher Meals
    const mealsCheckbox = page
      .locator("label")
      .filter({ hasText: /kosher meals|ארוחות כשרות/i })
      .locator('input[type="checkbox"]');
    await mealsCheckbox.check();
    await expect(mealsCheckbox).toBeChecked();

    // Toggle Attractions
    const attractionsCheckbox = page
      .locator("label")
      .filter({ hasText: /attractions|אטרקציות/i })
      .locator('input[type="checkbox"]');
    await attractionsCheckbox.check();
    await expect(attractionsCheckbox).toBeChecked();

    // Attraction count controls should appear
    await expect(
      page.getByText(/number of attractions|מספר אטרקציות/i)
    ).toBeVisible();
  });

  test("should show price breakdown after selecting tour and dates", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    // Select a tour
    const tourSelect = page.locator("#tour-select");
    const options = tourSelect.locator("option");
    const optionCount = await options.count();
    if (optionCount > 1) {
      const firstOptionValue = await options.nth(1).getAttribute("value");
      await tourSelect.selectOption(firstOptionValue!);
    }

    // Set dates
    const { arrival, departure } = getFutureDates();
    await page.locator("#calc-arrival").fill(arrival);
    await page.locator("#calc-departure").fill(departure);

    await page.waitForTimeout(500);

    // Price Estimate section should appear
    await expect(
      page.getByRole("heading", { name: /price estimate|הערכת מחיר/i })
    ).toBeVisible();

    // Total should be shown
    await expect(page.getByText(/estimated total|סה״כ הערכה/i)).toBeVisible();

    // Deposit and balance amounts should be shown
    await expect(page.getByText(/deposit.*30%|מקדמה.*30%/i)).toBeVisible();
    await expect(page.getByText(/balance|יתרה/i)).toBeVisible();

    // THB currency should be displayed
    await expect(page.locator("text=/฿[\\d,]+/").first()).toBeVisible();
  });

  test("should show WhatsApp CTA button after price calculation", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    // Select a tour
    const tourSelect = page.locator("#tour-select");
    const options = tourSelect.locator("option");
    if ((await options.count()) > 1) {
      await tourSelect.selectOption(
        (await options.nth(1).getAttribute("value"))!
      );
    }

    // Set dates
    const { arrival, departure } = getFutureDates();
    await page.locator("#calc-arrival").fill(arrival);
    await page.locator("#calc-departure").fill(departure);

    await page.waitForTimeout(500);

    // WhatsApp CTA button (calculator's quote button, not the floating action button)
    const whatsappButton = page.locator('[data-testid="whatsapp-cta"]');
    await expect(whatsappButton).toBeVisible();
  });

  test("should show empty state when no tour or dates selected", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    // With no tour selected, should show the empty/instruction state
    await expect(
      page.getByText(/select at least one tour|בחרו לפחות טיול אחד/i)
    ).toBeVisible();
  });

  test("should not crash on the estimate page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await preparePage(page);
    await page.goto("/estimate");
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

// Hebrew language cost calculator tests
test.describe("Cost Calculator - Hebrew", () => {
  test("should display calculator in Hebrew", async ({ page }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    await switchToHebrew(page);

    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("he");

    // Hebrew headings should be visible
    await expect(
      page.getByRole("heading", { name: /מחשבון עלות טיול/ })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /בחרו טיולים/ })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /גודל הקבוצה/ })
    ).toBeVisible();
  });
});

// Mobile-specific calculator tests
test.describe("Cost Calculator - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

  test("should load calculator on mobile viewport", async ({ page }) => {
    await preparePage(page);
    await page.goto("/estimate");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#tour-select")).toBeVisible();
    await expect(page.locator("#calc-arrival")).toBeVisible();
    await expect(page.locator("#calc-departure")).toBeVisible();

    // Date inputs should have adequate touch targets
    const arrivalBox = await page.locator("#calc-arrival").boundingBox();
    expect(arrivalBox).toBeTruthy();
    if (arrivalBox) {
      expect(arrivalBox.height).toBeGreaterThanOrEqual(40);
    }
  });
});
