import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ArpLocalDeliveryPlayer } from "./arp-local-delivery-player";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => false,
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

afterEach(cleanup);

describe("ArpLocalDeliveryPlayer", () => {
  it("starts the local-delivery journey automatically with explicit interface and ARP evidence", () => {
    const { container } = render(<ArpLocalDeliveryPlayer />);

    expect(screen.getByRole("heading", { name: "Watch ARP resolve the next hop" })).toBeInTheDocument();
    expect(container.querySelector(".packet-flow")).toHaveAttribute("aria-label", "ARP for a local IPv4 destination");
    expect(container.querySelector(".packet-flow")).not.toHaveAttribute("aria-labelledby");
    expect(screen.getByRole("radio", { name: "Local destination" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "1. Choose the local next hop" })).toBeInTheDocument();
    expect(screen.getAllByText("192.0.2.10/24").length).toBeGreaterThan(0);
    for (const label of ["Host A eth0", "Switch Gi0/1", "Switch Gi0/2", "Host B eth0", "Switch Gi0/3", "Gateway Gi0/0"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(container.querySelectorAll("[data-packet-marker]")).toHaveLength(0);
  });

  it("fans the ARP request out of every eligible switch egress and returns the reply by unicast", async () => {
    const user = userEvent.setup();
    const { container } = render(<ArpLocalDeliveryPlayer />);
    const next = screen.getByRole("button", { name: "Next" });

    await user.click(next);
    await user.click(next);
    await user.click(next);
    expect(screen.getByRole("heading", { name: "4. Switch floods the request" })).toBeInTheDocument();
    expect([...container.querySelectorAll("[data-packet-marker]")].map((marker) => marker.getAttribute("data-link-id")).sort()).toEqual(["switch-gateway", "switch-target"]);
    expect(container.querySelectorAll('[data-packet-marker] [data-packet-envelope="true"]')).toHaveLength(2);

    await user.click(next);
    expect(screen.getByRole("heading", { name: "5. Owner replies by unicast" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-packet-marker]")).toHaveLength(1);
    expect(container.querySelector("[data-packet-marker]")).toHaveAttribute("data-link-id", "switch-target");
    expect(screen.getByText(/192\.0\.2\.20 is at 02:00:00:00:00:0B/)).toBeInTheDocument();

    await user.click(next);
    await user.click(next);
    await user.click(next);
    await user.click(next);
    expect(screen.getByRole("heading", { name: "9. Switch delivers the data frame" })).toBeInTheDocument();
    expect(container.querySelector("[data-packet-marker]")).toHaveAttribute("data-link-id", "switch-target");
  });

  it("resolves the gateway MAC for a remote destination and explains cache, failure, proxy, and gratuitous cases", async () => {
    const user = userEvent.setup();
    const { container } = render(<ArpLocalDeliveryPlayer />);

    await user.click(screen.getByRole("radio", { name: "Remote via gateway" }));
    expect(screen.getAllByText(/resolve 192\.0\.2\.1, not the remote server/i).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "3. Switch floods the request" })).toBeInTheDocument();
    expect([...container.querySelectorAll("[data-packet-marker]")].map((marker) => marker.getAttribute("data-link-id")).sort()).toEqual(["switch-gateway", "switch-target"]);

    await user.click(screen.getByRole("radio", { name: "Warm cache" }));
    expect(screen.getAllByText(/cached mapping avoids a new ARP exchange/i).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "3. Switch delivers the cached data frame" })).toBeInTheDocument();
    expect(container.querySelector("[data-packet-marker]")).toHaveAttribute("data-link-id", "switch-target");

    await user.click(screen.getByRole("radio", { name: "No reply" }));
    expect(screen.getAllByText(/remains incomplete/i).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "3. Switch floods the unanswered request" })).toBeInTheDocument();
    expect([...container.querySelectorAll("[data-packet-marker]")].map((marker) => marker.getAttribute("data-link-id")).sort()).toEqual(["switch-gateway", "switch-target"]);

    await user.click(screen.getByRole("radio", { name: "Proxy ARP" }));
    expect(screen.getAllByText(/answers on behalf of 192\.0\.2\.99/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("radio", { name: "Gratuitous ARP" }));
    expect(screen.getAllByText(/announces its own mapping/i).length).toBeGreaterThan(0);
  });
});
