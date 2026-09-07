import { expect, test } from "@playwright/test";

test("presents the public beginner lesson before registration", async ({ page }) => {
  await page.goto("/learn/networking-foundations/how-networks-communicate");
  await expect(page.getByRole("heading", { level: 1, name: "How Networks Communicate" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Learning objective" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Basic Wireshark check" })).toHaveCount(0);
  await expect(page.getByRole("group", { name: /knowledge check/i })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Interview scenario" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toContainText("No payment required.");
  await expect(page.getByRole("link", { name: "Next: Hosts and Network Devices" })).toHaveAttribute(
    "href",
    "/learn/networking-foundations/hosts-and-network-devices",
  );

  for (const anchor of [
    "communication-decisions",
    "packet-journey",
  ]) {
    await expect(page.locator(`#${anchor}`)).toHaveCount(1);
  }
  await expect(page.locator("h2#packet-journey")).toHaveCount(1);
  for (const anchor of ["wireshark-check", "knowledge-check", "interview-scenario"]) {
    await expect(page.locator(`#${anchor}`)).toHaveCount(0);
  }
});

test("presents an accessible static network journey and packet evidence", async ({ page }) => {
  await page.goto("/learn/networking-foundations/how-networks-communicate");

  await expect(
    page.getByRole("img", { name: "Data path from a PC through a switch and router to a server" }),
  ).toBeVisible();
  for (const symbol of ["host", "switch", "router", "server"]) {
    await expect(page.locator(`.network-journey [data-device-symbol="${symbol}"]`)).toHaveCount(1);
  }
  await expect(
    page.getByText(
      "The packet keeps the PC's source IP address and the server's destination IP address.",
    ),
  ).toBeVisible();
  await expect(page.getByText("arp or icmp", { exact: true })).toHaveCount(0);

  for (const field of ["eth.src", "eth.dst", "arp.opcode", "ip.src", "ip.dst", "icmp.type"]) {
    await expect(page.getByText(field, { exact: true })).toHaveCount(0);
  }
});

test("shows the complete curriculum and current lesson on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/learn/networking-foundations/how-networks-communicate");

  const desktop = page.locator(".lesson-curriculum--desktop");
  await expect(desktop).toBeVisible();
  await expect(
    desktop.getByRole("heading", { name: "Networking Essentials", exact: true }),
  ).toBeVisible();
  await expect(
    desktop.getByRole("heading", { name: "Network Security Fundamentals", exact: true }),
  ).toBeVisible();

  const currentLesson = desktop.getByRole("link", { name: /how networks communicate/i });
  await expect(currentLesson).toHaveAttribute("aria-current", "page");
  await expect(currentLesson).toContainText("Free");
  await expect(currentLesson).toContainText("Current lesson");

  const nextLesson = desktop
    .locator(".curriculum-navigation__lesson")
    .filter({ hasText: "Hosts and Network Devices" });
  await expect(nextLesson.getByText("Hosts and Network Devices", { exact: true })).toBeVisible();
  await expect(nextLesson.getByText("Free", { exact: true })).toBeVisible();
  await expect(nextLesson.getByRole("link")).toHaveAttribute(
    "href",
    "/learn/networking-foundations/hosts-and-network-devices",
  );

  const upcomingLesson = desktop
    .locator(".curriculum-navigation__lesson")
    .filter({ hasText: "Firewall Fundamentals" });
  await expect(upcomingLesson.getByText("Coming later", { exact: true })).toBeVisible();
  await expect(upcomingLesson.getByRole("link")).toHaveCount(0);
  await expect(desktop.getByText("Palo Alto Basics", { exact: true })).toHaveCount(0);
});

