import { expect, test } from "@playwright/test";

test("primary navigation highlights the current section as learners move through the site", async ({ page }) => {
  test.setTimeout(60_000);
  const cases = [
    { path: "/", active: "Home" },
    { path: "/paths/networking-foundations", active: "Courses" },
    { path: "/learn/networking-foundations/hosts-and-network-devices", active: "Courses" },
    { path: "/labs", active: "Labs" },
    { path: "/pricing", active: "Pricing" },
  ];

  for (const { path, active } of cases) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const navigation = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(navigation.getByRole("link", { name: active })).toHaveAttribute("aria-current", "page");
    await expect(navigation.locator('a[aria-current="page"]')).toHaveCount(1);
    await expect(navigation.getByRole("link", { name: active })).toHaveCSS("border-bottom-color", "rgb(35, 214, 168)");
  }
});
