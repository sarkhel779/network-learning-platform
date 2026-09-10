import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TracerouteDiscoveryPlayer } from "./traceroute-discovery-player";
import { tracerouteScenarios } from "./traceroute-journeys";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({ useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }) }));
beforeEach(() => { markTerminalStateReached.mockClear(); window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("TracerouteDiscoveryPlayer", () => {
  it("offers all outcomes and keeps earlier probe evidence in a labelled ledger", () => {
    render(<TracerouteDiscoveryPlayer />);
    for (const title of tracerouteScenarios.map(({ title }) => title)) expect(screen.getByRole("radio", { name: title })).toBeVisible();
    expect(screen.getByText(/Conceptual Windows-style ICMP traceroute/i)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    const table = within(screen.getByRole("region", { name: "Scrollable traceroute probe evidence" })).getByRole("table");
    expect(within(table).getByText("192.0.2.1")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("TTL 2");
  });

  it("shows a silent hop followed by later evidence without calling it a forwarding failure", () => {
    render(<TracerouteDiscoveryPlayer />);
    fireEvent.click(screen.getByRole("radio", { name: "Silent hop, then later replies" }));
    for (let index = 0; index < 5; index += 1) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    const table = screen.getByRole("table", { name: "Observed traceroute probes" });
    expect(within(table).getByText("*")).toBeVisible();
    expect(within(table).getByText("198.51.100.20")).toBeVisible();
    expect(screen.getByText(/silence does not prove the router failed to forward/i)).toBeVisible();
  });

  it("supports controls and records progress only at the terminal observation", () => {
    render(<TracerouteDiscoveryPlayer progressItemId="trace-player" />);
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    for (let index = 0; index < 5; index += 1) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(/destination reached/i)).toBeVisible();
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("status")).toHaveTextContent("Step 1 of 6");
    expect(screen.getByRole("combobox", { name: "Playback speed" })).toBeVisible();
  });

  it("autoplays for normal motion and fails closed for malformed data", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const view = render(<TracerouteDiscoveryPlayer />);
    expect(screen.getByRole("button", { name: "Pause" })).toBeEnabled();
    view.unmount();
    vi.useFakeTimers();
    const malformed = { ...tracerouteScenarios[0], sourceId: "missing" } as typeof tracerouteScenarios[0];
    render(<TracerouteDiscoveryPlayer progressItemId="bad" scenarios={[malformed]} />);
    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByRole("alert")).toHaveTextContent("cannot be animated safely");
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
  });
});
