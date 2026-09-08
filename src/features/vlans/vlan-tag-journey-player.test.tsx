import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VlanTagJourneyPlayer } from "./vlan-tag-journey-player";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

afterEach(cleanup);

describe("VlanTagJourneyPlayer", () => {
  it("autoplays a seven-stage journey with every interface labelled", () => {
    render(<VlanTagJourneyPlayer />);
    expect(screen.getByRole("radio", { name: "VLAN 10 journey" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
    expect(screen.getByText("Step 1 of 7")).toBeVisible();
    expect(screen.getByText(/Switch A Gi0\/24 · 802\.1Q trunk/)).toBeVisible();
    expect(screen.getByText(/Switch B Gi0\/1 · access VLAN 10/)).toBeVisible();
  });

  it("shows tag insertion on the trunk and removal before endpoint delivery", async () => {
    const user = userEvent.setup();
    render(<VlanTagJourneyPlayer />);
    await user.click(screen.getByRole("button", { name: "Pause" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("802.1Q tag — VLAN 10")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByText("802.1Q tag — VLAN 10")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /tag is removed for the access link/i })).toBeVisible();
  });

  it("switches VLAN identity and unfolds technical tag fields", async () => {
    const user = userEvent.setup();
    render(<VlanTagJourneyPlayer />);
    await user.click(screen.getByRole("radio", { name: "VLAN 20 journey" }));
    await user.click(screen.getByRole("button", { name: "Pause" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("radio", { name: "Technical inspection" }));
    expect(screen.getByText("VLAN ID 20")).toBeVisible();
    expect(screen.getByText("0x8100")).toBeVisible();
  });
});
