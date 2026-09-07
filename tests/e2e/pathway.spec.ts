import { expect, test } from "@playwright/test";

test("shows the networking pathway and its published lesson links", async ({ page }) => {
  await page.goto("/paths/networking-foundations");

  await expect(
    page.getByRole("heading", { level: 1, name: "Networking Foundations" }),
  ).toBeVisible();
  const moduleHeadings = page.locator(".module-list > .module > h2");
  await expect(moduleHeadings).toHaveText([
    "Network and Device Essentials",
    "Ethernet, Switching and Local Networks",
    "IP Addressing and Routing",
    "Transport and Application Services",
    "NAT and Internet Communication",
    "Packet Analysis and Troubleshooting",
  ]);
  await expect(page.getByRole("heading", { name: "Network and Device Essentials" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Packet Analysis and Troubleshooting" })).toBeVisible();
  await expect(page.getByText("What Is a Computer Network?")).toBeVisible();
  await expect(page.getByText("Systematic Network Troubleshooting Capstone")).toBeVisible();
  await expect(page.getByRole("link", { name: /systematic network troubleshooting capstone/i }))
    .toHaveCount(0);

  const lessonLinks = page.locator(".lesson-list h3 a");
  await expect(lessonLinks).toHaveCount(3);
  const publishedLessonLink = lessonLinks.filter({ hasText: "What Is a Computer Network?" });
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
