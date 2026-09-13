import { expect, test } from "@playwright/test";

test("light mode changes the landing surface and keeps packet labels readable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("switch", { name: "Dark mode" }).click();
  await expect(page.locator(".home-refresh")).toHaveCSS("background-color", "rgb(245, 250, 252)");
  await expect(page.locator(".site-header")).toHaveCSS("background-color", "rgb(245, 250, 252)");
  await expect(page.locator(".site-logo__packet")).toHaveCSS("color", "rgb(20, 43, 58)");

  await page.goto("/labs");
  await expect(page.locator(".labs-page")).toHaveCSS("background-color", "rgb(245, 250, 252)");

  await page.goto("/learn/networking-foundations/how-networks-communicate");
  const packetLabel = page.locator('.packet-inspector__layers [data-packet-layer="ethernet"] h4').first();
  await expect(packetLabel).toHaveCSS("color", "rgb(23, 32, 51)");
  await expect(packetLabel).toBeVisible();
});

test("authenticated header offers My account and lesson sections have no Continue button", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-packetsecrets-test-viewer": "account-header-learner" });
  await page.goto("/learn/networking-foundations/tcp-reliable-transport");
  await expect(page.getByRole("link", { name: "My account" })).toHaveAttribute("href", "/dashboard");
  await expect(page.getByRole("link", { name: "Sign in" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Continue:/ })).toHaveCount(0);
});
