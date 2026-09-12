import { expect, test } from "@playwright/test";

test("learner can experiment with a missing gateway and then restore the packet route", async ({ page }) => {
  await page.goto("/labs");
  await expect(page.getByRole("heading", { level: 1, name: "Interactive Packet Lab" })).toBeVisible();
  await page.getByRole("tab", { name: "Config" }).click();
  await page.getByRole("radio", { name: /No default gateway/i }).check();
  await page.getByRole("tab", { name: "Lab Topology" }).click();
  await expect(page.getByRole("status").first()).toContainText("blocked");
  await expect(page.getByTestId("moving-lab-packet")).toHaveCount(0);
  await page.getByRole("tab", { name: "Packet Flow" }).click();
  await expect(page.getByText(/no Ethernet frame is sent/i)).toBeVisible();
  await page.getByRole("tab", { name: "Config" }).click();
  await page.getByRole("radio", { name: /Remote server · gateway available/i }).check();
  await page.getByRole("tab", { name: "Lab Topology" }).click();
  await expect(page.getByTestId("moving-lab-packet")).toBeVisible();
  await page.getByRole("button", { name: "Next hop" }).click();
  await expect(page.getByRole("status").first()).toContainText("Switch forwards to the router");
  await page.getByRole("radio", { name: /The router \(default gateway\)/i }).check();
  await page.getByRole("button", { name: "Check prediction" }).click();
  await expect(page.getByRole("status", { name: "Prediction feedback" })).toContainText("Correct");
});

test("desktop shows the whole packet path without clipping the server", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 900, "small screens scroll the topology");
  await page.goto("/labs");
  const bounds = await page.locator(".sample-lab__panel, .sample-lab__device").evaluateAll((elements) => ({
    panelRight: elements[0].getBoundingClientRect().right,
    serverRight: elements.at(-1)!.getBoundingClientRect().right,
  }));
  expect(bounds.serverRight).toBeLessThanOrEqual(bounds.panelRight);
});
