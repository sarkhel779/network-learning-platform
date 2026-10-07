import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NativeVlanSimulator } from "./native-vlan-simulator";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function sendAndSettle() {
  fireEvent.click(screen.getByRole("button", { name: "Send untagged frame from Switch A" }));
  act(() => vi.advanceTimersByTime(1000));
}

describe("NativeVlanSimulator", () => {
  it("flags a mismatch by default (native VLAN 1 vs 99)", () => {
    vi.useFakeTimers();
    render(<NativeVlanSimulator />);
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Mismatch.");
    expect(screen.getByRole("status")).toHaveTextContent("leaks between VLANs");
  });

  it("delivers correctly once both switches agree on the native VLAN", () => {
    vi.useFakeTimers();
    render(<NativeVlanSimulator />);
    fireEvent.change(screen.getByRole("combobox", { name: "Switch B native VLAN" }), { target: { value: "1" } });
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Delivered correctly.");
  });
});
