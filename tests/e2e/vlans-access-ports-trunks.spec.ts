import { expect, test } from "@playwright/test";

const lessonPath = "/learn/networking-foundations/vlans-access-ports-and-trunks";

test("keeps VLAN broadcasts inside their selected broadcast domain", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(lessonPath);
  const player = page.locator(".vlan-membership-player");
  await player.getByRole("button", { name: "Next" }).click();
  await expect(player.locator('[data-packet-marker][data-link-id="switch-host-b"]')).toBeVisible();
  await expect(player.locator('[data-packet-marker][data-link-id="switch-host-c"]')).toHaveCount(0);
  await player.getByRole("checkbox", { name: "Move Host D to VLAN 10" }).check();
  await player.getByRole("button", { name: "Next" }).click();
  await expect(player.locator("[data-packet-marker]")).toHaveCount(2);
});

test("shows the 802.1Q tag added and removed across a trunk", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(lessonPath);
  const player = page.locator(".vlan-tag-journey-player");
  await player.getByRole("button", { name: "Next" }).click();
  await player.getByRole("button", { name: "Next" }).click();
  await expect(player.getByText("802.1Q tag — VLAN 10")).toBeVisible();
  await player.getByRole("radio", { name: "Technical inspection" }).check();
  await expect(player.getByText("0x8100")).toBeVisible();
  await player.getByRole("button", { name: "Next" }).click();
  await player.getByRole("button", { name: "Next" }).click();
  await player.getByRole("button", { name: "Next" }).click();
  await expect(player.getByText("802.1Q tag — VLAN 10")).toHaveCount(0);
  await expect(player.getByRole("heading", { name: /tag is removed for the access link/i })).toBeVisible();
});

test("keeps both players usable with reduced motion on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(lessonPath);
  await expect(page.locator(".vlan-membership-player").getByRole("button", { name: "Play" })).toBeVisible();
  await expect(page.locator(".vlan-tag-journey-player").getByRole("button", { name: "Play" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("keeps the public VLAN lesson complete without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    const response = await page.goto(lessonPath);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "VLANs, Access Ports and Trunks" })).toBeVisible();
    await expect(page.getByText(/endpoint sends an ordinarily untagged frame/i)).toBeVisible();
    await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
    expect(await response!.text()).not.toContain("VLAN_ACCOUNT_SENTINEL");
  } finally {
    await context.close();
  }
});
