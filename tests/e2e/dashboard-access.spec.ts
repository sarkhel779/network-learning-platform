import { expect, test } from "@playwright/test";

test("anonymous visitors are redirected from the admin workspace", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fadmin$/);
  await expect(page.getByRole("heading", { name: "Overview" })).toHaveCount(0);
});

test("anonymous visitors are redirected from their learner dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fdashboard$/);
  await expect(page.getByRole("heading", { name: /Welcome back/ })).toHaveCount(0);
});

test("a test learner identity cannot grant admin access", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-packetsecrets-test-viewer": "ordinary-learner" });
  const response = await page.goto("/admin");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Overview" })).toHaveCount(0);
});
