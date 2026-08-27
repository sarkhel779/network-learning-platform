import { expect, test } from "@playwright/test";

test("introduces the beginner networking pathway", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /understand how networks really work/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /start networking foundations/i })).toHaveAttribute(
    "href",
    "/paths/networking-foundations",
  );
});
