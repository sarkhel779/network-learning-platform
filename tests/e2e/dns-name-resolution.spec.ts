import { expect, test } from "@playwright/test";

test("renders the public DNS lesson without protected account or Pro content", async ({ page }) => {
  await page.goto("/learn/networking-foundations/dns-and-name-resolution");
  await expect(page.getByRole("heading", { level: 1, name: "DNS and Name Resolution" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Interactive complete DNS resolution" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Active DNS exchange" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /root-server bootstrap/i })).toHaveCount(0);
  await expect(page.getByText(/DS → DNSKEY → RRSIG/)).toHaveCount(0);
});

test("keeps the DNS player contained at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/networking-foundations/dns-and-name-resolution#interactive-complete-resolution");
  await expect(page.locator(".dns-player")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  const box = await page.locator(".dns-player").boundingBox();
  expect(box).not.toBeNull();
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(360);
});
