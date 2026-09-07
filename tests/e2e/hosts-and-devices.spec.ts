import { expect, test } from "@playwright/test";

const lessonRoute = "/learn/networking-foundations/hosts-and-network-devices";

test("explores devices and switches between complete packet journeys", async ({ page }) => {
  await page.goto(lessonRoute);

  await expect(page.getByRole("heading", { level: 1, name: "Hosts and Network Devices" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Choose a packet journey" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Wired host to local server" })).toBeChecked();

  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText(/Step 2 of/)).toBeVisible();
  await page.getByRole("button", { name: "Explore Layer 2 switch" }).click();
  await expect(page.locator(".device-details").getByRole("heading", { name: "Layer 2 switch" })).toBeVisible();
  await expect(page.locator(".device-details dt").getByText("Common failure", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Close device details" }).click();
  await expect(page.locator(".device-details")).toHaveCount(0);
  await expect(page.getByText(/Step 2 of/)).toBeVisible();

  await page.getByRole("radio", { name: "Wireless host to remote server" }).check();
  await expect(page.getByRole("radio", { name: "Wireless host to remote server" })).toBeChecked();
  await expect(page.getByText(/^Step 1 of \d+$/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
});

test("keeps the lesson usable on mobile without hydration errors or overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|cannot be a descendant/i.test(message.text())) {
      failures.push(message.text());
    }
  });

  await page.goto(lessonRoute);
  await expect(page.getByRole("group", { name: "Choose a packet journey" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Wired host to local server" })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  expect(failures).toEqual([]);
});

test("keeps topology relationships and device guidance available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(lessonRoute);

    await expect(page.getByRole("heading", { name: "Static topology guide" })).toBeVisible();
    await expect(page.getByText(/Wired PC → Layer 2 switch → local server/)).toBeVisible();
    await expect(page.getByText(/Replies follow the return path toward the original host/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Wireless access point", level: 4 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Firewall boundary", level: 4 })).toBeVisible();
  } finally {
    await context.close();
  }
});
