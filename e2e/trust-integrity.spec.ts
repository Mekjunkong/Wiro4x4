import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent-accepted", "true");
    localStorage.setItem(
      "wiro_newsletter_dismissed",
      String(Date.now() + 86_400_000)
    );
  });
});

test("never presents sample profiles as public reviews", async ({ page }) => {
  await page.goto("/reviews");

  await expect(page.getByText("David Cohen")).toHaveCount(0);
  await expect(page.getByText(/Based on 5 reviews/i)).toHaveCount(0);
  await expect(page.locator("#google-reviews-aggregate-json-ld")).toHaveCount(
    0
  );
  await expect(page.locator("#reviews-aggregate-json-ld")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /Tripadvisor/i }).first()
  ).toHaveAttribute("href", /tripadvisor\.com\/Attraction_Review/);
});

test("homepage trust claims link to public proof", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("4.9", { exact: true })).toHaveCount(0);
  await expect(page.getByText("500+", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /public reviews/i }).first()
  ).toHaveAttribute("href", /tripadvisor\.com\/Attraction_Review/);
});

test("every homepage review quote links to that review on Tripadvisor", async ({
  page,
}) => {
  await page.goto("/");

  const quotes = page.locator("#reviews blockquote[cite]");
  await quotes.first().scrollIntoViewIfNeeded();
  const count = await quotes.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(quotes.nth(i)).toHaveAttribute(
      "cite",
      /tripadvisor\.com\/ShowUserReviews-/
    );
  }
  await expect(page.getByText(/checked \w+ \d{4}/)).toBeVisible();
});
