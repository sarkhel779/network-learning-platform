import { expect, test } from "@playwright/test";

test("ordinary lessons reveal their own packet route without an arrow", async ({ page }) => {
  await page.goto("/learn/networking-foundations/hosts-and-network-devices");
  const contents = page.getByRole("navigation", { name: "Page contents" });
  const button = contents.getByRole("button", { name: "Page contents" });

  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(button).toHaveText("Page contents");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(button).toHaveText("Page contents");
  await expect(contents.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "1");
  await expect(contents.getByRole("link", { name: "What is a host?" })).toHaveAttribute("href", "#what-is-a-host");
  await expect(contents.getByRole("link", { name: /Windows checks.*Locked/ })).toHaveAttribute("href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fhosts-and-network-devices%23windows-checks");
  await button.click();
  await button.click();
  await expect(contents.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "2");
});
