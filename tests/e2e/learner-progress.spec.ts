import { expect, test } from "@playwright/test";

const lessonUrl = "/learn/networking-foundations/how-networks-communicate";

test.describe("learner progress", () => {
  test("saves a reading boundary, restores it, and exposes My learning", async ({ page }, testInfo) => {
    await page.setExtraHTTPHeaders({ "x-packetsecrets-test-viewer": `progress-${testInfo.project.name}` });
    await page.goto(lessonUrl);
    const readingBoundary = page.locator('.section-continue[data-anchor="communication-decisions"]');
    await expect(page.getByRole("button", { name: /Continue: Communication decisions/ })).toHaveCount(0);
    const saved = page.waitForResponse((response) =>
      response.url().endsWith("/api/learning/progress") && response.request().method() === "POST",
    );
    await readingBoundary.scrollIntoViewIfNeeded();
    const saveResponse = await saved;
    expect(saveResponse.status(), await saveResponse.text()).toBe(200);
    await expect(readingBoundary).toContainText("Progress saved");

    await page.reload();
    await expect(readingBoundary).toContainText("Progress saved");
    if (testInfo.project.name === "mobile-chromium") {
      await page.getByRole("button", { name: "Learning tools" }).click();
      await page.getByRole("dialog", { name: "Learning tools" }).getByRole("button", { name: "My learning" }).click();
    } else {
      await page.getByRole("toolbar", { name: "Learner workspace" }).getByRole("button", { name: "My learning" }).click();
    }
    const drawer = page.getByRole("dialog", { name: "My learning" });
    await expect(drawer.getByRole("heading", { name: "In progress" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "What Is a Computer Network?", exact: true })).toHaveAttribute("href", /#/);
  });

  test("supports the same progress drawer on mobile without horizontal overflow", async ({ page }, testInfo) => {
    await page.setExtraHTTPHeaders({ "x-packetsecrets-test-viewer": `drawer-${testInfo.project.name}` });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(lessonUrl);
    await page.getByRole("button", { name: "Learning tools" }).click();
    await page.getByRole("dialog", { name: "Learning tools" }).getByRole("button", { name: "My learning" }).click();
    await expect(page.getByRole("dialog", { name: "My learning" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test("retries a failed save with the same queued action", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Covered once; mobile uses the same progress client.");
    await page.setExtraHTTPHeaders({ "x-packetsecrets-test-viewer": "retry-learner" });
    let failOnce = true;
    await page.route("**/api/learning/progress", async (route) => {
      if (failOnce && route.request().method() === "POST") {
        failOnce = false;
        await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporary failure" }) });
      } else await route.continue();
    });
    await page.goto(lessonUrl);
    await page.locator('.section-continue[data-anchor="communication-decisions"]').scrollIntoViewIfNeeded();
    await expect(page.getByText("Progress was not saved.", { exact: true })).toBeVisible();
    const saved = page.waitForResponse((response) => response.url().endsWith("/api/learning/progress") && response.status() === 200);
    await page.getByRole("button", { name: "Retry saving" }).click();
    await saved;
    await expect(page.locator('.section-continue[data-anchor="communication-decisions"]')).toContainText("Progress saved");
  });

  test("counts an incorrect check as attempted and supports a confirmed restart", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Covered once; responsive controls are tested separately.");
    await page.setExtraHTTPHeaders({ "x-packetsecrets-test-viewer": "restart-learner" });
    await page.goto(lessonUrl);
    const check = page.getByRole("group", { name: /Knowledge check: A PC is sending/ });
    await check.getByRole("radio", { name: /router's IP address/ }).check();
    const attempted = page.waitForResponse((response) => response.url().endsWith("/api/learning/progress") && response.status() === 200);
    await check.getByRole("button", { name: "Check answer" }).click();
    await attempted;
    await expect(page.getByText("Not quite.", { exact: true })).toBeVisible();
    await expect(page.getByText("Answer saved", { exact: true })).toBeVisible();

    await page.reload();
    await page.getByRole("toolbar", { name: "Learner workspace" }).getByRole("button", { name: "My learning" }).click();
    await expect(page.getByRole("dialog", { name: "My learning" }).getByText("1 answer to review")).toBeVisible();
    await page.keyboard.press("Escape");

    await page.getByRole("region", { name: "Lesson progress" }).getByRole("button", { name: "Restart lesson" }).click();
    const dialog = page.getByRole("dialog", { name: "Restart lesson?" });
    await expect(dialog).toContainText("previous attempts and answers remain in your history");
    const restarted = page.waitForResponse((response) => response.url().endsWith("/api/learning/progress/restart") && response.status() === 200);
    await dialog.getByRole("button", { name: "Confirm restart" }).click();
    await restarted;
    await expect(page.getByRole("region", { name: "Lesson progress" })).toContainText("0% complete");
  });
});
