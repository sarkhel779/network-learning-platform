import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PatSimulator } from "./pat-simulator";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function sendAndSettle() {
  fireEvent.click(screen.getByRole("button", { name: "Send test packet" }));
  act(() => vi.advanceTimersByTime(1000));
}

describe("PatSimulator", () => {
  it("shows Host A's translation after sending from Host A", () => {
    vi.useFakeTimers();
    render(<PatSimulator />);
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Host A");
    expect(screen.getByRole("status")).toHaveTextContent("203.0.113.9:40001");
  });

  it("shows both hosts with distinct ports once both have sent traffic", () => {
    vi.useFakeTimers();
    render(<PatSimulator />);
    sendAndSettle();
    fireEvent.change(screen.getByRole("combobox", { name: "Send from" }), { target: { value: "B" } });
    sendAndSettle();

    expect(screen.getByRole("status")).toHaveTextContent("Host B");
    expect(screen.getByRole("status")).toHaveTextContent("203.0.113.9:40002");
    const table = within(screen.getByRole("table"));
    expect(table.getByText("192.168.1.10:5000")).toBeInTheDocument();
    expect(table.getByText("192.168.1.11:5000")).toBeInTheDocument();
  });
});
