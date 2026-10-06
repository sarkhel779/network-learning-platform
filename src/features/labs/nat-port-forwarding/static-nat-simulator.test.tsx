import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StaticNatSimulator } from "./static-nat-simulator";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function sendAndSettle() {
  fireEvent.click(screen.getByRole("button", { name: "Send test packet" }));
  act(() => vi.advanceTimersByTime(1000));
}

describe("StaticNatSimulator", () => {
  it("delivers a request to the statically mapped public address", () => {
    vi.useFakeTimers();
    render(<StaticNatSimulator />);
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Delivered.");
  });

  it("blocks a direct request to the private address", () => {
    vi.useFakeTimers();
    render(<StaticNatSimulator />);
    fireEvent.change(screen.getByRole("combobox", { name: "Request address" }), { target: { value: "private" } });
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Blocked.");
    expect(screen.getByRole("status")).toHaveTextContent("isn't routable");
  });

  it("blocks a new address until its static entry is added, then delivers it", () => {
    vi.useFakeTimers();
    render(<StaticNatSimulator />);
    fireEvent.change(screen.getByRole("combobox", { name: "Request address" }), { target: { value: "newpublic" } });
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Blocked.");

    fireEvent.click(screen.getByRole("checkbox"));
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Delivered.");
  });
});
