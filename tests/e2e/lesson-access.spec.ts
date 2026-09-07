import { expect, test } from "@playwright/test";

const lessonPath = "/learn/networking-foundations/how-networks-communicate";
const canonical = `https://packetsecrets.com${lessonPath}`;
// Actual account-only prose/answers plus the loader's protected fixture markers.
// No production Pro body exists yet; Pro exclusion is additionally covered by loader tests.
const protectedSentinels = [
  "Find the ARP request and reply first.",
  "The destination IP remains the remote server so routers can forward the packet toward it.",
  "What happens after a user enters a website address?",
  "Capture on the active host interface and choose a filter that matches your question.",
  "Check the active adapter, IPv4 address, subnet mask, default gateway",
  "ACCOUNT_ONLY_SENTINEL",
  "PRO_ONLY_SENTINEL",
];

test("anonymous direct lesson exposes public learning, canonical metadata, and safe network payloads", async ({ page }) => {
  const errors: string[] = [];
  const payloads: Array<Promise<{ url: string; text: string }>> = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    const contentType = response.headers()["content-type"] ?? "";
    const url = new URL(response.url());
    const isStaticAsset = url.pathname.startsWith("/_next/static/") || /\.(?:js|json)$/.test(url.pathname);
    if (isStaticAsset && !url.searchParams.has("_rsc") && /javascript|application\/json/.test(contentType)) {
      payloads.push(response.text().then((text) => ({ url: response.url(), text })).catch((error: unknown) => {
        errors.push(`Could not inspect response ${response.url()}: ${String(error)}`);
        return { url: response.url(), text: "" };
      }));
    }
  });

  const response = await page.goto(lessonPath);
  expect(response?.status()).toBe(200);
  const html = await response!.text();
  await expect(page.getByRole("heading", { level: 1, name: "How Networks Communicate" })).toBeVisible();
  await expect(page.locator(".lesson-content p").filter({ hasText: /source host must identify the destination/i })).toBeVisible();
  const next = page.getByRole("button", { name: "Next", exact: true });
  await next.click();
  await expect(page.getByText(/Step 2 of/)).toBeVisible();
  const boundary = page.getByRole("region", { name: "Continue this lesson for free" });
  await expect(boundary).toContainText("No payment required.");
  await expect(boundary).toBeVisible();
  expect(await next.evaluate((button) => Boolean(button.compareDocumentPosition(
    document.querySelector(".registration-boundary")!,
  ) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
  await expect(page).toHaveTitle("How Networks Communicate: A Beginner's Guide");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content", "Learn the decisions that move data between hosts and trace a packet across a network.",
  );
  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  const data = JSON.parse(await jsonLd.textContent() ?? "");
  expect(data.url).toBe(canonical);
  expect(data["@type"]).toBe("LearningResource");
  expect(data.isAccessibleForFree).toBe(true);
  expect(data.hasPart.map((part: { isAccessibleForFree: boolean }) => part.isAccessibleForFree)).toEqual([true, true, false, false, false, false]);
  expect(data.hasPart.at(-1)).toMatchObject({ name: "Pro Deep Dive", description: "Requires Packetsecrets Pro access." });

  // Save the RSC bytes before fulfillment so navigation cannot invalidate the body.
  const hostsRscPayloads: Array<{ url: string; text: string }> = [];
  await page.route((url) => (
    url.pathname === "/learn/networking-foundations/hosts-and-network-devices"
      && url.searchParams.has("_rsc")
  ), async (route) => {
    if (route.request().resourceType() === "document") {
      await route.continue();
      return;
    }
    const navigationResponse = await route.fetch();
    const body = await navigationResponse.body();
    hostsRscPayloads.push({ url: route.request().url(), text: body.toString("utf8") });
    await route.fulfill({ response: navigationResponse, body });
  });
  await page.getByRole("link", { name: "Next: Hosts and Network Devices" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Hosts and Network Devices" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(hostsRscPayloads.length, "Hosts navigation must yield an intercepted RSC payload").toBeGreaterThan(0);
  for (const { url, text } of hostsRscPayloads) {
    expect(text.trim(), `${url} must contain an RSC body`).not.toBe("");
  }
  const responses = await Promise.all(payloads);
  expect(responses.some(({ url }) => url.includes("_next/static"))).toBe(true);
  for (const { url, text } of [{ url: lessonPath, text: html }, ...hostsRscPayloads, ...responses]) {
    for (const sentinel of protectedSentinels) expect(text, `${url} leaked ${sentinel}`).not.toContain(sentinel);
  }
  expect(errors).toEqual([]);
});

test("public content and registration remain useful during no-JavaScript navigation", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
  try {
    const page = await context.newPage();
    const response = await page.goto(lessonPath);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "How Networks Communicate" })).toBeVisible();
    await expect(page.locator(".lesson-content p").filter({ hasText: /source host must identify the destination/i })).toBeVisible();
    await expect(page.getByRole("img", { name: "Data path from a PC through a switch and router to a server" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toContainText("No payment required.");
    for (const sentinel of protectedSentinels) expect(await response!.text()).not.toContain(sentinel);
    await page.getByRole("link", { name: "Next: Hosts and Network Devices" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Hosts and Network Devices" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
    await page.getByRole("link", { name: "Continue with Google or email" }).click();
    await expect(page).toHaveURL(/\/sign-in\?returnTo=/);
    await expect(page.getByText(/Account access is not available yet/i)).toBeVisible();
  } finally {
    await context.close();
  }
});

test("lesson layout preserves public player and registration in desktop and 360px themes", async ({ page }, testInfo) => {
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 900 });
    for (const colorScheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme });
      await page.goto(lessonPath);
      await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
      await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
      await page.screenshot({ path: testInfo.outputPath(`lesson-${width}-${colorScheme}.png`), fullPage: true });
    }
  }
});
