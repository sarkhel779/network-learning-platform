import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AclSimulator } from "../access-control-lists/acl-simulator";
import { natTroubleshootingSim } from "./nat-troubleshooting-sim";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function sendAndSettle() {
  fireEvent.click(screen.getByRole("button", { name: "Send test packet" }));
  act(() => vi.advanceTimersByTime(1000));
}

describe("NAT troubleshooting simulator", () => {
  it("blocks the host while the excluding ACL line is enabled, using NAT-specific labels", () => {
    vi.useFakeTimers();
    render(<AclSimulator config={natTroubleshootingSim} />);
    expect(screen.getByText("Internet")).toBeInTheDocument();
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Blocked.");
  });

  it("delivers once the excluding ACL line is disabled", () => {
    vi.useFakeTimers();
    render(<AclSimulator config={natTroubleshootingSim} />);
    fireEvent.click(screen.getByRole("checkbox"));
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Permitted.");
  });
});
