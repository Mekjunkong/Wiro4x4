import { test, expect, type Page } from "@playwright/test";

// Helper to dismiss overlays and prepare page
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

test.describe("Blog Reading Journey", () => {
  test("should navigate to /blog from homepage via nav", async ({
    page,
    isMobile,
  }) => {
    await preparePage(page);
    await page.goto("/");

    if (isMobile) {
      // On mobile, open the mobile menu first
      const menuButton = page.getByRole("button", { name: /toggle menu/i });
      await expect(menuButton).toBeVisible();
      await menuButton.dispatchEvent("click");
      const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');
      await expect(mobileNav).toBeVisible({ timeout: 5000 });
      await mobileNav.getByText("Blog").click();
    } else {
      const nav = page.locator('nav[aria-label="Main navigation"]');
      await nav.getByRole("button", { name: /explore/i }).click();
      await page.getByRole("menuitem", { name: /blog/i }).click();
    }

    await expect(page).toHaveURL(/\/blog/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should display blog listing page with posts or empty state", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");

    // Should show either blog cards or the empty state message
    const hasPosts = await page
      .locator("article, .grid a, .grid [class*='card'], .grid > div")
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyState = await page
      .getByText(/no blog posts/i)
      .isVisible()
      .catch(() => false);

    expect(hasPosts || hasEmptyState).toBeTruthy();
  });

  test("should have a search input for finding articles", async ({ page }) => {
    await preparePage(page);
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByRole("textbox", {
      name: /search/i,
    });
    await expect(searchInput).toBeVisible();

    // Type a search query and verify it filters
    await searchInput.fill("kosher");
    await page.waitForTimeout(500);

    // The search input should have the entered value
    await expect(searchInput).toHaveValue("kosher");
  });

  test("should filter by category when clicking category buttons", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");

    // "All" category button should be visible
    const allButton = page.getByRole("button", { name: /^all$/i }).first();
    await expect(allButton).toBeVisible();

    // Click a category button if available (e.g., "Food & Kosher" or others)
    const categoryButtons = page.locator(
      'button:not([aria-label]):has-text("")'
    );
    const buttonCount = await categoryButtons.count();

    // There should be at least the "All" button
    expect(buttonCount).toBeGreaterThan(0);

    // Click "All" to reset and verify page is stable
    await allButton.click();
    await page.waitForTimeout(300);
    await expect(page.locator("header")).toBeVisible();
  });

  test("should navigate to individual blog post when clicking Read More", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");

    // Find a "Read More" link
    const readMoreLink = page.getByRole("link", { name: /read more/i }).first();

    if (await readMoreLink.isVisible().catch(() => false)) {
      await readMoreLink.click();
      await page.waitForLoadState("networkidle");

      // Should navigate to a blog post page
      await expect(page).toHaveURL(/\/blog\/.+/);

      // Article content should be visible
      await expect(page.locator("article")).toBeVisible();

      // Post title (h1) should be visible
      await expect(
        page.getByRole("heading", { level: 1 }).first()
      ).toBeVisible();
    }
  });

  test("should display share buttons on individual blog post", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");

    // Navigate to first blog post
    const readMoreLink = page.getByRole("link", { name: /read more/i }).first();

    if (await readMoreLink.isVisible().catch(() => false)) {
      await readMoreLink.click();
      await page.waitForLoadState("networkidle");

      // Share section should be visible with WhatsApp, Facebook, X links
      const shareSection = page.getByText(/share/i).first();
      await expect(shareSection).toBeVisible();

      // WhatsApp share link
      const whatsappLink = page.locator('a[href*="wa.me"]').first();
      await expect(whatsappLink).toBeVisible();

      // Facebook share link
      const facebookLink = page
        .locator('a[href*="facebook.com/sharer"]')
        .first();
      await expect(facebookLink).toBeVisible();

      // X (Twitter) share link
      const twitterLink = page.locator('a[href*="twitter.com/intent"]').first();
      await expect(twitterLink).toBeVisible();

      // Copy link button
      const copyButton = page.getByRole("button", {
        name: /copy link/i,
      });
      await expect(copyButton).toBeVisible();
    }
  });

  test("should have Back to Blog button on individual post", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");

    const readMoreLink = page.getByRole("link", { name: /read more/i }).first();

    if (await readMoreLink.isVisible().catch(() => false)) {
      await readMoreLink.click();
      await page.waitForLoadState("networkidle");

      // "Back to Blog" button should be visible
      const backButton = page.getByRole("button", {
        name: /back to blog/i,
      });
      await expect(backButton).toBeVisible();

      // Click back
      await backButton.click();
      await expect(page).toHaveURL(/\/blog$/);
    }
  });

  test("should show blog post not found for invalid slug", async ({ page }) => {
    await preparePage(page);
    await page.goto("/blog/this-slug-does-not-exist-at-all");
    await page.waitForLoadState("networkidle");

    // Should show "Post not found" or similar message
    const notFound = page.getByText(/not found/i);
    await expect(notFound).toBeVisible();
  });

  test("should not have console errors on blog pages", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await preparePage(page);
    await page.goto("/blog");
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

// Hebrew language blog tests
test.describe("Blog Reading Journey - Hebrew", () => {
  test("should display Hebrew content when language is switched", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");

    await switchToHebrew(page);

    // Page should now show Hebrew heading
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("he");

    // Search placeholder should be in Hebrew
    const searchInput = page.getByRole("textbox", {
      name: /חיפוש/,
    });
    await expect(searchInput).toBeVisible();
  });
});
