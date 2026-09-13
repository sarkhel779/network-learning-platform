import { expect, test } from "@playwright/test";

const lesson = "/learn/networking-foundations/dhcp-and-automatic-address-configuration";

test("local audit preview reveals account and Pro sections without granting an account", async ({ page }) => {
  await page.goto(`${lesson}?audit=1`);
  await expect(page.getByText("Local audit preview", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Interactive DHCP lease state diagram" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Advanced RFC-level packet checks" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toHaveCount(0);
  await expect(page.locator("article[data-progress-attempt]")).toHaveCount(0);
});

test("ordinary lesson view keeps protected content locked", async ({ page }) => {
  await page.goto(lesson);
  await expect(page.getByText("Local audit preview", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Interactive DHCP lease state diagram" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
});

test("DHCP state diagram moves Discover toward server and Offer back toward client", async ({ page }) => {
  await page.goto(`${lesson}?audit=1#lease-timing-diagram`);
  const player = page.locator(".lease-state-player");
  await expect(player.getByRole("img", { name: "DHCP lease state diagram" })).toBeVisible();
  await player.getByRole("button", { name: "Next" }).click();
  await expect(player.getByTestId("dhcp-packet")).toHaveCSS("animation-name", "dhcp-packet-forward");
  await expect(player.getByTestId("dhcp-line-signal")).toHaveAttribute("data-route", "init-selecting");
  await expect(player.getByTestId("dhcp-line-signal")).toHaveCSS("animation-name", "lease-electric-traverse");
  await expect(player.getByRole("status")).toContainText("DHCPDISCOVER");
  await player.getByRole("button", { name: "Next" }).click();
  await expect(player.getByTestId("dhcp-packet")).toHaveCSS("animation-name", "dhcp-packet-reverse");
  await expect(player.getByTestId("dhcp-line-signal")).toHaveAttribute("data-route", "selecting-offer");
  await expect(player.getByRole("status")).toContainText("DHCPOFFER");
});
