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

  it.each([
    ["hubs", ["what-is-a-hub", "why-hubs-existed", "shared-traffic-and-bandwidth", "repeat-a-signal", "knowledge-check"], "<HubRepeaterDemo />", "hubs_check_1"],
    ["bridges", ["what-is-a-bridge", "why-bridges-were-introduced", "network-segments", "compare-segments", "knowledge-check"], "<BridgeSegmentComparison />", "bridges_check_1"],
    ["switches", ["what-is-a-switch", "switch-ports", "more-selective-than-a-hub", "switches-and-routers", "match-hosts-to-ports", "knowledge-check"], "<SwitchPortMatcher />", "switches_check_1"],
  ])("keeps %s introductory and interactive", (slug, expectedHeadings, interaction, checkId) => {
    const lesson = source(slug as string);
    expect(headings(lesson)).toEqual(expectedHeadings);
    expect(lesson).toContain(interaction);
    expect(lesson).toContain(`progressItemId="${checkId}"`);
    expect(lesson).not.toMatch(/MAC table|learn the source|\bflood\b|\bage\b|collision domain calculation|forwarding decision/i);
  });

  it("keeps Routers introductory", () => {
    const lesson = source("routers-default-gateways-and-network-boundaries");
    expect(headings(lesson)).toEqual(["what-a-router-does", "router-interfaces", "network-boundaries", "default-gateway", "place-the-router", "knowledge-check"]);
    expect(lesson).toContain("<RouterBoundaryPlacement />");
    expect(lesson).not.toMatch(/local or remote|route lookup|routing table|longest prefix|what changes at each hop/i);
  });

  it("introduces physical and logical addressing without delivery mechanics", () => {
    const lesson = source("physical-and-logical-addressing");
    expect(headings(lesson)).toEqual(["why-networks-use-addresses", "mac-addresses", "universal-local-and-individual-group", "ip-addresses", "inspect-address-formats", "knowledge-check"]);
    expect(lesson).toMatch(/hexadecimal/i);
    expect(lesson).toMatch(/U\/L bit/i);
    expect(lesson).toMatch(/I\/G bit/i);
    expect(lesson).toMatch(/dotted decimal/i);
    expect(lesson).toContain("<AddressFormatInspector />");
    expect(lesson).not.toMatch(/ARP|subnetting|binary AND|delivery decision/i);
  });

  it("introduces both layered models and their mapping", () => {
    const lesson = source("osi-and-tcp-ip-models");
    expect(headings(lesson)).toEqual(["why-layers", "osi-model", "tcp-ip-model", "model-mapping", "encapsulation-lab", "knowledge-check"]);
    for (const layer of ["Physical", "Data Link", "Network", "Transport", "Session", "Presentation", "Application"]) expect(lesson).toContain(layer);
    expect(lesson).toContain("<LayerModelComparison />");
    expect(lesson).toContain("<EncapsulationExperience");
    expect(lesson).toContain("<LayerMatchingExercise />");
    expect(lesson).not.toMatch(/troubleshooting|interview/i);
  });

  it("keeps the final assessment introduction public and its eight checks in the account block", () => {
    const publicSource = source("computer-network-basics-final-quiz");
    const accountSource = readFileSync(join(process.cwd(), "src", "content", "networking-foundations", "computer-network-basics-final-quiz.account.mdx"), "utf8");
    expect(publicSource).toMatch(/sign in.*assessment/i);
    expect(publicSource).not.toContain("<KnowledgeCheck");
    expect(accountSource.match(/<KnowledgeCheck\b/g)).toHaveLength(8);
    for (let index = 1; index <= 8; index += 1) expect(accountSource).toContain(`progressItemId="computer_network_basics_final_quiz_check_${index}"`);
    expect(accountSource).toMatch(/network purpose|LAN|WAN/i);
    expect(accountSource).toMatch(/host/i);
    expect(accountSource).toMatch(/client|server/i);
    expect(accountSource).toMatch(/hub|bridge|switch/i);
    expect(accountSource).toMatch(/router|default gateway/i);
    expect(accountSource).toMatch(/MAC|IP address/i);
    expect(accountSource).toMatch(/U\/L|I\/G/i);
    expect(accountSource).toMatch(/OSI|TCP\/IP/i);
    expect(accountSource).not.toMatch(/DNS|ARP|subnet mask|binary AND|forwarding|routing table|packet journey/i);
  });
});
