import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { accessVsTrunkSim } from "./access-vs-trunk-sim";
import { interVlanRoutingDesignSim } from "./inter-vlan-routing-design-sim";
import { LinkTypeSimulator } from "./link-type-simulator";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function sendAndSettle() {
  fireEvent.click(screen.getByRole("button", { name: "Send test frame" }));
  act(() => vi.advanceTimersByTime(2000));
}

describe("LinkTypeSimulator", () => {
  it("blocks a VLAN 10 frame when the link is configured as access VLAN 20 only", () => {
    vi.useFakeTimers();
    render(<LinkTypeSimulator config={accessVsTrunkSim} />);
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Blocked.");
  });

  it("delivers the frame once the link is reconfigured as a trunk", () => {
    vi.useFakeTimers();
    render(<LinkTypeSimulator config={accessVsTrunkSim} />);
    fireEvent.change(screen.getByRole("combobox", { name: /Switch A/ }), { target: { value: "trunk" } });
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Delivered.");
  });

  it("delivers a VLAN 20 frame when the link matches that access VLAN", () => {
    vi.useFakeTimers();
    render(<LinkTypeSimulator config={accessVsTrunkSim} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Test frame" }), { target: { value: "20" } });
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Delivered.");
  });

  it("blocks inter-VLAN traffic over an access-only switch-router link until set to trunk", () => {
    vi.useFakeTimers();
    render(<LinkTypeSimulator config={interVlanRoutingDesignSim} />);
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Blocked.");

    fireEvent.change(screen.getByRole("combobox", { name: /Switch/ }), { target: { value: "trunk" } });
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Delivered.");
  });
});
