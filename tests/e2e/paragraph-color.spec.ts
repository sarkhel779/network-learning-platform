import { expect, test } from "@playwright/test";

test("paragraph copy uses soft gray-blue while headings stay bright", async ({ page }) => {
  await page.goto("/");
  const homeCopy = page.getByText("Learn networking through clear explanations, visual packet journeys, and hands-on practice.");
  await expect(homeCopy).toHaveCSS("color", "rgb(139, 152, 184)");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("color", "rgb(243, 248, 251)");

  await page.goto("/learn/networking-foundations/dhcp-and-automatic-address-configuration");
  await expect(page.getByText(/An IPv4 host needs an address, prefix, gateway/)).toHaveCSS("color", "rgb(139, 152, 184)");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("color", "rgb(245, 248, 252)");
});

test("light theme keeps paragraph copy dark enough for the light surface", async ({ page }) => {
  await page.goto("/learn/networking-foundations/dhcp-and-automatic-address-configuration");
  await page.getByRole("switch", { name: "Dark mode" }).click();
  await expect(page.getByText(/An IPv4 host needs an address, prefix, gateway/))
    .toHaveCSS("color", "rgb(82, 96, 119)");
  await page.goto("/");
  await expect(page.getByText("Learn networking through clear explanations, visual packet journeys, and hands-on practice."))
    .toHaveCSS("color", "rgb(139, 152, 184)");
  await expect(page.locator(".site-footer p").first()).toHaveCSS("color", "rgb(139, 152, 184)");
});

test("paragraph copy stays consistent across public pages", async ({ page }) => {
  for (const path of ["/", "/labs", "/pricing", "/sign-in", "/learn/networking-foundations/how-networks-communicate"]) {
    await page.goto(path);
    const paragraphs = page.locator("main p:not(.home-eyebrow)");
    const count = await paragraphs.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(paragraphs.nth(index)).toHaveCSS("color", "rgb(139, 152, 184)");
    }
  }
});

test("lesson prose bullets match paragraphs without dimming headings", async ({ page }) => {
  await page.goto("/learn/networking-foundations/how-networks-communicate");
  const bullet = page.locator(".lesson-content li", { hasText: "decides whether the destination is local or remote" });
  await expect(bullet).toHaveCSS("color", "rgb(139, 152, 184)");
  await expect(page.getByRole("heading", { name: "The decisions behind communication" }))
    .toHaveCSS("color", "rgb(245, 248, 252)");

  await page.getByRole("switch", { name: "Dark mode" }).click();
  await expect(bullet).toHaveCSS("color", "rgb(82, 96, 119)");
});
