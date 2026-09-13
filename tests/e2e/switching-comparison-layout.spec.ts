import { expect, test } from "@playwright/test";

const lessonPath = "/learn/networking-foundations/hubs-bridges-and-switches";

test("keeps the selected hub topology wide and horizontal on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(lessonPath);
  const card = page.locator(".switching-device-card");
  await expect(card).toBeVisible();
  const box = await card.boundingBox();
  expect(box?.width).toBeGreaterThan(700);
  await expect(card.getByText("Host A sends", { exact: true })).toBeVisible();
  const labelColor = await card.locator(".packet-journey-topology svg text").first().evaluate((element) => getComputedStyle(element).fill);
  expect(labelColor).toBe("rgb(245, 248, 252)");
});

test("keeps the topology horizontal inside a local scroll region on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(lessonPath);
  const topology = page.locator(".switching-device-card .packet-journey-topology");
  await expect(topology).toBeVisible();
  const sizes = await topology.evaluate((element) => ({ viewport: element.clientWidth, content: element.scrollWidth, overflow: getComputedStyle(element).overflowX }));
  expect(sizes.content).toBeGreaterThan(sizes.viewport);
  expect(sizes.overflow).toBe("auto");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
