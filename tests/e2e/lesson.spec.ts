import { expect, test } from "@playwright/test";

test("completes the representative beginner lesson", async ({ page }) => {
  await page.goto("/learn/networking-foundations/how-networks-communicate");
  await expect(page.getByRole("heading", { level: 1, name: "How Networks Communicate" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Learning objective" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Basic Wireshark check" })).toBeVisible();
  await expect(page.getByRole("group", { name: /knowledge check/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Interview scenario" })).toBeVisible();
  await expect(page.getByText("Next: Hosts and Network Devices — Coming later")).toBeVisible();
});

test("presents an accessible static network journey and packet evidence", async ({ page }) => {
  await page.goto("/learn/networking-foundations/how-networks-communicate");

  await expect(
    page.getByRole("img", { name: "Data path from a PC through a switch and router to a server" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "The packet keeps the PC's source IP address and the server's destination IP address.",
    ),
  ).toBeVisible();
  await expect(page.getByText("arp or icmp", { exact: true })).toBeVisible();

  for (const field of ["eth.src", "eth.dst", "arp.opcode", "ip.src", "ip.dst", "icmp.type"]) {
    await expect(page.getByText(field, { exact: true })).toBeVisible();
  }
});

test("keeps the complete lesson readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();

    await page.goto("/learn/networking-foundations/how-networks-communicate");
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
    await expect(page.getByText("arp or icmp", { exact: true })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("hydrates the lesson without invalid HTML or React errors", async ({ page }) => {
  const failures: string[] = [];

  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|cannot be a descendant|server rendered html didn't match/i.test(message.text())
    ) {
      failures.push(message.text());
    }
  });

  await page.goto("/learn/networking-foundations/how-networks-communicate");
  await expect(page.getByRole("heading", { level: 1, name: "How Networks Communicate" })).toBeVisible();
  await page.waitForTimeout(250);

  expect(failures).toEqual([]);
  await expect(page.getByRole("dialog", { name: /console error/i })).toHaveCount(0);
});
