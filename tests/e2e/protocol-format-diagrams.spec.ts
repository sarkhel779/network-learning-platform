import { expect, test } from "@playwright/test";

const lessons = [
  ["ethernet-frames-and-mac-addresses", "Ethernet II frame format"],
  ["vlans-access-ports-and-trunks", "802.1Q tagged Ethernet frame format"],
  ["arp-and-local-delivery", "Ethernet IPv4 ARP packet format"],
  ["ipv4-addressing", "IPv4 packet header format"],
  ["ipv6-fundamentals", "IPv6 packet header format"],
  ["icmp-ping-and-path-discovery", "ICMPv4 Echo message format"],
  ["tcp-reliable-transport", "TCP segment header format"],
  ["udp-datagrams-and-ports", "UDP datagram header format"],
  ["dns-and-name-resolution", "DNS message format"],
  ["http-https-tls-and-essential-network-services", "HTTP request message format"],
  ["http-https-tls-and-essential-network-services", "HTTP response message format"],
] as const;

for (const [slug, name] of lessons) {
  test(`${slug} explains ${name} visually`, async ({ page }) => {
    await page.goto(`/learn/networking-foundations/${slug}`);
    const diagram = page.getByRole("table", { name });
    await expect(diagram).toBeVisible();
    await expect(diagram.getByRole("row").first()).toBeVisible();
    await expect(page.getByRole("region", { name: `${name} diagram` })).toBeVisible();
    await expect(diagram.locator("xpath=../..").getByText("Cell widths are schematic, not byte/bit proportional.")).toBeVisible();
  });
}

test("wide header rows scroll within the diagram on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/networking-foundations/ethernet-frames-and-mac-addresses");
  const region = page.getByRole("region", { name: "Ethernet II frame format diagram" });
  await expect(page.getByText("Swipe sideways to see all fields")).toBeVisible();
  expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("representative diagrams keep their field order and sizes", async ({ page }) => {
  await page.goto("/learn/networking-foundations/ethernet-frames-and-mac-addresses");
  const ethernet = page.getByRole("table", { name: "Ethernet II frame format" });
  await expect(ethernet.getByRole("row").first()).toContainText("Destination MAC · 6 bytes");
  await expect(ethernet.getByRole("row").first()).toContainText("Source MAC · 6 bytes");
  await expect(ethernet.getByRole("row").last()).toContainText("Frame check sequence (FCS) · 4 bytes");

  await page.goto("/learn/networking-foundations/tcp-reliable-transport");
  const tcp = page.getByRole("table", { name: "TCP segment header format" });
  await expect(tcp.getByRole("row").nth(1)).toContainText("Sequence number · 32 bits");
  await expect(tcp.getByRole("row").nth(2)).toContainText("Acknowledgement number · 32 bits");
  await page.goto("/learn/networking-foundations/udp-datagrams-and-ports");
  const udp = page.getByRole("table", { name: "UDP datagram header format" });
  await expect(udp.getByRole("row").nth(1)).toContainText("Length · 16 bits");
  await expect(udp.getByRole("row").nth(1)).toContainText("Checksum · 16 bits");
});
