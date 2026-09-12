import { expect, test } from "@playwright/test";

test("places a static glow at the page corner without a header line", async ({ page }) => {
  await page.goto("/");
  const main = page.locator(".home-refresh");
  const styles = await main.evaluate((element) => {
    const container = getComputedStyle(element);
    const glow = getComputedStyle(element, "::before");
    const heroGlow = getComputedStyle(element.querySelector(".home-hero")!, "::before");
    const header = getComputedStyle(document.querySelector(".site-header")!);
    const link = element.querySelector("a.home-button-primary")!;
    const bounds = link.getBoundingClientRect();
    const topmost = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    return {
      position: container.position,
      right: glow.right,
      glowAnimation: glow.animationName,
      glowPointerEvents: glow.pointerEvents,
      glowBackground: glow.backgroundImage,
      heroGlowContent: heroGlow.content,
      headerBorderWidth: header.borderBottomWidth,
      linkIsTopmost: topmost === link || link.contains(topmost),
    };
  });
  expect(styles).toMatchObject({
    position: "relative",
    right: "-160px",
    glowAnimation: "none",
    glowPointerEvents: "none",
    heroGlowContent: "none",
    headerBorderWidth: "0px",
    linkIsTopmost: true,
  });
  expect(styles.glowBackground).toContain("radial-gradient");
});

test("introduces the beginner networking pathway", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /understand how networks really work/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /start networking foundations/i })).toHaveAttribute(
    "href",
    "/paths/networking-foundations",
  );
});
