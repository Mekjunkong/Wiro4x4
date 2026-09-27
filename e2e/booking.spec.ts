import { test, expect } from "@playwright/test";

// The full multi-day trip planner (hotels, services, packages) moved from
// /book to /plan-trip when /book became the day-tour stepper.
test.describe("Full trip planner", () => {
  test("should load the booking form page", async ({ page }) => {
    await page.goto("/plan-trip");

    // Header is visible
    await expect(page.locator("header")).toBeVisible();

    // Form fields are present - check for customer name input
    await expect(page.locator("#contactName")).toBeVisible();
  });

  test("should expose tracked availability before loading the booking form", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");

    if (isMobile) {
      // On mobile, navigate directly
      await page.goto("/plan-trip");
    } else {
      const availabilityLink = page
        .locator("header")
        .getByRole("link", { name: /check availability/i });
      await expect(availabilityLink).toBeVisible();
      await expect(availabilityLink).toHaveAttribute("href", /wa\.me\//);
      await expect(availabilityLink).toHaveAttribute(
        "href",
        /GLOBAL-HEADER-EN/
      );
      await page.goto("/plan-trip");
    }

    await expect(page).toHaveURL(/\/plan-trip/);
    await expect(page.locator("#contactName")).toBeVisible();
  });

  test("should have required form fields with proper labels", async ({
    page,
  }) => {
    await page.goto("/plan-trip");

    // Customer Details fieldset
    await expect(page.locator("#contactName")).toBeVisible();
    await expect(page.locator("#contactPhone")).toBeVisible();

    // Trip Details fieldset
    await expect(page.locator("#numberOfAdults")).toBeVisible();
  });

  test("should show validation errors on empty submission", async ({
    page,
  }) => {
    await page.goto("/plan-trip");

    // Clear localStorage draft to ensure clean state
    await page.evaluate(() => localStorage.removeItem("wiro-booking-draft"));
    await page.reload();

    // Clear the name field (might have draft data from localStorage)
    await page.locator("#contactName").fill("");
    await page.locator("#contactPhone").fill("");

    // Find and click submit button - text is "Submit & Send to WhatsApp"
    const submitButton = page.getByRole("button", {
      name: /submit/i,
    });

    // Scroll to submit button and click
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should show validation error for name (role="alert")
    const errorAlert = page.locator('[role="alert"]').first();
    await expect(errorAlert).toBeVisible();
  });

  test("should accept valid name input", async ({ page }) => {
    await page.goto("/plan-trip");

    await page.locator("#contactName").fill("Test User");

    // No error should appear for name field
    await expect(page.locator("#error-contactName")).not.toBeVisible();
  });

  test("should validate phone number format", async ({ page }) => {
    await page.goto("/plan-trip");

    // Clear localStorage draft to ensure clean state
    await page.evaluate(() => localStorage.removeItem("wiro-booking-draft"));
    await page.reload();

    // Fill contact name to pass that validation
    await page.locator("#contactName").fill("Test User");

    // Fill invalid phone (less than 8 characters)
    await page.locator("#contactPhone").fill("abc");

    // Submit to trigger validation - button text is "Submit & Send to WhatsApp"
    const submitButton = page.getByRole("button", {
      name: /submit/i,
    });
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should show validation error (error summary or inline error)
    const errorAlert = page.locator('[role="alert"]').first();
    await expect(errorAlert).toBeVisible();
  });

  test("should allow selecting number of adults", async ({ page }) => {
    await page.goto("/plan-trip");

    const adultsInput = page.locator("#numberOfAdults");
    await adultsInput.fill("4");

    const value = await adultsInput.inputValue();
    expect(value).toBe("4");
  });

  test("should toggle children checkbox and show children fields", async ({
    page,
  }) => {
    await page.goto("/plan-trip");

    const childrenCheckbox = page.locator("#hasChildren");
    await childrenCheckbox.check();

    // Should show children count field
    await expect(page.locator("#numberOfChildren")).toBeVisible();
  });

  test("should auto-save draft to localStorage", async ({ page }) => {
    await page.goto("/plan-trip");

    // Fill some data
    await page.locator("#contactName").fill("Draft Test User");

    // Wait for auto-save debounce (1 second)
    await page.waitForTimeout(1500);

    // Check localStorage has draft
    const draft = await page.evaluate(() =>
      localStorage.getItem("wiro-booking-draft")
    );
    expect(draft).toBeTruthy();
    expect(draft).toContain("Draft Test User");
  });

  test("should restore draft from localStorage on page reload", async ({
    page,
  }) => {
    await page.goto("/plan-trip");

    // Set draft data
    await page.evaluate(() => {
      localStorage.setItem(
        "wiro-booking-draft",
        JSON.stringify({
          contactName: "Restored User",
          contactPhone: "+1234567890",
        })
      );
    });

    // Reload page
    await page.reload();

    // Name should be restored
    const nameValue = await page.locator("#contactName").inputValue();
    expect(nameValue).toBe("Restored User");
  });

  test("should have consent checkbox before submission", async ({ page }) => {
    await page.goto("/plan-trip");

    // Look for consent/terms checkbox
    const consentCheckbox = page.locator('input[type="checkbox"]').last();
    await consentCheckbox.scrollIntoViewIfNeeded();
    await expect(consentCheckbox).toBeVisible();
  });
});
