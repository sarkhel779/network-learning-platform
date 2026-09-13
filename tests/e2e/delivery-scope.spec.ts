import { expect, test } from "@playwright/test";

const lessonPath = "/learn/networking-foundations/unicast-broadcast-and-multicast-communication";

test("teaches all delivery scopes through an anonymous interactive player", async ({ page }) => {
  await page.goto(lessonPath);
  await expect(page.getByRole("heading", { level: 1, name: "Unicast, Broadcast and Multicast Communication" })).toBeVisible();
  await expect(page.locator(".lesson-content > h2")).toHaveText([
    "Why delivery scope matters", "Unicast: one intended destination", "Broadcast: the local broadcast domain",
    "Multicast: an interested receiver group", "Unknown unicast is not broadcast", "Compare delivery types", "Interactive delivery-scope player",
  ]);
  await expect(page.getByRole("group", { name: "Choose a delivery scenario" }).getByRole("radio")).toHaveCount(5);
  await expect(page.getByRole("img", { name: /Sender through a switch/ })).toBeVisible();
  for (const name of ["Forwarded", "Received", "Accepted", "Router boundary"]) await expect(page.getByRole("region", { name })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Predict traffic delivery" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
});

test("supports keyboard choices, reduced motion and 360px without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(lessonPath);
  const radios = page.getByRole("group", { name: "Choose a delivery scenario" }).getByRole("radio");
  await radios.first().focus(); await page.keyboard.press("ArrowRight");
  await expect(radios.nth(1)).toBeChecked(); await expect(radios.nth(1)).toBeFocused();
  await expect(page.locator(".delivery-scope-player")).toHaveAttribute("data-motion", "reduced");
  expect(await radios.nth(1).evaluate((input) => input.closest("label")!.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("remains useful without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
  try { const page = await context.newPage(); expect((await page.goto(lessonPath))?.status()).toBe(200); await expect(page.locator(".lesson-content > h2")).toHaveCount(7); await expect(page.getByText(/HTTPS request to a web server/)).toBeVisible(); await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible(); } finally { await context.close(); }
});

test("hydrates cleanly in both themes and excludes protected scenario identifiers", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message)); page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  const response = await page.goto(lessonPath); const html = await response!.text();
  for (const secret of ["dhcp-relay-boundary", "multicast-without-group-state", "DELIVERY_SCOPE_ACCOUNT_SENTINEL"]) expect(html).not.toContain(secret);
  const theme = page.getByRole("switch", { name: "Dark mode" }); await expect(theme).toHaveAttribute("aria-checked", "true"); await expect(page.locator("html")).toHaveCSS("color-scheme", "dark"); await theme.click(); await expect(theme).toHaveAttribute("aria-checked", "false"); await expect(page.locator("html")).toHaveCSS("color-scheme", "light"); expect(errors).toEqual([]);
});
