import { expect, test } from "@playwright/test";

test("describes the premium pathway honestly without offering a purchase", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByText("Premium modules are opening after the learning preview.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact the instructor" })).toHaveAttribute(
    "href",
    "/contact",
  );
  await expect(page.getByRole("button", { name: /buy|purchase|subscribe/i })).toHaveCount(0);
});

test("all header and footer links lead to successful pages", async ({ page, request }) => {
  await page.goto("/");

  const navigationLinks = page.locator("header a, footer a");
  const count = await navigationLinks.count();
  expect(count).toBeGreaterThan(1);

  for (let index = 0; index < count; index += 1) {
    const href = await navigationLinks.nth(index).getAttribute("href");
    expect(href).toBeTruthy();
    const response = await request.get(href!);
    expect(response.ok(), `${href} returned ${response.status()}`).toBe(true);
  }
});

test("unknown lessons return not found while the published models lesson resolves", async ({ request }) => {
  const unknownResponse = await request.get(
    "/learn/networking-foundations/not-a-real-lesson",
  );
  expect(unknownResponse.status()).toBe(404);

  const publishedResponse = await request.get(
    "/learn/networking-foundations/osi-and-tcp-ip-models",
  );
  expect(publishedResponse.ok()).toBe(true);
  const connectionResponse = await request.get("/learn/networking-foundations/cables-fibre-wireless-and-network-connections");
  expect(connectionResponse.status()).toBe(200);
});

test("Hosts advances to connections and the following planned lesson stays non-clickable", async ({ page }) => {
  await page.goto("/learn/networking-foundations/hosts-and-network-devices");
  await page.getByRole("link", { name: "Next: Cables, Fibre, Wireless and Network Connections", exact: true }).click();
  await expect(page).toHaveURL("/learn/networking-foundations/cables-fibre-wireless-and-network-connections");
  const navigation = page.getByRole("navigation", { name: "Lesson navigation" });
  await expect(navigation.getByText("Next: Hubs, Bridges and Switches — Coming later", { exact: true })).toBeVisible();
  await expect(navigation.getByRole("link", { name: /^Next:/ })).toHaveCount(0);
  await navigation.getByRole("link", { name: "Previous: Hosts, Clients, Servers and Network Interfaces", exact: true }).click();
  await expect(page).toHaveURL("/learn/networking-foundations/hosts-and-network-devices");
});
