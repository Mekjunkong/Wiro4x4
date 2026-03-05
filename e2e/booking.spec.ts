import { test, expect } from "@playwright/test";

test.describe("Booking Flow", () => {
  test("should load the booking form page", async ({ page }) => {
    await page.goto("/book");

    // Header is visible
    await expect(page.locator("header")).toBeVisible();

    // Form fields are present - check for customer name input
    await expect(page.locator("#contactName")).toBeVisible();
  });

  test("should navigate to booking form from homepage", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");

    if (isMobile) {
      // On mobile, navigate directly
      await page.goto("/book");
    } else {
      // On desktop, click "Book Now" button in header nav
      await page
        .locator('nav[aria-label="Main navigation"]')
        .getByRole("link", { name: /book now/i })
        .click();
    }

    await expect(page).toHaveURL(/\/book/);
    await expect(page.locator("#contactName")).toBeVisible();
  });

  test("should have required form fields with proper labels", async ({
    page,
  }) => {
    await page.goto("/book");

    // Customer Details fieldset
    await expect(page.locator("#contactName")).toBeVisible();
    await expect(page.locator("#contactPhone")).toBeVisible();

    // Trip Details fieldset
    await expect(page.locator("#numberOfAdults")).toBeVisible();
  });

  test("should show validation errors on empty submission", async ({
    page,
  }) => {
    await page.goto("/book");

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
    await page.goto("/book");

    await page.locator("#contactName").fill("Test User");

    // No error should appear for name field
    await expect(page.locator("#error-contactName")).not.toBeVisible();
  });

  test("should validate phone number format", async ({ page }) => {
    await page.goto("/book");

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
    await page.goto("/book");

    const adultsInput = page.locator("#numberOfAdults");
    await adultsInput.fill("4");

    const value = await adultsInput.inputValue();
    expect(value).toBe("4");
  });

  test("should toggle children checkbox and show children fields", async ({
    page,
  }) => {
    await page.goto("/book");

    const childrenCheckbox = page.locator("#hasChildren");
    await childrenCheckbox.check();

    // Should show children count field
    await expect(page.locator("#numberOfChildren")).toBeVisible();
  });

  test("should auto-save draft to localStorage", async ({ page }) => {
    await page.goto("/book");

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
    await page.goto("/book");

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
    await page.goto("/book");

    // Look for consent/terms checkbox
    const consentCheckbox = page.locator('input[type="checkbox"]').last();
    await consentCheckbox.scrollIntoViewIfNeeded();
    await expect(consentCheckbox).toBeVisible();
  });
});
