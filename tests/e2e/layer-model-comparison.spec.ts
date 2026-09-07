import { expect, test } from "@playwright/test";

test("keeps the OSI and TCP/IP comparison readable without narrow-screen overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/learn/networking-foundations/osi-and-tcp-ip-models");

  const comparison = page.locator("[data-layer-model-comparison]");
  await expect(comparison).toBeVisible();
  await expect(comparison.getByRole("heading", { name: "OSI model — 7 layers" })).toBeVisible();
  await expect(comparison.getByRole("heading", { name: "TCP/IP model — 4 layers" })).toBeVisible();
  await expect(comparison.getByRole("listitem")).toHaveCount(11);
  await expect(comparison.getByText(/TCP\/IP Application maps OSI layers 7, 6, and 5/)).toBeVisible();

  const overflow = await page.evaluate(() => {
    const element = document.querySelector<HTMLElement>("[data-layer-model-comparison]");
    if (!element) return { page: true, comparison: true };

    return {
      page: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      comparison: element.scrollWidth > element.clientWidth,
    };
  });

  expect(overflow).toEqual({ page: false, comparison: false });
});
