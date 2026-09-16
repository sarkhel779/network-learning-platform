import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { getPathway } from "./catalog.repository";
import { PathwayOverview } from "./pathway-overview";

afterEach(cleanup);

describe("PathwayOverview", () => {
  it("renders the pathway and its planned lessons", () => {
    render(<PathwayOverview pathway={getPathway("networking-foundations")} />);

    expect(
      screen.getByRole("heading", { name: "Networking Foundations" }),
    ).toBeVisible();
    expect(screen.getByText(/complete beginners/i)).toBeVisible();
    const modulesSection = screen.getByRole("heading", { name: "Modules and lessons" }).closest("section") as HTMLElement;
    expect(within(modulesSection).getAllByRole("listitem")).toHaveLength(25);
  });

  it("shows the course scale and a jump-to-module link for every module", () => {
    render(<PathwayOverview pathway={getPathway("networking-foundations")} />);

    expect(screen.getByText("6 modules")).toBeVisible();
    expect(screen.getByText("25 lessons")).toBeVisible();

    const toc = screen.getByRole("navigation", { name: "Jump to module" });
    const tocLinks = within(toc).getAllByRole("link");
    expect(tocLinks).toHaveLength(6);
    expect(tocLinks[0]).toHaveAttribute("href", "#module_network_and_device_essentials");
  });

  it("links published lessons and marks unpublished lessons as coming later", () => {
    render(<PathwayOverview pathway={getPathway("networking-foundations")} />);

    const modulesSection = screen.getByRole("heading", { name: "Modules and lessons" }).closest("section") as HTMLElement;
    const publishedLesson = within(modulesSection).getByRole("link", {
      name: /what is a computer network/i,
    });
    expect(publishedLesson).toHaveAttribute(
      "href",
      "/learn/networking-foundations/how-networks-communicate",
    );
    expect(screen.getByRole("link", { name: /hosts, clients, servers and network interfaces/i })).toHaveAttribute(
      "href",
      "/learn/networking-foundations/hosts-and-network-devices",
    );
    expect(screen.getByRole("link", { name: /cables, fibre, wireless and network connections/i })).toHaveAttribute(
      "href",
      "/learn/networking-foundations/cables-fibre-wireless-and-network-connections",
    );
    expect(screen.getByRole("link", { name: /hubs, bridges and switches/i })).toHaveAttribute(
      "href",
      "/learn/networking-foundations/hubs-bridges-and-switches",
    );
    const osiLesson = screen.getByRole("link", { name: /osi and tcp\/ip models/i });
    expect(osiLesson).toHaveAttribute(
      "href",
      "/learn/networking-foundations/osi-and-tcp-ip-models",
    );
    expect(screen.getByRole("link", { name: /unicast, broadcast and multicast communication/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/unicast-broadcast-and-multicast-communication",
    );
    expect(screen.getByRole("link", { name: /routers, default gateways and network boundaries/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/routers-default-gateways-and-network-boundaries",
    );
    expect(screen.getByRole("link", { name: /access points, modems, onts and firewalls/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/access-points-modems-onts-and-firewalls",
    );
    expect(screen.getByRole("link", { name: /ethernet frames and mac addresses/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/ethernet-frames-and-mac-addresses",
    );
    expect(screen.getByRole("link", { name: /how switches learn and forward/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/how-switches-learn-and-forward",
    );
    expect(screen.getByRole("link", { name: /arp and local delivery/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/arp-and-local-delivery",
    );
    expect(screen.getByRole("link", { name: /vlans, access ports and trunks/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/vlans-access-ports-and-trunks",
    );
    expect(screen.getByRole("link", { name: /ipv4 addressing/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/ipv4-addressing",
    );
    expect(screen.getByRole("link", { name: /ipv6 fundamentals/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/ipv6-fundamentals",
    );
    expect(screen.getByRole("link", { name: /routing, routing tables and default routes/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/routing-tables-and-default-routes",
    );
    expect(screen.getByRole("link", { name: /icmp, ping and path discovery/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/icmp-ping-and-path-discovery",
    );
    expect(screen.getByRole("link", { name: /tcp: reliable transport/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/tcp-reliable-transport",
    );
    expect(screen.getByRole("link", { name: /udp: datagrams and ports/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/udp-datagrams-and-ports",
    );
    expect(screen.getByRole("link", { name: /dhcp and automatic address configuration/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/dhcp-and-automatic-address-configuration",
    );
    expect(screen.getByRole("link", { name: /dns and name resolution/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/dns-and-name-resolution",
    );
    expect(screen.getByRole("link", { name: /http, https, tls and essential network services/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/http-https-tls-and-essential-network-services",
    );
    expect(screen.getByRole("link", { name: /nat, pat and the complete internet packet journey/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/nat-pat-and-the-complete-internet-packet-journey",
    );
    expect(screen.getByRole("link", { name: /systematic network troubleshooting capstone/i })).toHaveAttribute(
      "href", "/learn/networking-foundations/systematic-network-troubleshooting-capstone",
    );
    expect(within(modulesSection).getAllByRole("link")).toHaveLength(25);
    expect(within(modulesSection).queryByText("Coming later")).not.toBeInTheDocument();
  });
});
