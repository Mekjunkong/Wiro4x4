import { test, expect } from "@playwright/test";

test.describe("Language Switching", () => {
  test("should display language switcher button", async ({ page }) => {
    await page.goto("/");

    // On desktop, language switcher is in the header nav
    // On mobile, it might be in the mobile menu or directly visible
    const langSwitcher = page.getByRole("button", {
      name: /switch language/i,
    });

    // On mobile, we may need to open the menu first
    if (!(await langSwitcher.isVisible({ timeout: 2000 }).catch(() => false))) {
      // Try opening mobile menu
      const menuButton = page.getByRole("button", { name: /toggle menu/i });
      if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await menuButton.click();
        await page.waitForTimeout(500);
      }
    }

    await expect(langSwitcher.first()).toBeVisible();
  });

  test("should update document language attribute when switching", async ({
    page,
  }) => {
    await page.goto("/");

    // Initially English
    const initialLang = await page.locator("html").getAttribute("lang");
    expect(initialLang).toBe("en");

    // Find the language switcher (may need to open mobile menu first)
    let langSwitcher = page.getByRole("button", {
      name: /switch language to hebrew/i,
    });

    if (!(await langSwitcher.isVisible({ timeout: 2000 }).catch(() => false))) {
      const menuButton = page.getByRole("button", { name: /toggle menu/i });
      if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await menuButton.click();
        await page.waitForTimeout(500);
      }
      langSwitcher = page.getByRole("button", {
        name: /switch language to hebrew/i,
      });
    }

    await langSwitcher.click();

    // Document lang should update to Hebrew
    const newLang = await page.locator("html").getAttribute("lang");
    expect(newLang).toBe("he");
  });

  test("should switch back to English from Hebrew", async ({ page }) => {
    await page.goto("/");

    // Helper to find and click language switcher
    async function clickLangSwitcher(name: RegExp) {
      let switcher = page.getByRole("button", { name });
      if (!(await switcher.isVisible({ timeout: 2000 }).catch(() => false))) {
        const menuButton = page.getByRole("button", {
          name: /toggle menu/i,
        });
        if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await menuButton.click();
          await page.waitForTimeout(500);
        }
        switcher = page.getByRole("button", { name });
      }
      await switcher.click();
    }

    // Switch to Hebrew
    await clickLangSwitcher(/switch language to hebrew/i);

    const hebrewLang = await page.locator("html").getAttribute("lang");
    expect(hebrewLang).toBe("he");

    // Switch back to English
    await clickLangSwitcher(/switch language to english/i);

    const englishLang = await page.locator("html").getAttribute("lang");
    expect(englishLang).toBe("en");
  });

  test("should persist language on navigation", async ({ page }) => {
    await page.goto("/");

    // Find and click language switcher to Hebrew
    let langSwitcher = page.getByRole("button", {
      name: /switch language to hebrew/i,
    });
    if (!(await langSwitcher.isVisible({ timeout: 2000 }).catch(() => false))) {
      const menuButton = page.getByRole("button", { name: /toggle menu/i });
      if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await menuButton.click();
        await page.waitForTimeout(500);
      }
      langSwitcher = page.getByRole("button", {
        name: /switch language to hebrew/i,
      });
    }

    await langSwitcher.click();

    // Navigate to pricing
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");

    // Language should still be Hebrew
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("he");
  });
});

// Desktop-only language test that checks nav text changes
test.describe("Language Switching - Desktop Nav", () => {
  test.skip(
    ({ isMobile }) => isMobile,
    "Desktop navigation is hidden on mobile"
  );

  test("should switch nav text from English to Hebrew", async ({ page }) => {
    await page.goto("/");

    // Initially in English - nav should show "Tours"
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav.getByText("Tours")).toBeVisible();

    // Click language switcher
    const langSwitcher = page.getByRole("button", {
      name: /switch language to hebrew/i,
    });
    await langSwitcher.click();

    // After switching, English nav text should be gone
    await expect(nav.getByText("Tours")).not.toBeVisible();
  });
});
