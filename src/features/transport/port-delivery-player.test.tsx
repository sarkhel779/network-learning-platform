import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PortDeliveryPlayer, UdpPortDeliveryPlayer } from "./port-delivery-player";
import { portDeliveryScenarios } from "./port-delivery-journeys";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({
  useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }),
}));

beforeEach(() => {
  markTerminalStateReached.mockClear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("PortDeliveryPlayer", () => {
  it("uses a UDP-specific title and does not show an unresolved socket as null", () => {
    render(<UdpPortDeliveryPlayer />);
    expect(screen.getByRole("heading", { name: "UDP Port Delivery" })).toBeVisible();
    expect(screen.queryByText(/TCP vs UDP and Port Delivery/)).not.toBeInTheDocument();
    expect(screen.getByText(/Socket lookup pending/)).toBeVisible();
    expect(screen.queryByText(/→ null/)).not.toBeInTheDocument();
  });
  it("shows the packet moving toward the receiving application", () => {
    const { container } = render(<PortDeliveryPlayer />);
    expect(container.querySelector('[data-packet-envelope="true"]')).toBeInTheDocument();
  });
  it("offers five scenarios and shows tuple, header, socket, and application evidence", () => {
    render(<PortDeliveryPlayer />);
    for (const { title } of portDeliveryScenarios) expect(screen.getByRole("radio", { name: title })).toBeVisible();
    expect(screen.getByText("TCP 192.0.2.10:49152 → 198.51.100.20:443")).toBeVisible();
    expect(screen.getByRole("region", { name: "Scrollable transport header evidence" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("TCP port 443 → HTTPS service")).toBeVisible();
  });

  it("shows distinct ephemeral tuples and conditional no-listener outcomes", () => {
    render(<PortDeliveryPlayer />);
    fireEvent.click(screen.getByRole("radio", { name: "Two ephemeral client ports" }));
    expect(screen.getByText(/49153/)).toBeVisible();
    fireEvent.click(screen.getByRole("radio", { name: "TCP port has no listener" }));
    for (let index = 0; index < 3; index += 1) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(within(screen.getByText("Conclusion").parentElement!).getByText(/commonly returns RST/i)).toBeVisible();
    fireEvent.click(screen.getByRole("radio", { name: "UDP port has no listener" }));
    for (let index = 0; index < 3; index += 1) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    const conclusion = within(screen.getByText("Conclusion").parentElement!);
    expect(conclusion.getByText(/may return ICMP Port Unreachable/i)).toBeVisible();
    expect(conclusion.getByText(/silence/i)).toBeVisible();
  });

  it("resets journeys and records only terminal progress", () => {
    render(<PortDeliveryPlayer progressItemId="ports-player" />);
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("status")).toHaveTextContent("Step 1 of 4");
  });

  it("fails closed for malformed authored data", () => {
    vi.useFakeTimers();
    const malformed = { ...portDeliveryScenarios[0], destinationPort: 70000 } as unknown as typeof portDeliveryScenarios[0];
    render(<PortDeliveryPlayer progressItemId="bad" scenarios={[malformed]} />);
    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByRole("alert")).toHaveTextContent(/cannot be animated safely/i);
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Play" })).not.toBeInTheDocument();
  });
});
