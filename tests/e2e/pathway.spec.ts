import { expect, test } from "@playwright/test";

test("shows the networking pathway and its published lesson link", async ({ page }) => {
  await page.goto("/paths/networking-foundations");

  await expect(
    page.getByRole("heading", { level: 1, name: "Networking Foundations" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /how networks communicate/i }),
  ).toHaveAttribute(
    "href",
    "/learn/networking-foundations/how-networks-communicate",
  );
});

test("does not overflow at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/networking-foundations");

  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
});
