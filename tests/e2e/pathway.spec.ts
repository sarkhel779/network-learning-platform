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
  await expect(lessonLinks).toHaveCount(13);
  await expect(page.locator(".lesson-list").getByText("Coming later", { exact: true })).toHaveCount(11);
  await expect(lessonLinks.filter({ hasText: "Cables, Fibre, Wireless and Network Connections" })).toHaveAttribute(
    "href", "/learn/networking-foundations/cables-fibre-wireless-and-network-connections",
  );
  const publishedLessonLink = lessonLinks.filter({ hasText: "What Is a Computer Network?" });
  await expect(lessonLinks.filter({ hasText: "Hosts, Clients, Servers and Network Interfaces" })).toHaveAttribute(
    "href",
    "/learn/networking-foundations/hosts-and-network-devices",
  );
  await expect(lessonLinks.filter({ hasText: "OSI and TCP/IP Models" })).toHaveAttribute(
    "href",
    "/learn/networking-foundations/osi-and-tcp-ip-models",
  );
  await expect(lessonLinks.filter({ hasText: "Unicast, Broadcast and Multicast Communication" })).toHaveAttribute(
    "href", "/learn/networking-foundations/unicast-broadcast-and-multicast-communication",
  );
  await expect(lessonLinks.filter({ hasText: "Hubs, Bridges and Switches" })).toHaveAttribute(
    "href",
    "/learn/networking-foundations/hubs-bridges-and-switches",
  );
  await expect(lessonLinks.filter({ hasText: "Routers, Default Gateways and Network Boundaries" })).toHaveAttribute(
    "href", "/learn/networking-foundations/routers-default-gateways-and-network-boundaries",
  );
  await expect(lessonLinks.filter({ hasText: "Access Points, Modems, ONTs and Firewalls" })).toHaveAttribute(
    "href", "/learn/networking-foundations/access-points-modems-onts-and-firewalls",
  );
  await expect(lessonLinks.filter({ hasText: "ARP and Local Delivery" })).toHaveAttribute(
    "href", "/learn/networking-foundations/arp-and-local-delivery",
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
    page.getByRole("heading", { level: 1, name: "What Is a Computer Network?" }),
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
