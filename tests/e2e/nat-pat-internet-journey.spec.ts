import { expect, test } from "@playwright/test";

const route = "/learn/networking-foundations/nat-pat-and-the-complete-internet-packet-journey";

test("renders the complete public NAT model without protected content", async ({ page }) => {
  await page.goto(route);
  await expect(page.getByRole("heading", { level: 1, name: "NAT, PAT and the Complete Internet Packet Journey" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The IPv4 translation boundary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Account practice: control/i })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Pro U-Turn NAT lab/i })).toHaveCount(0);
});

test("replays Page contents and preserves the locked Pro hairpin anchor", async ({ page }) => {
  await page.goto(route);
  const button = page.getByRole("button", { name: "Page contents" });
  await button.click();
  await expect(page.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "1");
  await expect(page.getByRole("link", { name: /U-Turn NAT lab.*Pro.*Locked/ })).toHaveAttribute(
    "href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fnat-pat-and-the-complete-internet-packet-journey%23pro-u-turn-nat-lab",
  );
  await button.click();
  await button.click();
  await expect(page.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "2");
});

test("keeps the authenticated PAT journey synchronized", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-packetsecrets-test-viewer": "nat-account-learner" });
  await page.goto(route);
  const player = page.getByRole("region", { name: "PAT Internet journey" });
  await expect(player.getByTestId("nat-packet")).toHaveAttribute("data-step", "private-request");
  await player.getByRole("button", { name: "Next" }).click();
  await expect(player.getByTestId("nat-packet")).toHaveAttribute("data-step", "translated");
  await expect(player.getByRole("row", { name: /pat-https-1/i })).toHaveAttribute("data-active", "true");
});

test("contains the NAT experience at 360px with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  await page.getByRole("button", { name: "Page contents" }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
