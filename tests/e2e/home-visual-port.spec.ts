import { expect, test } from "@playwright/test";

test("refreshed homepage keeps the dark hero and visible packet route", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator(".home-hero");
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("img", { name: /Example packet route/ })).toBeVisible();
  expect(await hero.evaluate((element) => getComputedStyle(element).display)).toBe("grid");
  expect(await page.locator(".home-refresh").evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(7, 24, 39)");
  await expect(page.getByRole("link", { name: /Try a sample lab/i })).toHaveAttribute("href", "/labs");
});

test("refreshed homepage fits the mobile viewport", async ({ page, isMobile }) => {
  if (!isMobile && page.viewportSize()?.width !== 390) test.skip();
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole("heading", { name: "Your learning journey" })).toBeVisible();
});
