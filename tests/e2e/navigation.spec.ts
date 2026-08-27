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

test("unknown and unpublished lessons return not found", async ({ request }) => {
  const unknownResponse = await request.get(
    "/learn/networking-foundations/not-a-real-lesson",
  );
  expect(unknownResponse.status()).toBe(404);

  const unpublishedResponse = await request.get(
    "/learn/networking-foundations/hosts-and-network-devices",
  );
  expect(unpublishedResponse.status()).toBe(404);
});
