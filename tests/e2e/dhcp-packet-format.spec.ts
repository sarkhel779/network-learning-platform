import { expect, test } from "@playwright/test";

test("DHCP introduces its packet header immediately after automatic configuration", async ({ page }) => {
  await page.goto("/learn/networking-foundations/dhcp-and-automatic-address-configuration");

  const packetHeading = page.getByRole("heading", { level: 2, name: "Packet Format" });
  await expect(packetHeading).toBeVisible();
  const headingOrder = await page.locator(".lesson-content h2").allTextContents();
  expect(headingOrder.slice(1, 4)).toEqual([
    "Why automatic configuration exists",
    "Packet Format",
    "DHCP roles: client, server, scope, lease, and relay",
  ]);

  const diagram = page.getByRole("table", { name: "IPv4 DHCP packet format" });
  await expect(diagram).toBeVisible();
  for (const label of ["Operation code", "Hardware type", "Hardware length", "Hop count", "Transaction ID", "Client IP address", "Your IP address", "Server IP address", "Gateway IP address", "Client hardware address", "Magic cookie", "Options (variable length)"]) {
    await expect(diagram.getByText(label, { exact: false })).toBeVisible();
  }
});
