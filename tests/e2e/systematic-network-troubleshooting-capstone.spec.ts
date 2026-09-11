import { expect, test, type Page } from "@playwright/test";

const route = "/learn/networking-foundations/systematic-network-troubleshooting-capstone";

async function completeFault(page: Page, hypothesis: RegExp, prediction: RegExp, testName: RegExp, remediation: RegExp) {
  await page.getByLabel(hypothesis).click();
  await page.getByLabel(prediction).click();
  await page.getByLabel("calibrated").click();
  await page.getByRole("button", { name: testName }).click();
  await page.getByRole("button", { name: remediation }).click();
}

test("keeps protected incidents behind clickable access boundaries", async ({ page }) => {
  await page.goto(route);
  await expect(page.getByRole("heading", { level: 1, name: "Systematic Network Troubleshooting Capstone" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Scope: define the incident before touching the network" })).toBeVisible();
  await expect(page.getByLabel("Restore the branch portal")).toHaveCount(0);
  const contents = page.getByRole("button", { name: "Page contents" });
  await contents.focus(); await page.keyboard.press("Enter");
  await expect(page.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "1");
  await expect(page.getByRole("link", { name: /Guided branch incident.*Locked/ })).toHaveAttribute("href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fsystematic-network-troubleshooting-capstone%23guided-branch-incident");
  await contents.click(); await contents.click();
  await expect(page.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "2");
});

test("completes the guided sequential-fault incident only after full restoration", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-packetsecrets-test-viewer": "capstone-account-learner" });
  await page.goto(`${route}#guided-branch-incident`);
  await expect(page.getByLabel("Restore the branch portal")).toBeVisible();
  await completeFault(page, /access port is in the wrong VLAN/i, /switchport VLAN differs/i, /inspect client switchport/i, /move Gi1\/0\/18 to VLAN 20/i);
  await completeFault(page, /more-specific route overrides/i, /route lookup selects/i, /look up the portal route/i, /remove the stale \/32 route/i);
  await completeFault(page, /resolver has stale portal data/i, /DNS returns the old server/i, /resolve the portal name/i, /update and flush the portal record/i);
  await page.getByRole("button", { name: "Close incident" }).click();
  await expect(page.getByRole("status")).toContainText("restoration");
  for (const label of ["Addressing is correct", "Gateway adjacency resolves", "Access VLAN is correct", "Portal route is correct", "DNS returns the active portal", "TLS handshake succeeds", "Portal returns HTTP 200"]) await page.getByRole("button", { name: `Run verification: ${label}` }).click();
  await page.getByRole("button", { name: "Close incident" }).click();
  await expect(page.getByRole("status")).toContainText("Incident resolved");
  await expect(page.getByRole("button", { name: "Incident closed" })).toBeDisabled();
});

test("contains the capstone at 360px and honors reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  await page.getByRole("button", { name: "Page contents" }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.locator(".network-map__travelling-packet")).toHaveCSS("animation-name", "none");
});

test("restores authenticated access after a page reload", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-packetsecrets-test-viewer": "capstone-resume-learner" });
  await page.goto(route);
  await expect(page.getByLabel("Restore the branch portal")).toBeVisible();
  await completeFault(page, /access port is in the wrong VLAN/i, /switchport VLAN differs/i, /inspect client switchport/i, /move Gi1\/0\/18 to VLAN 20/i);
  await page.reload();
  await expect(page.getByLabel("Restore the branch portal")).toBeVisible();
  await expect(page.getByRole("button", { name: /Completed: Move Gi1\/0\/18 to VLAN 20/i })).toBeDisabled();
  await page.getByRole("button", { name: "Page contents" }).click();
  await expect(page.getByRole("link", { name: "Guided branch incident" })).toHaveAttribute("href", "#guided-branch-incident");
  await expect(page.getByRole("link", { name: /Sparse enterprise incident.*Pro.*Locked/ })).toBeVisible();
});
