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
    expect(html).toContain('href="/labs"');
    expect(html).toContain("Your learning journey");
    expect(html).toContain("Example packet route: your device, switch, router, internet, and server");
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
      ["HTTP/HTTPS", "http-https-tls-and-essential-network-services"],
    ];
    for (const [label, destination] of topics) {
      expect(html).toContain(label.replaceAll("&", "&amp;"));
      expect(html).toContain(`/learn/networking-foundations/${destination}`);
    }
    expect(html).toContain("TCP &amp; UDP");
    expect(html).not.toContain('href="/learn/networking-foundations/tcp-udp-and-ports"');
  });

  it("renders distinct, consistent inline diagrams for every core topic", () => {
    const root = document.createElement("div");
    root.innerHTML = html;
    const cards = [...root.querySelectorAll(".home-topics a")];
    expect(cards).toHaveLength(11);
    const icons = cards.map((card) => card.querySelector(".home-topic-icon svg"));
    expect(icons.every(Boolean)).toBe(true);
    for (const icon of icons) {
      expect(icon?.getAttribute("viewBox")).toBe("0 0 24 24");
      expect(icon?.getAttribute("fill")).toBe("none");
      expect(icon?.getAttribute("stroke-width")).toBe("2");
    }
    expect(icons[0]?.querySelectorAll("rect")).toHaveLength(3);
    expect(icons[1]?.querySelectorAll("line")).toHaveLength(7);
    expect(icons[3]?.querySelectorAll("circle")).toHaveLength(3);
    expect(icons[10]?.querySelectorAll("rect")).toHaveLength(2);
  });

  it("shows the five-device route and example terminal", () => {
    expect(html).toContain("Your device");
    expect(html).toContain("Switch");
    expect(html).toContain("Router");
    expect(html).toContain("Internet");
    expect(html).toContain("Server");
    expect(html).toContain("Example terminal output");
  });

  it("previews the lab with recognizable device drawings", () => {
    expect((html.match(/class="home-lab-device"/g) ?? []).length).toBe(5);
    expect(html).toContain("Try a sample lab");
  });
});
