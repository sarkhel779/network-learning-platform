import { expect, test } from "@playwright/test";

test("header labels stay on one line at a compact desktop width", async ({ page }) => {
  await page.setViewportSize({ width: 1268, height: 800 });
  await page.goto("/");

  for (const name of ["My dashboard", "Sign in", "Get started"]) {
    const link = page.locator(".site-header").getByRole("link", { name });
    const height = await link.evaluate((element) => element.getBoundingClientRect().height);
    expect(height, `${name} should fit on one line`).toBeLessThan(54);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1268);
});
