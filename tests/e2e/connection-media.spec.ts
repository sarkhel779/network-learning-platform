import { expect, test } from "@playwright/test";

const lessonRoute = "/learn/networking-foundations/cables-fibre-wireless-and-network-connections";
const title = "Cables, Fibre, Wireless and Network Connections";

test("compares all public media and qualities without hydration or markup errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const response = await page.goto(lessonRoute);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  const comparison = page.locator(".connection-media-comparison");
  for (const medium of ["Copper", "Fibre", "Wireless"]) {
    await expect(comparison.getByRole("heading", { name: medium, exact: true })).toBeVisible();
  }
  for (const [quality, copper, fibre, wireless] of [
    ["Interference", "affected by electromagnetic interference", "not affected by electromagnetic interference", "shared radio environment"],
    ["Bandwidth", "negotiated rate", "compatible", "shared airtime"],
    ["Mobility", "does not support movement", "fixed link", "move within coverage"],
    ["Cost", "economical", "initial cost", "coverage and capacity"],
    ["Distance", "100 metres", "practical distance", "obstructions"],
  ]) {
    await comparison.getByRole("radio", { name: quality, exact: true }).check();
    for (const [medium, text] of [["Copper", copper], ["Fibre", fibre], ["Wireless", wireless]]) {
      await expect(comparison.getByRole("article", { name: medium, exact: true })).toContainText(text);
    }
  }
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Choose a connection scenario" })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("stacks cards at 360px with touch targets and visible keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(lessonRoute);
  const cards = page.locator(".connection-media-card");
  await expect(cards).toHaveCount(3);
  const bounds = await cards.evaluateAll((elements) => elements.map((element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  }));
  for (let index = 1; index < bounds.length; index += 1) {
    expect(bounds[index].x).toBeCloseTo(bounds[0].x, 0);
    expect(bounds[index].y).toBeGreaterThanOrEqual(bounds[index - 1].y + bounds[index - 1].height);
  }
  const distance = page.getByRole("radio", { name: "Distance", exact: true });
  await distance.focus();
  await page.keyboard.press("ArrowRight");
  const bandwidth = page.getByRole("radio", { name: "Bandwidth", exact: true });
  await expect(bandwidth).toBeChecked();
  await expect(bandwidth).toBeFocused();
  await expect(bandwidth).toHaveCSS("outline-style", "solid");
  await expect(bandwidth).toHaveCSS("outline-width", "3px");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Interference", exact: true })).toBeChecked();
  const targets = page.locator(".connection-media-comparison__qualities label");
  for (const target of await targets.all()) {
    expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("uses three desktop columns and readable signal tracks in both themes", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto(lessonRoute);
    const cards = page.locator(".connection-media-card");
    await expect(cards).toHaveCount(3);
    const boxes = await cards.evaluateAll((elements) => elements.map((element) => {
      const { x, y, width } = element.getBoundingClientRect();
      return { x, y, width };
    }));
    expect(boxes[1].y).toBeCloseTo(boxes[0].y, 0);
    expect(boxes[2].y).toBeCloseTo(boxes[0].y, 0);
    expect(boxes[1].x).toBeGreaterThanOrEqual(boxes[0].x + boxes[0].width);
    expect(boxes[2].x).toBeGreaterThanOrEqual(boxes[1].x + boxes[1].width);
    for (const track of await page.locator(".signal-track").all()) {
      await expect(track).toHaveAttribute("data-motion", "travel");
      await expect(track.locator(".signal-track__pulse")).toHaveCSS("animation-name", "connection-signal-travel");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.locator(".connection-media-comparison").screenshot({ path: testInfo.outputPath(`comparison-${colorScheme}.png`) });
  }
});

test("reduced motion preserves discrete source, medium, and destination states", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(lessonRoute);
  await expect(page.locator(".signal-track")).toHaveCount(3);
  for (const track of await page.locator(".signal-track").all()) {
    await expect(track).toHaveAttribute("data-motion", "reduced");
    await expect(track.locator(".signal-track__pulse")).toHaveCSS("animation-name", "none");
    for (const stage of ["Source", "Medium", "Destination"]) {
      await expect(track.getByText(stage, { exact: true })).toBeVisible();
    }
  }
  await page.getByRole("radio", { name: "Interference", exact: true }).check();
  await expect(page.getByRole("article", { name: "Wireless", exact: true })).toContainText("shared radio environment");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const track of await page.locator(".signal-track").all()) {
    await expect(track).toHaveAttribute("data-motion", "travel");
  }
});

test("six public sections, table and registration work without JavaScript at 360px", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
  try {
    const page = await context.newPage();
    await page.goto(lessonRoute);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    for (const name of ["How connections carry data", "Connection qualities", "Copper Ethernet", "Fibre connections", "Wireless connections", "Compare connection media"]) {
      await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
    }
    const table = page.getByRole("table", { name: "Connection media at a glance", exact: true });
    await expect(table).toBeVisible();
    await expect(table.getByRole("columnheader")).toHaveCount(5);
    await expect(table.getByRole("rowheader")).toHaveText(["Copper", "Fibre", "Wireless"]);
    await expect(page.locator('.signal-track[data-motion="reduced"]')).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const boundary = page.getByRole("region", { name: "Continue this lesson for free" });
    await expect(boundary).toContainText("No payment required.");
    await boundary.getByRole("link", { name: "Continue with Google or email" }).click();
    await expect(page).toHaveURL(/\/sign-in\?returnTo=/);
    expect(new URL(page.url()).searchParams.get("returnTo")).toBe(lessonRoute);
    await expect(page.getByText(/Account access is not available yet/i)).toBeVisible();
  } finally {
    await context.close();
  }
});
