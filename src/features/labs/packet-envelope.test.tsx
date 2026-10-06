import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { PacketEnvelope } from "./packet-envelope";
import type { PacketLayer } from "./packet-forwarding/packet-journey-scenarios";

afterEach(cleanup);

const layers: PacketLayer[] = [
  { id: "ethernet", label: "Ethernet frame (Layer 2)", fields: [{ label: "Source MAC", value: "AA", changed: true }] },
  { id: "ip", label: "IP packet (Layer 3)", fields: [{ label: "TTL", value: "63", changed: false }] },
];

describe("PacketEnvelope", () => {
  it("opens the outermost layer by default and keeps inner layers folded", () => {
    render(<PacketEnvelope ariaLabel="Packet contents" layers={layers} />);
    expect(screen.getByRole("button", { name: /Ethernet frame/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /IP packet/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("AA")).toBeVisible();
    expect(screen.queryByText("63")).not.toBeInTheDocument();
  });

  it("unfolds a layer on click to reveal its fields", async () => {
    const user = userEvent.setup();
    render(<PacketEnvelope ariaLabel="Packet contents" layers={layers} />);
    await user.click(screen.getByRole("button", { name: /IP packet/ }));
    expect(screen.getByRole("button", { name: /IP packet/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("63")).toBeVisible();
  });

  it("folds an open layer back up on a second click", async () => {
    const user = userEvent.setup();
    render(<PacketEnvelope ariaLabel="Packet contents" layers={layers} />);
    await user.click(screen.getByRole("button", { name: /Ethernet frame/ }));
    expect(screen.getByRole("button", { name: /Ethernet frame/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("AA")).not.toBeInTheDocument();
  });

  it("shows a changed-field badge only on layers with at least one changed field", () => {
    render(<PacketEnvelope ariaLabel="Packet contents" layers={layers} />);
    const ethernetButton = screen.getByRole("button", { name: /Ethernet frame/ });
    expect(within(ethernetButton).getByText("1 changed")).toBeInTheDocument();
    expect(within(screen.getByRole("button", { name: /IP packet/ })).queryByText(/changed/)).not.toBeInTheDocument();
  });
});
