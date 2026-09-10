import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (tier: string) => readFileSync(join(process.cwd(), "src/content/networking-foundations", `dhcp-and-automatic-address-configuration.${tier}.mdx`), "utf8");

describe("DHCP automatic address configuration content", () => {
  it("keeps twelve exact beginner-first sections and two players public", () => {
    const lesson = read("public");
    expect([...lesson.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map((match) => match[2])).toEqual([
      "Why automatic configuration exists", "DHCP roles: client, server, scope, lease, and relay", "UDP ports 67 and 68",
      "Broadcast and unicast rules", "DHCP packet structure", "Interactive DHCP DORA journey",
      "Lease contents: address, prefix, gateway, DNS, and lease time", "Lease lifecycle: allocation, T1 renewal, T2 rebinding, and expiry",
      "Interactive DHCP relay and helper-address journey", "DHCP boundaries and DHCPv6/SLAAC", "Common DHCP evidence and terminology", "Summary",
    ]);
    expect(lesson).toContain('<DoraPlayer progressItemId="dhcp_automatic_address_configuration_interactive_interactive_dora_journey" />');
    expect(lesson).toContain('<DhcpRelayPlayer progressItemId="dhcp_automatic_address_configuration_interactive_interactive_relay_helper" />');
    expect(lesson).toContain("UDP 68 to UDP 67");
    expect(lesson).toContain("UDP 67 to UDP 67");
    for (const field of ["op", "htype", "hlen", "hops", "xid", "secs", "flags", "ciaddr", "yiaddr", "siaddr", "giaddr", "chaddr", "sname", "file", "magic cookie"])
      expect(lesson).toContain(`\`${field}\``);
    expect(lesson).toMatch(/DHCPv6[\s\S]*SLAAC/);
  });

  it("reserves inspection, diagnosis, six failures, and three checks for accounts", () => {
    const lesson = read("account");
    for (const id of ["inspect-dhcp-evidence", "guided-dora-diagnosis", "guided-relay-diagnosis", "troubleshoot-dhcp", "knowledge-check-summary"])
      expect(lesson).toContain(`id="${id}"`);
    for (const failure of ["no offer", "address-pool exhaustion", "blocked UDP 67/68", "missing helper address", "helper on the wrong interface", "scope does not match `giaddr`"])
      expect(lesson.toLowerCase()).toContain(failure.toLowerCase());
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
  });

  it("provides Pro timing, immediate RFC practice, security, policy, and correct failover scope", () => {
    const lesson = read("pro");
    expect(lesson).toContain("<LeaseTimingPlayer />");
    expect(lesson.match(/<DhcpRfcCheck\b/g)).toHaveLength(7);
    for (const phrase of ["DHCP snooping", "Option 82", "reservations", "exclusions", "multiple-server", "advanced capture", "prefix delegation"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
    expect(lesson).toContain("RFC 8156 defines DHCPv6 failover");
    expect(lesson).toMatch(/DHCPv4[^.]*vendor-specific/i);
  });
});
