import { expect, test } from "@playwright/test";

const lessonRoute = "/learn/networking-foundations/ethernet-frames-and-mac-addresses";

test("explores Ethernet frame anatomy and four delivery modes", async ({ page }) => {
  await page.goto(lessonRoute);

  await expect(page.getByRole("heading", { level: 1, name: "Ethernet Frames and MAC Addresses" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Ethernet delivery address comparison" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Ethernet frame fields" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Known unicast", exact: true })).toBeChecked();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();

  await page.getByRole("radio", { name: "Broadcast" }).click();
  await expect(page.getByText("FF:FF:FF:FF:FF:FF").first()).toBeVisible();
  await page.getByRole("radio", { name: "Multicast" }).click();
  await expect(page.getByText(/interested receiver group/i).first()).toBeVisible();
  await page.getByRole("radio", { name: "Unknown unicast" }).click();
  await expect(page.getByText(/still a unicast destination/i).first()).toBeVisible();
});

test("keeps account exercises protected and avoids responsive overflow", async ({ page }) => {
  await page.goto(lessonRoute);

  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
  await expect(page.getByText("eth.fcs.status")).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
