import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EthernetFrameExplorer } from "./ethernet-frame-explorer";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => false,
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

afterEach(cleanup);

describe("EthernetFrameExplorer", () => {
  it("shows the frame fields and starts with known-unicast delivery", () => {
    render(<EthernetFrameExplorer />);

    expect(screen.getByRole("heading", { name: "Open the Ethernet frame" })).toBeInTheDocument();
    const frame = screen.getByRole("list", { name: "Ethernet frame fields" });
    for (const field of ["Destination MAC", "Source MAC", "EtherType / length", "Payload", "Frame check sequence"]) {
      expect(within(frame).getByText(field)).toBeInTheDocument();
    }
    expect(screen.getByRole("radio", { name: "Known unicast" })).toBeChecked();
    expect(screen.getByText(/only the intended destination accepts/i)).toBeInTheDocument();
  });

  it("lets learners compare broadcast, multicast, and unknown-unicast forwarding", async () => {
    const user = userEvent.setup();
    render(<EthernetFrameExplorer />);

    await user.click(screen.getByRole("radio", { name: "Broadcast" }));
    expect(screen.getByText("FF:FF:FF:FF:FF:FF")).toBeInTheDocument();
    expect(screen.getByText(/every switch port in this VLAN except the ingress port/i)).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Multicast" }));
    expect(screen.getByText(/interested receiver group/i)).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Unknown unicast" }));
    expect(screen.getByText(/still a unicast destination/i)).toBeInTheDocument();
  });
});
