import { expect, test } from "@playwright/test";

const lessonPath = "/learn/networking-foundations/hubs-bridges-and-switches";

test("teaches hub, bridge, and switch behavior through an accessible comparison", async ({ page }) => {
  await page.goto(lessonPath);

  await expect(page.getByRole("heading", { level: 1, name: "Hubs, Bridges and Switches" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Learning objective" })).toBeVisible();
  await expect(page.locator(".lesson-content > h2")).toHaveText([
    "One local Ethernet conversation",
    "What a hub does",
    "Why bridges changed Ethernet",
    "How a switch learns",
    "How a switch forwards",
    "Compare hub, bridge and switch",
  ]);
  await expect(page.getByRole("table", { name: "Hub, bridge and switch at a glance" })).toBeVisible();

  const comparison = page.getByRole("group", { name: "Compare intermediary behavior" });
  await expect(comparison.getByRole("radio")).toHaveCount(5);
  await expect(page.locator(".switching-device-card")).toHaveCount(3);
  await expect(page.getByRole("group", { name: "Choose a forwarding scenario" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
});

test("supports keyboard comparison and reduced motion without mobile overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(lessonPath);

  const radios = page.getByRole("group", { name: "Compare intermediary behavior" }).getByRole("radio");
  await radios.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(radios.nth(1)).toBeChecked();
  await expect(radios.nth(1)).toBeFocused();
  await expect(page.locator(".switching-traffic-path")).toHaveAttribute("data-motion", "reduced");
  await expect.poll(() => page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
  expect(await radios.nth(1).evaluate((element) => {
    const label = element.closest("label")!;
    return label.getBoundingClientRect().height;
  })).toBeGreaterThanOrEqual(44);
});

test("keeps the complete public explanation useful without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
  try {
    const page = await context.newPage();
    const response = await page.goto(lessonPath);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Hubs, Bridges and Switches" })).toBeVisible();
    await expect(page.locator(".lesson-content > h2")).toHaveCount(6);
    await expect(page.getByRole("table", { name: "Hub, bridge and switch at a glance" })).toBeVisible();
    await expect(page.getByText("The interactive comparison will build on this table.")).toBeVisible();
    await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("hydrates cleanly in both themes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(lessonPath);
  const theme = page.getByRole("combobox", { name: "Color theme" });
  await theme.selectOption("dark");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await theme.selectOption("light");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  expect(errors).toEqual([]);
});
