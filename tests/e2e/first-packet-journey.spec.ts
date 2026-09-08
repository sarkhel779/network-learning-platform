import { expect, test } from "@playwright/test";

const lessonRoute = "/learn/networking-foundations/first-packet-journey-through-a-small-network";

test("teaches the complete journey with labelled interfaces and inspectable packet layers", async ({ page }) => {
  await page.goto(lessonRoute);

  await expect(page.getByRole("heading", { level: 1, name: "A Packet’s First Journey Through a Small Network" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Complete packet journey" })).toBeVisible();
  await expect(page.getByText("eth0", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Gi0/24", { exact: true })).toBeVisible();
  await expect(page.getByRole("group", { name: "Choose packet inspection depth" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Host or device decision" })).toBeVisible();

  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("heading", { name: "ARP message" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "IP packet" })).not.toBeVisible();

  await page.getByRole("radio", { name: "Technical inspection" }).click();
  await expect(page.getByRole("heading", { name: "Technical packet fields" })).toBeVisible();
  await expect(page.getByText("ARP opcode")).toBeVisible();
});

test("keeps practice behind the account boundary and avoids mobile overflow", async ({ page }) => {
  await page.goto(lessonRoute);
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
  await expect(page.getByText("ip route get 198.51.100.20")).not.toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
