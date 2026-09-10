import { expect, test } from "@playwright/test";

const route = "/learn/networking-foundations/http-https-tls-and-essential-network-services";

test("renders the public essential-services lesson without protected content", async ({ page }) => {
  await page.goto(route);
  await expect(page.getByRole("heading", { level: 1, name: "HTTP, HTTPS, TLS and Essential Network Services" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Page contents" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /RFC validation/ })).toHaveCount(0);
});

test("replays the service map and preserves a locked section anchor", async ({ page }) => {
  await page.goto(route);
  const trigger = page.getByRole("button", { name: "Page contents" });
  await trigger.click();
  await expect(page.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "1");
  await expect(page.getByRole("link", { name: /Web-service Wireshark analysis.*Pro.*Locked/ })).toHaveAttribute(
    "href",
    `/sign-in?returnTo=${encodeURIComponent(`${route}#web-capture-analysis`)}`,
  );
  await trigger.click();
  await trigger.click();
  await expect(page.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "2");
});

test("contains the service map at mobile width without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  await page.getByRole("button", { name: "Page contents" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
