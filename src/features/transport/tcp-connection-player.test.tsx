import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PLAYBACK_SPEEDS } from "@/features/packet-flow/packet-flow.schema";
import { TcpConnectionPlayer } from "./tcp-connection-player";
import { tcpScenarios } from "./tcp-journeys";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({
  useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }),
}));

beforeEach(() => {
  markTerminalStateReached.mockClear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("TcpConnectionPlayer", () => {
  it("shows a moving envelope for active packet steps", () => {
    const { container } = render(<TcpConnectionPlayer />);
    expect(container.querySelector('[data-packet-envelope="true"]')).toBeInTheDocument();
  });
  it("shows the graceful close as ordered animated FIN and ACK arrows", () => {
    render(<TcpConnectionPlayer />);
    fireEvent.click(screen.getByRole("radio", { name: "Graceful connection close" }));
    const diagram = screen.getByRole("group", { name: "TCP packet sequence" });
    expect(within(diagram).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      expect.stringContaining("FIN, ACK"),
      expect.stringContaining("ACK"),
      expect.stringContaining("FIN, ACK"),
      expect.stringContaining("ACK"),
    ]);
    expect(diagram.querySelectorAll('[data-direction="client-to-server"]')).toHaveLength(2);
    expect(diagram.querySelectorAll('[data-direction="server-to-client"]')).toHaveLength(2);
    expect(diagram.querySelector('[data-active="true"] [data-packet-envelope="true"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(diagram.querySelector('[data-active="true"]')).toHaveTextContent("ACK 1102");
  });
  it("does not show a no-packet placeholder at a terminal step", () => {
    render(<TcpConnectionPlayer />);
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByText("No packet crossing")).not.toBeInTheDocument();
  });
  it("offers six scenarios and synchronizes transport and endpoint evidence", () => {
    render(<TcpConnectionPlayer />);
    for (const { title } of tcpScenarios) expect(screen.getByRole("radio", { name: title })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Step 1 of 4");
    expect(screen.getByText("Client: SYN-SENT")).toBeVisible();
    expect(screen.getByText("Server: LISTEN")).toBeVisible();
    const evidence = screen.getByRole("region", { name: "Scrollable TCP packet evidence" });
    expect(within(evidence).getByText("SYN")).toBeVisible();
    expect(within(evidence).getByText("1000")).toBeVisible();
  });

  it("shows retransmission, reset, and timeout as distinct outcomes", () => {
    render(<TcpConnectionPlayer />);
    fireEvent.click(screen.getByRole("radio", { name: "Lost segment and retransmission" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Retransmit sequence 1001/i);
    fireEvent.click(screen.getByRole("radio", { name: "Connection refused with reset" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(within(screen.getByRole("region", { name: "Scrollable TCP packet evidence" })).getByText("RST, ACK")).toBeVisible();
    fireEvent.click(screen.getByRole("radio", { name: "Connection attempt timeout" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(/Silence alone/i)).toBeVisible();
  });

  it("supports controls and records progress only at a terminal step", () => {
    render(<TcpConnectionPlayer progressItemId="tcp-player" />);
    const speed = screen.getByRole("combobox", { name: "Playback speed" });
    for (const value of PLAYBACK_SPEEDS) expect(within(speed).getByRole("option", { name: `${value}×` })).toBeVisible();
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("status")).toHaveTextContent("Step 1 of 4");
  });

  it("autoplays after normal-motion preference resolves", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    render(<TcpConnectionPlayer />);
    expect(screen.getByRole("button", { name: "Pause" })).toBeEnabled();
  });

  it("fails closed for malformed authored data", () => {
    vi.useFakeTimers();
    const malformed = { ...tcpScenarios[0], steps: [{ ...tcpScenarios[0].steps[0], flags: ["SYN", "FIN"] }] } as unknown as typeof tcpScenarios[0];
    render(<TcpConnectionPlayer progressItemId="bad" scenarios={[malformed]} />);
    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByRole("alert")).toHaveTextContent(/cannot be animated safely/i);
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Play" })).not.toBeInTheDocument();
  });
});
