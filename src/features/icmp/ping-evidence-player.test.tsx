import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PLAYBACK_SPEEDS } from "@/features/packet-flow/packet-flow.schema";
import { PingEvidencePlayer } from "./ping-evidence-player";
import { pingScenarios } from "./ping-journeys";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({
  useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }),
}));

beforeEach(() => {
  markTerminalStateReached.mockClear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("PingEvidencePlayer", () => {
  it("offers every approved outcome with synchronized topology and packet evidence", () => {
    render(<PingEvidencePlayer />);
    for (const title of pingScenarios.map(({ title }) => title)) expect(screen.getByRole("radio", { name: title })).toBeVisible();
    const topology = screen.getByRole("list", { name: "Ping path topology" });
    for (const label of ["Source Host", "Gateway Router", "Destination Host"]) expect(within(topology).getByText(label)).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Step 1 of 3");
    expect(screen.getByText("Echo Request (type 8, code 0)")).toBeVisible();
    expect(screen.getByText("TTL: 64")).toBeVisible();
  });

  it("shows reporter and quoted packet evidence without confusing it with the destination", () => {
    render(<PingEvidencePlayer />);
    fireEvent.click(screen.getByRole("radio", { name: "Destination Host Unreachable" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    const evidence = screen.getByRole("region", { name: "Scrollable ICMP packet evidence" });
    expect(within(evidence).getByText("Gateway Router")).toBeVisible();
    expect(within(evidence).getByText(/192\.0\.2\.10 → 198\.51\.100\.20/)).toBeVisible();
    expect(screen.getByText(/type 3, code 1/i)).toBeVisible();
  });

  it("represents timeout as absent evidence and never invents an Echo Reply", () => {
    render(<PingEvidencePlayer />);
    fireEvent.click(screen.getByRole("radio", { name: "Timeout with no response" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("No response observed")).toBeVisible();
    expect(screen.getByText(/No reply was observed before the deadline/i)).toBeVisible();
    expect(screen.queryByText(/Echo Reply \(type 0, code 0\)/i)).not.toBeInTheDocument();
  });

  it("supports manual controls, all speeds, reset, and terminal-only progress", () => {
    render(<PingEvidencePlayer progressItemId="ping-player" />);
    const speed = screen.getByRole("combobox", { name: "Playback speed" });
    for (const value of PLAYBACK_SPEEDS) expect(within(speed).getByRole("option", { name: `${value}×` })).toBeVisible();
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
    expect(screen.getByText(/does not prove that every application is healthy/i)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("status")).toHaveTextContent("Step 1 of 3");
  });

  it("autoplays only after normal-motion preference resolves", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    render(<PingEvidencePlayer />);
    expect(screen.getByRole("button", { name: "Pause" })).toBeEnabled();
  });

  it("fails closed without timers or progress for malformed authored data", () => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const malformed = { ...pingScenarios[0], sourceId: "missing" } as typeof pingScenarios[0];
    render(<PingEvidencePlayer progressItemId="bad" scenarios={[malformed]} />);
    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByRole("alert")).toHaveTextContent("cannot be animated safely");
    expect(screen.getByRole("region", { name: "Static ICMP evidence" })).toBeVisible();
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
  });
});
