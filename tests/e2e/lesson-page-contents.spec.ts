import { expect, test } from "@playwright/test";

test("ordinary lessons reveal their own packet route with a static chevron", async ({ page }) => {
  await page.goto("/learn/networking-foundations/hosts-and-network-devices");
  const contents = page.getByRole("navigation", { name: "Page contents" });
  const button = contents.getByRole("button", { name: "Page contents" });
  const chevron = button.locator(".dns-map__toggle");

  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(chevron).toHaveCSS("transform", "none");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(chevron).toHaveCSS("transform", "none");
  await expect(contents.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "1");
  await expect(contents.getByRole("link", { name: "What is a host?" })).toHaveAttribute("href", "#what-is-a-host");
  await expect(contents.getByRole("link", { name: /Windows checks.*Locked/ })).toHaveAttribute("href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fhosts-and-network-devices%23windows-checks");
  await button.click();
  await button.click();
  await expect(contents.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "2");
});
