import { expect, test } from "@playwright/test";

test.describe("fallback package booking handoff", () => {
  test("preserves the fallback package on the booking form", async ({
    page,
  }) => {
    await page.goto("/packages/northern-thailand-3d2n");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Northern Thailand Mountain Loop"
    );

    await page.getByRole("link", { name: "Book Online" }).click();

    await expect(page).toHaveURL(/\/book\?package=/);
    await expect(page.getByText("Selected tours")).toBeVisible();
    await expect(
      page.getByText("3 Days / 2 Nights — Northern Thailand Mountain Loop", {
        exact: true,
      })
    ).toBeVisible();
  });
});
