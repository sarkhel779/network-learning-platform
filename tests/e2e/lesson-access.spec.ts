import { expect, test } from "@playwright/test";

const lessonPath = "/learn/networking-foundations/how-networks-communicate";
const canonical = `https://packetsecrets.com${lessonPath}`;
const publishedLessons = [
  { slug: "how-networks-communicate", title: "What Is a Computer Network?" },
  { slug: "hosts-and-network-devices", title: "Hosts, Clients, Servers and Network Interfaces" },
  { slug: "cables-fibre-wireless-and-network-connections", title: "Cables, Fibre, Wireless and Network Connections" },
  { slug: "osi-and-tcp-ip-models", title: "OSI and TCP/IP Models" },
];
// Actual account-only prose/answers plus the loader's protected fixture markers.
// No production Pro body exists yet; Pro exclusion is additionally covered by loader tests.
const protectedSentinels = [
  "Desktop near a home router",
  "Laptop used throughout a small office",
  "Fixed workstation in a noisy workshop",
  "Two buildings on a campus",
  "High-capacity data-centre interconnect",
  "Temporary classroom network",
  "The recommended connection for a nearby desktop is copper Ethernet.",
  "Wireless meets the mobility requirement when coverage and airtime capacity are adequate.",
  "Good signal strength does not guarantee free airtime.",
  "transmitter output, loss, and receiver sensitivity.",
  "CONNECTION_MEDIA_ACCOUNT_SENTINEL",
  "Find the ARP request and reply first.",
  "The destination IP remains the remote server so routers can forward the packet toward it.",
  "What happens after a user enters a website address?",
  "Capture on the active host interface and choose a filter that matches your question.",
  "Check the active adapter, IPv4 address, subnet mask, default gateway",
  "Which local device should receive the first Ethernet frame?",
  "The IP packet still names the remote server as its destination",
  "A user can reach local devices, but remote destinations fail",
  "Several wired hosts lose connectivity when one access switch becomes unavailable",
  "A wireless laptop is disconnected from its access point while wired users still work",
  "Start at the shared switch, its power and uplinks",
  "Investigate the wireless association first",
  "Which item is the best example of Internet or OSI Network-layer information?",
  "How would you explain encapsulation and compare OSI with TCP/IP in an interview?",
  "Layered models help teams describe one browser-to-server exchange",
  "A laptop can move from Ethernet to Wi-Fi while its browser",
  "A UDP exchange can use the same",
  "ACCOUNT_ONLY_SENTINEL",
  "PRO_ONLY_SENTINEL",
];

