import { expect, test } from "@playwright/test";

test("keeps the OSI comparison behind a usable account boundary at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const response = await page.goto("/learn/networking-foundations/osi-and-tcp-ip-models");
  expect(response?.status()).toBe(200);

  const comparison = page.locator("[data-layer-model-comparison]");
  await expect(comparison).toHaveCount(0);
  await expect(page.getByRole("table", { name: "The seven OSI layers", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: "OSI and TCP/IP Models" })).toBeVisible();
  const boundary = page.getByRole("region", { name: "Continue this lesson for free" });
  await expect(boundary).toBeVisible();
  await expect(boundary.getByRole("link", { name: "Continue with Google or email" })).toBeVisible();
  expect(await response!.text()).not.toMatch(/data-layer-model-comparison|Provides network services to user applications/);

  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
