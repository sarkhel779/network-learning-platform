import { expect, test } from "@playwright/test";

const lessonPath = "/learn/networking-foundations/how-switches-learn-and-forward";

test("animates the switch decision in order and keeps account material protected", async ({ page }) => {
  await page.goto(lessonPath);

  await expect(page.getByRole("heading", { level: 1, name: "How Switches Learn and Forward" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Switch forwarding decisions" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Choose the forwarding evidence" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Frame arrives on Gi0/1" })).toBeVisible();

  await page.getByRole("radio", { name: "Unknown destination" }).click();
  await expect(page.getByText(/destination entry is absent/i)).toBeVisible();
  await expect(page.getByText("Step 1 of 5")).toBeVisible();

  await page.getByRole("radio", { name: "Host moved" }).click();
  await expect(page.getByText("Switch Gi0/3 ingress")).toBeVisible();
  await expect(page.getByText("02:00:00:00:00:0B").first()).toBeVisible();
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
  await expect(page.getByText("SWITCH_ACCOUNT_SENTINEL")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Read MAC-table evidence" })).toHaveCount(0);
});

test("preserves manual reduced-motion learning and mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(lessonPath);

  const player = page.locator(".switch-learning-player");
  await expect(player.getByRole("button", { name: "Play", exact: true })).toBeEnabled();
  await page.waitForTimeout(1600);
  await expect(player.getByText("Step 1 of 5")).toBeVisible();
  await player.getByRole("button", { name: "Next", exact: true }).click();
  await expect(player.getByRole("heading", { name: "1. Learn the source" })).toBeVisible();
  await expect.poll(() => page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
});

test("keeps the complete public explanation readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
  try {
    const page = await context.newPage();
    const response = await page.goto(lessonPath);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "How Switches Learn and Forward" })).toBeVisible();
    await expect(page.locator(".lesson-content > h2")).toHaveCount(5);
    await expect(page.getByText(/Static decision: receive on ingress/i)).toBeVisible();
    await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
    expect(await response!.text()).not.toContain("SWITCH_ACCOUNT_SENTINEL");
  } finally {
    await context.close();
  }
});
