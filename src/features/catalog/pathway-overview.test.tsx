import { cleanup, render, screen } from "@testing-library/react";
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
    expect(screen.getAllByRole("listitem")).toHaveLength(24);
  });

  it("links published lessons and marks unpublished lessons as coming later", () => {
    render(<PathwayOverview pathway={getPathway("networking-foundations")} />);

    const publishedLesson = screen.getByRole("link", {
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
    expect(screen.getAllByRole("link")).toHaveLength(7);
    expect(screen.getAllByText("Coming later")).toHaveLength(17);
  });
});
