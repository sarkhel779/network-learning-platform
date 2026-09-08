import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ArpVariantPlayer } from "./arp-variant-player";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => false,
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

afterEach(cleanup);

describe("ArpVariantPlayer", () => {
  it("offers five distinct ARP-family journeys and starts Standard ARP automatically", () => {
    const { container } = render(<ArpVariantPlayer />);

    expect(screen.getByRole("heading", { name: "Explore ARP variants packet by packet" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Choose an ARP-family journey" }).querySelectorAll('input[type="radio"]')).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "Standard ARP" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "1. Check the neighbour cache" })).toBeInTheDocument();
    expect(container.querySelector(".packet-flow")).toHaveAttribute("aria-label", "Standard ARP resolution");
  });

  it("shows Proxy ARP and Gratuitous ARP as complete local packet journeys", async () => {
    const user = userEvent.setup();
    const { container } = render(<ArpVariantPlayer />);

    await user.click(screen.getByRole("radio", { name: "Proxy ARP" }));
    expect(screen.getAllByText(/router answers for 192\.0\.2\.99 using its own local MAC/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Host A eth0")).toBeInTheDocument();
    expect(screen.getByText("Gateway Gi0/0")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Gratuitous ARP" }));
    expect(screen.getAllByText(/new active gateway announces the shared virtual IP/i).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect([...container.querySelectorAll("[data-packet-marker]")].map((marker) => marker.getAttribute("data-link-id")).sort()).toEqual([
      "switch-host-a",
      "switch-host-b",
    ]);
  });

  it("uses historically accurate RARP and Inverse ARP topology labels", async () => {
    const user = userEvent.setup();
    render(<ArpVariantPlayer />);

    await user.click(screen.getByRole("radio", { name: "RARP" }));
    expect(screen.getByText("Diskless client eth0")).toBeInTheDocument();
    expect(screen.getByText("RARP server eth0")).toBeInTheDocument();
    expect(screen.getAllByText(/client knows its MAC but not its IPv4 address/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("radio", { name: "Inverse ARP" }));
    expect(screen.getAllByText("DLCI 102").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DLCI 201").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/known Frame Relay virtual circuit/i).length).toBeGreaterThan(0);
  });
});
