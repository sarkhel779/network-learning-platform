import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { getPathway } from "./catalog.repository";
import { ModuleList } from "./module-list";

afterEach(cleanup);

describe("ModuleList publication labels", () => {
  it("marks a published lesson Free and preserves its canonical link", () => {
    const pathway = getPathway("networking-foundations");
    render(<ModuleList modules={pathway.modules} pathwaySlug={pathway.slug} />);
    const link = screen.getByRole("link", { name: "What Is a Computer Network?" });
    const card = link.closest("li")!;
    expect(within(card).getByText("Free")).toBeVisible();
    expect(within(card).queryByText("Premium")).toBeNull();
    expect(link).toHaveAttribute("href", "/learn/networking-foundations/how-networks-communicate");
  });

  it("links the published delivery-scope, router, and ARP lessons", () => {
    const pathway = getPathway("networking-foundations");
    render(<ModuleList modules={pathway.modules} pathwaySlug={pathway.slug} />);
    expect(screen.getByRole("link", { name: "Unicast, Broadcast and Multicast Communication" }))
      .toHaveAttribute("href", "/learn/networking-foundations/unicast-broadcast-and-multicast-communication");
    expect(screen.getByRole("link", { name: "Routers, Default Gateways and Network Boundaries" }))
      .toHaveAttribute("href", "/learn/networking-foundations/routers-default-gateways-and-network-boundaries");
    expect(screen.getByRole("link", { name: "ARP and Local Delivery" }))
      .toHaveAttribute("href", "/learn/networking-foundations/arp-and-local-delivery");
  });

  it("links the published ICMP lesson as Free", () => {
    const pathway = getPathway("networking-foundations");
    render(<ModuleList modules={pathway.modules} pathwaySlug={pathway.slug} />);
    const link = screen.getByRole("link", { name: "ICMP, Ping and Path Discovery" });
    const card = link.closest("li")!;
    expect(within(card).getByText("Free")).toBeVisible();
    expect(link).toHaveAttribute("href", "/learn/networking-foundations/icmp-ping-and-path-discovery");
  });
});