test("reveals the mobile curriculum without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/networking-foundations/how-networks-communicate");

  const contents = page.locator("details.lesson-curriculum--mobile");
  await expect(contents.locator("summary")).toHaveText("Course contents");
  await contents.locator("summary").click();
  await expect(contents.getByRole("navigation", { name: "Course curriculum" })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("keeps the public lesson readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();

    await page.goto("/learn/networking-foundations/how-networks-communicate");
    const contents = page.locator("details.lesson-curriculum--mobile");
    await contents.evaluate((element) => element.setAttribute("open", ""));
    const curriculum = contents.getByRole("navigation", { name: "Course curriculum" });
    await expect(curriculum).toBeVisible();
    await expect(
      curriculum.getByRole("link", { name: /how networks communicate/i }),
    ).toHaveAttribute("aria-current", "page");
    const packetJourneyLink = page.getByRole("link", { name: "Interactive packet journey" });
    await expect(packetJourneyLink).toHaveAttribute("href", "#packet-journey");
    await expect(page.locator("h2#packet-journey")).toHaveCount(1);
    await expect(
      packetJourneyLink.evaluate((link) => document.querySelector(link.getAttribute("href") ?? "")?.id),
    ).resolves.toBe("packet-journey");
    await expect(
      curriculum.getByRole("heading", { name: "Networking Essentials", exact: true }),
    ).toBeVisible();
    const upcomingLesson = curriculum
      .locator(".curriculum-navigation__lesson")
      .filter({ hasText: "Hosts and Network Devices" });
    await expect(
      upcomingLesson.getByText("Hosts and Network Devices", { exact: true }),
    ).toBeVisible();
    await expect(upcomingLesson.getByText("Free", { exact: true })).toBeVisible();
    await expect(upcomingLesson.getByRole("link")).toHaveAttribute(
      "href",
      "/learn/networking-foundations/hosts-and-network-devices",
    );

    await expect(page.getByRole("heading", { level: 1, name: "How Networks Communicate" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Learning objective" })).toBeVisible();
    await expect(
      page.getByText("Explain the minimum decisions required to move data between two hosts."),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Data path from a PC through a switch and router to a server" }),
    ).toBeVisible();
    await expect(
      page.locator(".lesson-content p").filter({ hasText: /source host must identify the destination/i }),
    ).toBeVisible();
    const addressingParagraph = page.locator(".lesson-content p").filter({
      hasText: "Consider a PC sending a small request",
    });
    await expect(addressingParagraph).toBeVisible();
    await expect(addressingParagraph).toContainText(
      "The packet keeps the PC's source IP address and the server's destination IP address.",
    );
    await expect(page.getByText("arp or icmp", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toContainText("No payment required.");
  } finally {
    await context.close();
  }
});

test("hydrates the lesson without invalid HTML or React errors", async ({ page }) => {
  const failures: string[] = [];

  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.push(message.text());
    }
  });

  await page.goto("/learn/networking-foundations/how-networks-communicate");
  await expect(page.getByRole("heading", { level: 1, name: "How Networks Communicate" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
  await expect(page.locator("section.packet-flow .network-topology svg")).toBeVisible();
  await expect(page.locator("h2#packet-journey")).toHaveCount(1);

  expect(failures).toEqual([]);
  await expect(page.getByRole("dialog", { name: /console error/i })).toHaveCount(0);
});

test("presents the public OSI and TCP/IP player before the account boundary", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/networking-foundations/osi-and-tcp-ip-models");

  await expect(page.locator(".lesson-header").getByRole("heading", { level: 1, name: "OSI and TCP/IP Models" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Compare device layer scope" })).toHaveCount(0);
  await expect(page.locator("[data-device-layer-scope]")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toContainText("No payment required.");
  await expect(page.locator(".encapsulation-player__counter")).toHaveText("Step 1 of 9");
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toHaveCount(0);
  await page.waitForTimeout(2600);
  await expect(page.locator(".encapsulation-player__counter")).toHaveText("Step 1 of 9");
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.locator("[data-current-pdu]")).toHaveText("Data");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("[data-current-pdu]")).toHaveText("Segment");
});

test("keeps the models lesson responsive and theme compatible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto("/learn/networking-foundations/osi-and-tcp-ip-models");
    await expect(page.locator(".lesson-header").getByRole("heading", { level: 1, name: "OSI and TCP/IP Models" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  }
});

test("keeps the models lesson useful without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto("/learn/networking-foundations/osi-and-tcp-ip-models");
    await expect(page.locator(".lesson-header").getByRole("heading", { level: 1, name: "OSI and TCP/IP Models" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "The browser creates data", exact: true })).toBeVisible();
    await expect(page.getByText(/Capture on the active host interface/)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Compare device layer scope" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toContainText("No payment required.");
  } finally {
    await context.close();
  }
});

test("hydrates the models lesson without console or markup errors", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.push(message.text());
    }
  });

  await page.goto("/learn/networking-foundations/osi-and-tcp-ip-models");
  await expect(page.locator(".lesson-header").getByRole("heading", { level: 1, name: "OSI and TCP/IP Models" })).toBeVisible();
  await expect(page.locator("[data-device-layer-scope]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
  expect(failures).toEqual([]);
});
