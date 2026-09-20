import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(slug: string) {
  return readFileSync(join(process.cwd(), "src", "content", "networking-foundations", `${slug}.public.mdx`), "utf8");
}

function headings(value: string) {
  return [...value.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
}

describe("Computer Network Basics content", () => {
  it("keeps the introduction focused on beginner network vocabulary", () => {
    const introduction = source("how-networks-communicate");
    expect(headings(introduction)).toEqual([
      "what-is-a-computer-network", "why-networks-exist", "lan-wan-and-the-internet",
      "end-and-intermediary-devices", "identify-device-roles", "knowledge-check",
    ]);
    expect(introduction).toContain("<DeviceRoleIdentifier />");
    expect(introduction).toContain('progressItemId="how_networks_communicate_check_1"');
    expect(introduction).toContain("A network lets connected devices exchange data and share resources.");
    expect(introduction).not.toMatch(/DNS query|ARP request|subnet mask|route lookup|MAC table|packet journey/i);
  });

  it("keeps the host lesson focused on host and application roles", () => {
    const hosts = source("hosts-and-network-devices");
    expect(headings(hosts)).toEqual([
      "what-makes-a-device-a-host", "network-interfaces", "clients-and-servers",
      "one-host-more-than-one-role", "classify-host-roles", "knowledge-check",
    ]);
    expect(hosts).toContain("<HostRoleClassifier />");
    expect(hosts).toContain('progressItemId="hosts_and_network_devices_check_1"');
    expect(hosts).toContain('progressItemId="hosts_and_network_devices_check_2"');
    expect(hosts).toContain("A printer with a network interface is a host.");
    expect(hosts).toContain("The same computer can run a client application and serve a file to another device.");
    expect(hosts).not.toMatch(/DNS query|ARP request|subnet mask|route lookup|MAC table|packet journey/i);
  });
});
