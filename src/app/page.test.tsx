import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { pathways } from "@/features/catalog/catalog.data";

import HomePage from "./page";

describe("HomePage", () => {
  const html = renderToStaticMarkup(<HomePage />);

  it("guides a visitor from the hero to the real foundation pathway and sample lesson", () => {
    expect((html.match(/<h1\b/g) ?? []).length).toBe(1);
    expect(html).toContain('href="/paths/networking-foundations"');
    expect(html).toContain('href="/learn/networking-foundations/how-networks-communicate"');
    expect(html).toContain("Core Topics You’ll Learn");
    expect(html).toContain("Try the packet lab");
    expect(html).toContain("Your learning journey");
  });

  it("only promotes published lessons", () => {
    const unpublished = pathways[0].modules.flatMap((module) => module.lessons).find((lesson) => !lesson.published);
    if (unpublished) expect(html).not.toContain(`>${unpublished.title}</a>`);
  });

  it("shows the eleven approved topic destinations", () => {
    const topics = [
      ["TCP/IP Model", "osi-and-tcp-ip-models#tcp-ip-model"],
      ["OSI Model", "osi-and-tcp-ip-models#osi-model"],
      ["IP Addressing (IPv4 & IPv6)", "ipv4-addressing"],
      ["Subnetting", "subnetting-fundamentals"],
      ["Switching & VLANs", "vlans-access-ports-and-trunks"],
      ["Routing", "routing-tables-and-default-routes"],
      ["ARP & MAC", "arp-and-local-delivery"],
      ["DNS", "dns-and-name-resolution"],
      ["DHCP", "dhcp-and-automatic-address-configuration"],
      ["TCP & UDP", "tcp-udp-and-ports"],
      ["HTTP/HTTPS", "http-https-tls-and-essential-network-services"],
    ];
    for (const [label, destination] of topics) {
      expect(html).toContain(label.replaceAll("&", "&amp;"));
      expect(html).toContain(`/learn/networking-foundations/${destination}`);
    }
  });

  it("shows the five-device route and example terminal", () => {
    expect(html).toContain("Your device");
    expect(html).toContain("Switch");
    expect(html).toContain("Router");
    expect(html).toContain("Internet");
    expect(html).toContain("Server");
    expect(html).toContain("Example terminal output");
  });
});
