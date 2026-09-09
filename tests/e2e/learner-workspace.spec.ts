import { expect, test } from "@playwright/test";

const lessonUrl = "/learn/networking-foundations/vlans-access-ports-and-trunks#interactive-tag-journey";
const toolLabels = [
  "Course contents",
  "My learning",
  "Notes",
  "Bookmarks",
  "Practice",
  "Glossary",
  "Feedback",
  "Account",
  "Pro",
];

test("keeps the anonymous workspace limited to course contents", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(lessonUrl);
  const toolbar = page.getByRole("toolbar", { name: "Learner workspace" });
  await expect(toolbar.getByRole("button")).toHaveText(["Course contents"]);

  await toolbar.getByRole("button", { name: "Course contents" }).click();
  await expect(page.getByRole("dialog", { name: "Course contents" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/#interactive-tag-journey$/);
  await expect(toolbar.getByRole("button", { name: "Course contents" })).toBeFocused();
});

test.describe("authenticated workspace", () => {
  test.use({ extraHTTPHeaders: { "x-packetsecrets-test-viewer": "learner-1" } });

  test("opens one desktop drawer and switches tools in order", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(lessonUrl);
    const toolbar = page.getByRole("toolbar", { name: "Learner workspace" });
    await expect(toolbar.getByRole("button")).toHaveText(toolLabels);

    await toolbar.getByRole("button", { name: "Notes" }).click();
    await expect(page.getByRole("dialog", { name: "Notes" })).toBeVisible();
    await page.keyboard.press("Escape");
    await toolbar.getByRole("button", { name: "Bookmarks" }).click();
    await expect(page.getByRole("dialog", { name: "Bookmarks" })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await expect(page).toHaveURL(/#interactive-tag-journey$/);
  });

  test("makes every tool reachable from the mobile sheet without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(lessonUrl);
    await expect(page.getByRole("toolbar", { name: "Learner workspace" })).toBeHidden();

    const trigger = page.getByRole("button", { name: "Learning tools" });
    await trigger.click();
    const sheet = page.getByRole("dialog", { name: "Learning tools" });
    await expect(sheet.locator(".learner-workspace-mobile-menu > button")).toHaveText(toolLabels);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);

    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});
