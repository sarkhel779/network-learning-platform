import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TcpFastRetransmitPlayer } from "./tcp-fast-retransmit-player";

vi.mock("@/features/progress/progress-completion-boundary", () => ({
  useProgressCompletionBoundary: () => ({ markTerminalStateReached: vi.fn(), state: "idle", retry: vi.fn() }),
}));
beforeEach(() => { window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }); });
afterEach(cleanup);

describe("TcpFastRetransmitPlayer", () => {
  it("shows a sender-receiver timeline with each duplicate ACK and moving packet", () => {
    render(<TcpFastRetransmitPlayer />);
    const timeline = screen.getByRole("group", { name: "Fast retransmit packet timeline" });
    expect(within(timeline).getAllByText(/duplicate ACK/i)).toHaveLength(3);
    expect(timeline.querySelector('[data-active="true"] [data-packet-envelope="true"]')).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/lost/i);
  });
  it("keeps ACK 1101 while SACK edges expand, then retransmits and advances", () => {
    render(<TcpFastRetransmitPlayer />);
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(/SACK block left edge/i)).toBeVisible();
    expect(screen.getByText(/SACK block right edge/i)).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(/second duplicate ACK/i);
    expect(screen.getByText("ACK 1101 remains the first missing byte while later data is buffered.")).toBeVisible();
    const receiver = screen.getByRole("group", { name: "Receiver byte ranges" });
    expect(receiver.querySelector('[data-byte-start="1101"]')).toHaveAttribute("data-receiver-state", "missing");
    expect(receiver.querySelector('[data-byte-start="1201"]')).toHaveAttribute("data-receiver-state", "buffered");
    expect(receiver.querySelector('[data-byte-start="1301"]')).toHaveAttribute("data-receiver-state", "buffered");
    expect(receiver.querySelector('[data-byte-start="1401"]')).toHaveAttribute("data-receiver-state", "awaiting");
    expect(within(receiver).getByRole("listitem", { name: "Bytes 1101–1200: missing" })).toBeVisible();
    expect(within(receiver).getByRole("listitem", { name: "Bytes 1201–1300: buffered out of order" })).toBeVisible();
    expect(within(receiver).getByText(/awaiting arrival/i)).toBeVisible();
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent(/gap closes/i);
    expect(screen.getByRole("group", { name: "Fast retransmit packet timeline" }).querySelector('[data-active="true"]')).toHaveTextContent("ACK 1501");
    expect(screen.getByText(/Gap repaired; SACK is no longer needed/i)).toBeVisible();
  });
});