test("anonymous direct lesson exposes public learning, canonical metadata, and safe network payloads", async ({ page, request }) => {
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

  // Intercept before the first visit so both prefetch and navigation RSC bodies
  // are captured, even if a visible curriculum link was prefetched early.
  const navigationRscPayloads: Array<{ url: string; text: string }> = [];
  const destinationPaths = publishedLessons.slice(1).map(({ slug }) => `/learn/networking-foundations/${slug}`);
  await page.route((url) => (
    destinationPaths.includes(url.pathname)
      && url.searchParams.has("_rsc")
  ), async (route) => {
    if (route.request().resourceType() === "document") {
      await route.continue();
      return;
    }
    const navigationResponse = await route.fetch();
    const body = await navigationResponse.body();
    navigationRscPayloads.push({ url: route.request().url(), text: body.toString("utf8") });
    await route.fulfill({ response: navigationResponse, body });
  });

  const response = await page.goto(lessonPath);
  expect(response?.status()).toBe(200);
  const html = await response!.text();
  await expect(page.getByRole("heading", { level: 1, name: "What Is a Computer Network?" })).toBeVisible();
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

  try {
    for (const { slug, title } of publishedLessons.slice(1)) {
      const desktop = page.locator(".lesson-curriculum--desktop");
      const curriculum = await desktop.isVisible()
        ? desktop : page.locator("details.lesson-curriculum--mobile");
      const link = curriculum.getByRole("link", { name: new RegExp(title) });
      if (!await link.isVisible()) await curriculum.locator("summary").click();
      await expect(link).toBeVisible();
      await link.click();
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      if (slug === "osi-and-tcp-ip-models") {
        await expect(page.locator(".lesson-content")).toBeEmpty();
        await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
      } else if (slug === "cables-fibre-wireless-and-network-connections") {
        await expect(page.getByRole("group", { name: "Compare connection qualities" })).toBeVisible();
        await expect(page.getByRole("group", { name: "Choose a connection scenario" })).toHaveCount(0);
        await expect(page.getByRole("button", { name: "I know this—proceed to advanced" })).toHaveCount(0);
        await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
      } else {
        await expect(page.getByRole("group", { name: "Wired host to local server", exact: true })).toBeVisible();
      }
      await page.waitForLoadState("networkidle");
      expect(navigationRscPayloads.some(({ url }) => new URL(url).pathname === `/learn/networking-foundations/${slug}`), `${slug} must yield an intercepted RSC payload`).toBe(true);
    }
  } finally {
    // Finish every captured response before auditing it or closing the page.
    await page.unrouteAll({ behavior: "wait" });
  }
  for (const { url, text } of navigationRscPayloads) {
    expect(text.trim(), `${url} must contain an RSC body`).not.toBe("");
    if (new URL(url).pathname.endsWith("/osi-and-tcp-ip-models")) {
      expect(text).not.toMatch(/data-layer-model-comparison|encapsulation-player|data-current-pdu/);
    }
  }
  const documents = await Promise.all(publishedLessons.map(async ({ slug }) => {
    const url = `/learn/networking-foundations/${slug}`;
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
    const text = await response.text();
    if (slug === "osi-and-tcp-ip-models") {
      expect(text).not.toMatch(/data-layer-model-comparison|encapsulation-player|data-current-pdu/);
    }
    return { url, text };
  }));
  const responses = await Promise.all(payloads);
  expect(responses.some(({ url }) => url.includes("_next/static"))).toBe(true);
  for (const { url, text } of [{ url: lessonPath, text: html }, ...documents, ...navigationRscPayloads, ...responses]) {
    for (const sentinel of protectedSentinels) expect(text, `${url} leaked ${sentinel}`).not.toContain(sentinel);
  }
  expect(errors).toEqual([]);
});

test("public tables expose row and column headers and remain keyboard-scrollable at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const [slug, caption, columns, rows] of [
    ["hosts-and-network-devices", "Network device roles", 4, 6],
    ["cables-fibre-wireless-and-network-connections", "Connection media at a glance", 5, 4],
  ] as const) {
    await page.goto(`/learn/networking-foundations/${slug}`);
    const table = page.getByRole("table", { name: caption, exact: true });
    await expect(table.getByRole("columnheader")).toHaveCount(columns);
    await expect(table.getByRole("row")).toHaveCount(rows);
    await expect(table.getByRole("rowheader")).toHaveCount(rows - 1);
    const region = page.getByRole("region", { name: `${caption} table`, exact: true });
    await region.focus();
    await expect(region).toBeFocused();
    await region.press("ArrowRight");
    await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  }
});

test("interactive topology exposes device controls and returns focus after closing details", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/networking-foundations/hosts-and-network-devices");
  const topology = page.getByRole("group", { name: "Wired host to local server", exact: true });
  await expect(topology.getByRole("button")).toHaveCount(8);
  const device = topology.getByRole("button", { name: "Explore Layer 2 switch" });
  await device.focus();
  await page.keyboard.press("Enter");
  const close = page.getByRole("button", { name: "Close device details" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(close).toHaveCount(0);
  await expect(device).toBeFocused();
  await expect(device).toHaveAttribute("aria-pressed", "false");
});

test("system dark preference applies the native dark color scheme with a working light override", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(lessonPath);
  const theme = page.getByRole("combobox", { name: "Color theme" });
  await theme.selectOption("system");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await theme.selectOption("light");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await theme.selectOption("system");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
});

test("public content and registration remain useful during no-JavaScript navigation", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
  try {
    const page = await context.newPage();
    const response = await page.goto(lessonPath);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "What Is a Computer Network?" })).toBeVisible();
    await expect(page.locator(".lesson-content p").filter({ hasText: /source host must identify the destination/i })).toBeVisible();
    await expect(page.getByRole("img", { name: "Data path from a PC through a switch and router to a server" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toContainText("No payment required.");
    for (const sentinel of protectedSentinels) expect(await response!.text()).not.toContain(sentinel);
    await page.getByRole("link", { name: "Next: Hosts, Clients, Servers and Network Interfaces" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Hosts, Clients, Servers and Network Interfaces" })).toBeVisible();
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
