import { expect, test } from "@playwright/test";

const lessonPath = "/learn/networking-foundations/routers-default-gateways-and-network-boundaries";

test("teaches route boundaries through five coordinated public scenarios", async ({ page }) => {
  await page.goto(lessonPath);
  await expect(page.getByRole("heading", { level: 1, name: "Routers, Default Gateways and Network Boundaries" })).toBeVisible();
  await expect(page.locator(".lesson-content > h2")).toHaveText(["Why network boundaries matter", "What a router does", "Local or remote?", "The default gateway", "Direct delivery and routed delivery", "What changes at each hop", "Interactive route-decision player"]);
  await expect(page.getByRole("table", { name: "How a host prepares its first transmission" })).toBeVisible();
  const choices = page.getByRole("group", { name: "Choose a route decision scenario" }).getByRole("radio");
  await expect(choices).toHaveCount(5);
  await page.getByRole("radio", { name: "A server beyond the local network" }).click();
  await expect(page.getByRole("region", { name: "Decision", exact: true })).toContainText("Remote via gateway");
  await expect(page.getByRole("region", { name: "First frame", exact: true })).toContainText("Gateway interface");
  await expect(page.getByRole("group", { name: "Choose a practice scenario" })).toHaveCount(0);
});

test("supports keyboard use, technical explanations, reduced motion, and 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(lessonPath);
  const choices = page.getByRole("group", { name: "Choose a route decision scenario" }).getByRole("radio");
  await choices.first().focus(); await page.keyboard.press("ArrowRight");
  await expect(choices.nth(1)).toBeChecked(); await expect(choices.nth(1)).toBeFocused();
  await page.getByRole("radio", { name: "Technical reasoning" }).click();
  await expect(page.getByText(/The default route matches/)).toBeVisible();
  await expect(page.locator(".route-decision-player")).toHaveAttribute("data-motion", "reduced");
  expect(await choices.first().evaluate((node) => node.closest("label")!.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("keeps the complete boundary explanation available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
  try {
    const page = await context.newPage();
    expect((await page.goto(lessonPath))?.status()).toBe(200);
    await expect(page.locator(".lesson-content > h2")).toHaveCount(7);
    await expect(page.getByRole("table", { name: "How a host prepares its first transmission" })).toBeVisible();
    await expect(page.getByText("Ordinary Layer 2 broadcasts stop at the router boundary.")).toBeVisible();
    await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
  } finally { await context.close(); }
});

test("hydrates cleanly in both themes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(lessonPath);
  const theme = page.getByRole("combobox", { name: "Color theme" });
  await theme.selectOption("dark"); await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await theme.selectOption("light"); await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  expect(errors).toEqual([]);
});
