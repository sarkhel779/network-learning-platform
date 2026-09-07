import { expect, test } from "@playwright/test";

test("shows the networking pathway and its published lesson links", async ({ page }) => {
  await page.goto("/paths/networking-foundations");

  await expect(
    page.getByRole("heading", { level: 1, name: "Networking Foundations" }),
  ).toBeVisible();
  const moduleHeadings = page.locator(".module-list > .module > h2");
  await expect(moduleHeadings).toHaveText([
    "Networking Essentials",
    "Ethernet and Local Networks",
    "IP Addressing and Routing",
    "Transport and Network Services",
    "Network Security Fundamentals",
    "Packet Analysis and Troubleshooting",
  ]);

  const lessonLinks = page.locator(".lesson-list h3 a");
  await expect(lessonLinks).toHaveCount(3);
  const publishedLessonLink = lessonLinks.filter({ hasText: "How Networks Communicate" });
  await expect(lessonLinks.filter({ hasText: "Hosts and Network Devices" })).toHaveAttribute(
    "href",
    "/learn/networking-foundations/hosts-and-network-devices",
  );
  await expect(lessonLinks.filter({ hasText: "OSI and TCP/IP Models" })).toHaveAttribute(
    "href",
    "/learn/networking-foundations/osi-and-tcp-ip-models",
  );

  await expect(publishedLessonLink).toHaveAttribute(
    "href",
    "/learn/networking-foundations/how-networks-communicate",
  );
  await publishedLessonLink.click();
  await expect(page).toHaveURL(
    "/learn/networking-foundations/how-networks-communicate",
  );
  await expect(
    page.getByRole("heading", { level: 1, name: "How Networks Communicate" }),
  ).toBeVisible();
});

test("keeps the security lessons in separate curriculum rows", async ({ page }) => {
  await page.goto("/paths/networking-foundations");

  const securityModule = page
    .locator(".module-list > .module")
    .filter({ has: page.getByRole("heading", { name: "Network Security Fundamentals", exact: true }) });
  await expect(securityModule.locator(".lesson-card h3")).toHaveText([
    "NAT Fundamentals",
    "Firewall Fundamentals",
  ]);
  await expect(page.getByText("Palo Alto Basics", { exact: true })).toHaveCount(0);
});

test("does not overflow at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/networking-foundations");

  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
});
