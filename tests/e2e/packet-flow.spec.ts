import { expect, test, type Locator, type Page } from "@playwright/test";

const lessonRoute = "/learn/networking-foundations/how-networks-communicate";
const totalSteps = 18;

function progress(page: Page, step: number): Locator {
  return page.getByText(`Step ${step} of ${totalSteps}`, { exact: true });
}

function technicalDetails(page: Page): Locator {
  return page.locator("details").filter({ has: page.getByText("Technical packet details", { exact: true }) });
}

function currentProgress(page: Page): Locator {
  return page.getByText(/^Step \d+ of 18$/, { exact: true });
}

async function openLesson(page: Page) {
  await page.goto(lessonRoute);
  await expect(page.getByRole("heading", { name: "Interactive packet journey" })).toBeVisible();
}

async function pause(page: Page) {
  await page.getByRole("button", { name: "Pause", exact: true }).click();
}

async function advanceTo(page: Page, currentStep: number, targetStep: number) {
  for (let step = currentStep + 1; step <= targetStep; step += 1) {
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(progress(page, step)).toBeVisible();
  }
}

test("autoplays, pauses, and resumes the packet journey", async ({ page }) => {
  await openLesson(page);
  await expect(progress(page, 1)).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();

  await expect(progress(page, 2)).toBeVisible({ timeout: 4_500 });
  await pause(page);
  const pausedProgress = await currentProgress(page).textContent();

  await page.waitForTimeout(2_000);
  await expect(currentProgress(page)).toHaveText(pausedProgress ?? "");

  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(progress(page, 3)).toBeVisible({ timeout: 3_000 });
});

test("supports manual navigation and restarting at normal motion", async ({ page }) => {
  await openLesson(page);
  await pause(page);

  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(progress(page, 2)).toBeVisible();
  await expect(page.getByRole("heading", { name: "The PC broadcasts an ARP request" })).toBeVisible();

  await page.getByRole("button", { name: "Previous", exact: true }).click();
  await expect(progress(page, 1)).toBeVisible();

  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(progress(page, 1)).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
});

test("applies 2x speed to autoplay", async ({ page }) => {
  await openLesson(page);
  await pause(page);

  const speed = page.getByRole("combobox", { name: "Playback speed" });
  await speed.selectOption("2");
  await expect(speed).toHaveValue("2");

  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(progress(page, 2)).toBeVisible({ timeout: 2_200 });
});

test("shows the full ARP and ICMP sequence with packet details", async ({ page }) => {
  await openLesson(page);
  await pause(page);
  await expect(page.locator('[data-device-id="pc"]')).toHaveAttribute("data-active", "true");

  await advanceTo(page, 1, 2);
  await expect(progress(page, 2)).toBeVisible();
  await expect(page.getByRole("heading", { name: "The PC broadcasts an ARP request" })).toBeVisible();
  await expect(page.locator('[data-packet-marker="true"]')).toHaveAttribute("data-broadcast", "true");
  let details = technicalDetails(page);
  await details.locator("summary").click();
  await expect(details.getByText("EtherType", { exact: true })).toBeVisible();
  await expect(details.getByText("0x0806", { exact: true })).toBeVisible();
  await expect(details.getByText("ARP opcode", { exact: true })).toBeVisible();
  await expect(details.getByText("1 (request)", { exact: true })).toBeVisible();

  await advanceTo(page, 2, 4);
  await expect(progress(page, 4)).toBeVisible();
  await expect(page.getByRole("heading", { name: "The router replies with its LAN MAC address" })).toBeVisible();
  details = technicalDetails(page);
  await details.locator("summary").click();
  await expect(details.getByText("2 (reply)", { exact: true })).toBeVisible();

  await advanceTo(page, 4, 7);
  await expect(progress(page, 7)).toBeVisible();
  await expect(page.getByRole("heading", { name: "The PC creates an ICMP echo request" })).toBeVisible();
  await expect(page.getByText("TTL", { exact: true })).toBeVisible();
  await expect(page.getByText("64", { exact: true })).toBeVisible();

  await advanceTo(page, 7, 8);
  await expect(progress(page, 8)).toBeVisible();
  details = technicalDetails(page);
  await details.locator("summary").click();
  await expect(details.getByText("ICMP type", { exact: true })).toBeVisible();
  await expect(details.getByText("8 (Echo request)", { exact: true })).toBeVisible();

  await advanceTo(page, 8, 10);
  await expect(progress(page, 10)).toBeVisible();
  details = technicalDetails(page);
  await details.locator("summary").click();
  await expect(details.getByText("TTL", { exact: true })).toBeVisible();
  await expect(details.getByText("63", { exact: true })).toBeVisible();
  await expect(details.getByText("TTL transition", { exact: true })).toBeVisible();
  await expect(details.getByText("64 → 63", { exact: true })).toBeVisible();

  await advanceTo(page, 10, 13);
  await expect(progress(page, 13)).toBeVisible();
  await expect(page.getByRole("heading", { name: "The server creates an ICMP echo reply" })).toBeVisible();

  await advanceTo(page, 13, 14);
  await expect(progress(page, 14)).toBeVisible();
  await expect(page.getByText("ICMP echo reply", { exact: true })).toBeVisible();
  details = technicalDetails(page);
  await details.locator("summary").click();
  await expect(details.getByText("ICMP type", { exact: true })).toBeVisible();
  await expect(details.getByText("0 (Echo reply)", { exact: true })).toBeVisible();

  await advanceTo(page, 14, totalSteps);
  await expect(progress(page, totalSteps)).toBeVisible();
  await expect(page.getByText("Ping succeeds.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Restart", exact: true })).toBeEnabled();
});

test("supports keyboard playback controls in their DOM order", async ({ page }) => {
  await openLesson(page);

  await page.getByRole("button", { name: "Pause", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(progress(page, 2)).toBeVisible();

  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Previous", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Restart", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("combobox", { name: "Playback speed" })).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Restart", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(progress(page, 1)).toBeVisible();
});

test("keeps reduced-motion playback paused until explicitly started", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openLesson(page);

  await expect(progress(page, 1)).toBeVisible();
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  await expect(page.locator('[data-reduced-motion="true"]')).toHaveCount(2);
  await page.waitForTimeout(3_100);
  await expect(progress(page, 1)).toBeVisible();

  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(progress(page, 2)).toBeVisible({ timeout: 4_500 });
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(progress(page, 1)).toBeVisible();
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
});

test("keeps the topology and inspector visible without responsive overflow", async ({ page }) => {
  await openLesson(page);
  await expect(page.getByRole("img", { name: "ARP and ICMP across two networks" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Packet inspector" })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);

  const svgBox = await page.getByRole("img", { name: "ARP and ICMP across two networks" }).boundingBox();
  const activeBox = await page.getByText(/^Active:/).boundingBox();
  expect(svgBox).not.toBeNull();
  expect(activeBox).not.toBeNull();
  expect(svgBox!.y + svgBox!.height).toBeLessThanOrEqual(activeBox!.y);
});
