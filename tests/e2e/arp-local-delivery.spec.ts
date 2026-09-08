import { expect, test } from "@playwright/test";

const lessonPath = "/learn/networking-foundations/arp-and-local-delivery";

test("teaches the complete ARP exchange while protecting account evidence", async ({ page }) => {
  await page.goto(lessonPath);

  await expect(page.getByRole("heading", { level: 1, name: "ARP and Local Delivery" })).toBeVisible();
  await expect(page.getByRole("table", { name: "ARP variants and boundaries" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Explore ARP variants packet by packet" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "RARP" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Inverse ARP" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Choose an ARP situation" })).toBeVisible();
  await expect(page.locator(".arp-local-delivery-player").getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "1. Choose the local next hop" })).toBeVisible();

  const player = page.locator(".arp-local-delivery-player");
  const next = player.getByRole("button", { name: "Next", exact: true });
  await next.click();
  await next.click();
  await next.click();
  await expect(player.getByRole("heading", { name: "4. Switch floods the request" })).toBeVisible();
  await expect(player.locator('[data-packet-marker][data-link-id="switch-target"]')).toBeVisible();
  await expect(player.locator('[data-packet-marker][data-link-id="switch-gateway"]')).toBeVisible();

  await page.getByRole("radio", { name: "Remote via gateway" }).click();
  await expect(player.getByText(/resolve 192\.0\.2\.1, not the remote server/i).last()).toBeVisible();
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Inspect neighbour evidence" })).toHaveCount(0);
  await expect(page.getByText("ARP_ACCOUNT_SENTINEL")).toHaveCount(0);
});

test("keeps manual learning usable with reduced motion on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(lessonPath);

  const player = page.locator(".arp-local-delivery-player");
  await expect(player.getByRole("button", { name: "Play", exact: true })).toBeEnabled();
  await page.waitForTimeout(1600);
  await expect(player.getByText("Step 1 of 9")).toBeVisible();
  await player.getByRole("button", { name: "Next", exact: true }).click();
  await expect(player.getByRole("heading", { name: "2. Check the neighbour cache" })).toBeVisible();
  await expect.poll(() => page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
});

test("keeps the public ARP lesson complete without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
  try {
    const page = await context.newPage();
    const response = await page.goto(lessonPath);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "ARP and Local Delivery" })).toBeVisible();
    await expect(page.locator(".lesson-content > h2")).toHaveCount(5);
    await expect(page.getByText(/Static journey: choose the local next-hop IP/i)).toBeVisible();
    await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
    expect(await response!.text()).not.toContain("ARP_ACCOUNT_SENTINEL");
  } finally {
    await context.close();
  }
});
