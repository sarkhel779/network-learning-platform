import { expect, test } from "@playwright/test";

test("presents the public beginner lesson before registration", async ({ page }) => {
  await page.goto("/learn/networking-foundations/how-networks-communicate");
  await expect(page.getByRole("heading", { level: 1, name: "What Is a Computer Network?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Learning objective" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Basic Wireshark check" })).toHaveCount(0);
  await expect(page.getByRole("group", { name: /knowledge check/i })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Interview scenario" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toContainText("No payment required.");
  await expect(page.getByRole("link", { name: "Next: Hosts, Clients, Servers and Network Interfaces" })).toHaveAttribute(
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

test("shows the complete curriculum in an overlay drawer on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/learn/networking-foundations/how-networks-communicate");

  await expect(page.locator("aside[aria-label='Course contents']")).toHaveCount(0);
  await page.getByRole("button", { name: "Course contents" }).click();
  const drawer = page.getByRole("dialog", { name: "Course contents" });
  await expect(drawer).toBeVisible();
  await expect(drawer.locator(".curriculum-navigation__module > h2")).toHaveText([
    "Network and Device Essentials",
    "Ethernet, Switching and Local Networks",
    "IP Addressing and Routing",
    "Transport and Application Services",
    "NAT and Internet Communication",
    "Packet Analysis and Troubleshooting",
  ]);

  const currentLesson = drawer.getByRole("link", { name: /what is a computer network/i });
  await expect(currentLesson).toHaveAttribute("aria-current", "page");
  await expect(currentLesson).toContainText("Free");
  await expect(currentLesson).toContainText("Current lesson");

  const nextLesson = drawer
    .locator(".curriculum-navigation__lesson")
    .filter({ hasText: "Hosts, Clients, Servers and Network Interfaces" });
  await expect(nextLesson.getByText("Hosts, Clients, Servers and Network Interfaces", { exact: true })).toBeVisible();
  await expect(nextLesson.getByText("Free", { exact: true })).toBeVisible();
  await expect(nextLesson.getByRole("link")).toHaveAttribute(
    "href",
    "/learn/networking-foundations/hosts-and-network-devices",
  );

  await expect(drawer.locator(".curriculum-navigation__lesson > a")).toHaveCount(12);
  await expect(drawer.locator(".curriculum-navigation__lesson > div")).toHaveCount(12);
  await expect(drawer.getByText("Coming later", { exact: true })).toHaveCount(12);
});

test("reveals the mobile curriculum drawer without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/networking-foundations/how-networks-communicate");

  await page.getByRole("button", { name: "Course contents" }).click();
  const contents = page.getByRole("dialog", { name: "Course contents" });
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
    const contents = page.locator("details.lesson-curriculum--fallback");
    await contents.locator("summary").click();
    const curriculum = contents.getByRole("navigation", { name: "Course curriculum" });
    await expect(curriculum).toBeVisible();
    await expect(
      curriculum.getByRole("link", { name: /what is a computer network/i }),
    ).toHaveAttribute("aria-current", "page");
    const packetJourneyLink = page.getByRole("link", { name: "Interactive packet journey" });
    await expect(packetJourneyLink).toHaveAttribute("href", "#packet-journey");
    await expect(page.locator("h2#packet-journey")).toHaveCount(1);
    await expect(
      packetJourneyLink.evaluate((link) => document.querySelector(link.getAttribute("href") ?? "")?.id),
    ).resolves.toBe("packet-journey");
    await expect(
      curriculum.getByRole("heading", { name: "Network and Device Essentials", exact: true }),
    ).toBeVisible();
    const upcomingLesson = curriculum
      .locator(".curriculum-navigation__lesson")
      .filter({ hasText: "Hosts, Clients, Servers and Network Interfaces" });
    await expect(
      upcomingLesson.getByText("Hosts, Clients, Servers and Network Interfaces", { exact: true }),
    ).toBeVisible();
    await expect(upcomingLesson.getByText("Free", { exact: true })).toBeVisible();
    await expect(upcomingLesson.getByRole("link")).toHaveAttribute(
      "href",
      "/learn/networking-foundations/hosts-and-network-devices",
    );

    await expect(page.getByRole("heading", { level: 1, name: "What Is a Computer Network?" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Learning objective" })).toBeVisible();
    await expect(
      page.getByText("Explain why networks exist and identify the ingredients required for communication."),
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
  await expect(page.getByRole("heading", { level: 1, name: "What Is a Computer Network?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
  await expect(page.locator("section.packet-flow .network-topology svg")).toBeVisible();
  await expect(page.locator("h2#packet-journey")).toHaveCount(1);

  expect(failures).toEqual([]);
  await expect(page.getByRole("dialog", { name: /console error/i })).toHaveCount(0);
});

test("requires an account before delivering OSI and TCP/IP foundations or player", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/networking-foundations/osi-and-tcp-ip-models");

  await expect(page.locator(".lesson-header").getByRole("heading", { level: 1, name: "OSI and TCP/IP Models" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Compare device layer scope" })).toHaveCount(0);
  await expect(page.locator("[data-device-layer-scope]")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toContainText("No payment required.");
  await expect(page.locator(".lesson-content")).toBeEmpty();
  await expect(page.locator(".encapsulation-player__counter")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Play", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toHaveCount(0);
  await expect(page.locator("[data-current-pdu]")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Continue with Google or email" })).toHaveAttribute(
    "href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fosi-and-tcp-ip-models",
  );
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

test("keeps the models account boundary usable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto("/learn/networking-foundations/osi-and-tcp-ip-models");
    await expect(page.locator(".lesson-header").getByRole("heading", { level: 1, name: "OSI and TCP/IP Models" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "The browser creates data", exact: true })).toHaveCount(0);
    await expect(page.locator(".lesson-content")).toBeEmpty();
    await expect(page.getByText(/Capture on the active host interface/)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Compare device layer scope" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toContainText("No payment required.");
    await page.getByRole("link", { name: "Continue with Google or email" }).click();
    await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Flearn%2Fnetworking-foundations%2Fosi-and-tcp-ip-models/);
    await expect(page.getByText(/Account access is not available yet/i)).toBeVisible();
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
  await expect(page.getByRole("button", { name: "Next", exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
  expect(failures).toEqual([]);
});
