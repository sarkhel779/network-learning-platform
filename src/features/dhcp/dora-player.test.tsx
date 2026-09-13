import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DoraPlayer } from "./dora-player";

beforeEach(() => { window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }); });
afterEach(cleanup);

describe("DoraPlayer", () => {
  it("offers four journeys and keeps topology, state, ports, and inspector synchronized", async () => {
    const user = userEvent.setup();
    render(<DoraPlayer />);
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(screen.getByRole("status")).toHaveTextContent("DHCPDISCOVER");
    expect(screen.getByText("UDP 68 → 67")).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" }).closest(".player-controls")).not.toBeNull();
    const topology = screen.getByRole("figure", { name: "Direct DHCP topology" });
    expect(topology.querySelector("svg")).toHaveAttribute("viewBox", "0 0 800 210");
    expect(topology.nextElementSibling).toContainElement(screen.getByRole("button", { name: "Play" }));
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(topology.nextElementSibling).toContainElement(screen.getByRole("button", { name: "Pause" }));
    await user.click(screen.getByRole("button", { name: "Pause" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent("DHCPOFFER");
    expect(screen.getByText("UDP 67 → 68")).toBeVisible();
    expect(screen.getByRole("region", { name: "BOOTP/DHCP" })).toBeVisible();
  });

  it("shows the no-offer terminal outcome without unsafe controls", async () => {
    const user = userEvent.setup();
    render(<DoraPlayer />);
    await user.click(screen.getByLabelText("No server offer"));
    expect(screen.getByText(/No Offer is observed/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
