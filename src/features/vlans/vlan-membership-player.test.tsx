import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VlanMembershipPlayer } from "./vlan-membership-player";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => false,
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

afterEach(cleanup);

describe("VlanMembershipPlayer", () => {
  it("starts a VLAN 10 broadcast automatically with labelled access interfaces", () => {
    render(<VlanMembershipPlayer />);
    expect(screen.getByRole("heading", { name: "Build the VLAN broadcast domains" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "VLAN 10 broadcast" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
    expect(screen.getByText(/Switch Gi0\/1 · access VLAN 10/)).toBeVisible();
    expect(screen.getByText(/Switch Gi0\/4 · access VLAN 20/)).toBeVisible();
  });

  it("shows a different-VLAN destination as a Layer 2 boundary", async () => {
    const user = userEvent.setup();
    render(<VlanMembershipPlayer />);
    await user.click(screen.getByRole("radio", { name: "Cross-VLAN destination" }));
    expect(screen.getAllByText(/Layer 2 boundary: different VLAN/i).length).toBeGreaterThan(0);
  });

  it("fans a replay to Host D after moving its access port into VLAN 10", async () => {
    const user = userEvent.setup();
    const { container } = render(<VlanMembershipPlayer />);
    await user.click(screen.getByRole("checkbox", { name: "Move Host D to VLAN 10" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect([...container.querySelectorAll("[data-packet-marker]")].map((node) => node.getAttribute("data-link-id")).sort())
      .toEqual(["switch-host-b", "switch-host-d"]);
  });
});
