import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HopByHopForwardingPlayer } from "./hop-by-hop-forwarding-player";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({ useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }) }));

beforeEach(() => { markTerminalStateReached.mockClear(); window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }); });
afterEach(cleanup);

describe("HopByHopForwardingPlayer", () => {
  it("offers all approved journeys and labels every interface", () => {
    render(<HopByHopForwardingPlayer />);
    for (const name of ["IPv4 routed delivery", "IPv6 routed delivery", "No usable route", "Hop Limit expires", "Next hop unresolved"])
      expect(screen.getByRole("radio", { name })).toBeVisible();
    const interfaces = screen.getByRole("list", { name: "Link interfaces" });
    expect(within(interfaces).getByText("Host eth0")).toBeVisible();
    expect(within(interfaces).getByText("R2 Gi0/1")).toBeVisible();
  });

  it("shows unchanged Layer 3, rewritten Layer 2, hop decrement, and synchronized controls", () => {
    render(<HopByHopForwardingPlayer progressItemId="hop-player" />);
    expect(screen.getByText("203.0.113.20")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("63")).toBeVisible();
    expect(screen.getByText("00:aa:00:00:01:02")).toBeVisible();
    expect(screen.getByText("00:bb:00:00:02:01")).toBeVisible();
    expect(screen.getByRole("heading", { name: "3. Router 1 forwards" }).parentElement).toHaveTextContent("Router 1 decrements TTL");
    for (let index = 0; index < 3; index += 1) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
  });

  it("identifies the responsible discard device and uses conditional ICMP wording", () => {
    render(<HopByHopForwardingPlayer />);
    fireEvent.click(screen.getByRole("radio", { name: "No usable route" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent("Router 1 discards the packet");
    expect(screen.getByRole("status")).toHaveTextContent("may be generated");
  });
});
