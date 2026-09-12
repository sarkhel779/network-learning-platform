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
    const activeLink = navigation.getByRole("link", { name: active });
    await expect(activeLink).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(activeLink).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
    await expect(activeLink).toHaveCSS("color", "rgb(107, 242, 206)");
  }

  await page.goto("/labs", { waitUntil: "domcontentloaded" });
  const courses = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Courses" });
  await courses.hover();
  await expect(courses).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(courses).toHaveCSS("color", "rgb(86, 234, 201)");
});
