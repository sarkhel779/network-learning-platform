import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RoutingTableDecisionPlayer } from "./routing-table-decision-player";
import { routeDecisionScenarios } from "./route-decision.scenarios";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({ useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }) }));

beforeEach(() => { markTerminalStateReached.mockClear(); window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }); });
afterEach(cleanup);

describe("RoutingTableDecisionPlayer", () => {
  it("renders scenarios, a captioned route table, and the ordered decision", () => {
    render(<RoutingTableDecisionPlayer progressItemId="route-player" />);
    expect(screen.getByRole("radio", { name: "Connected IPv4 network" })).toBeChecked();
    expect(screen.getByRole("table", { name: "Routes considered for Connected IPv4 network" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Administrative distance" })).toBeVisible();
    expect(screen.getByText(/Step 1 of 6: Address family/)).toBeVisible();
    expect(screen.getAllByText("Retained: Address family matches")).toHaveLength(2);
  });

  it("supports manual controls, speeds, no-route results, and terminal progress", () => {
    render(<RoutingTableDecisionPlayer progressItemId="route-player" />);
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
    expect(screen.getByRole("combobox", { name: "Playback speed" })).toHaveTextContent("0.5×");
    for (let index = 0; index < 5; index += 1) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(/Selected route: connected/)).toBeVisible();
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("radio", { name: "No usable route" }));
    expect(screen.getByText(/Step 1 of 6/)).toBeVisible();
    for (let index = 0; index < 5; index += 1) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent("No usable route: discard the packet.");
  });

  it("confines the wide table to a labelled local scroll region", () => {
    render(<RoutingTableDecisionPlayer />);
    const region = screen.getByRole("region", { name: "Scrollable routing table" });
    expect(within(region).getByRole("table")).toBeInTheDocument();
    expect(region).toHaveClass("routing-table-scroll");
  });

  it("starts normal-motion playback after the client preference resolves", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    render(<RoutingTableDecisionPlayer />);
    expect(screen.getByRole("button", { name: "Pause" })).toBeEnabled();
  });

  it("fails closed with static route evidence when authored metrics are incomparable", () => {
    const base = routeDecisionScenarios[0];
    const malformed = { ...base, allowEqualCost: false, routes: base.routes.map((route, index) => ({ ...route, prefix: "192.0.2.0/24", administrativeDistance: 1, metricDomain: index === 0 ? "cost" : "hops" })) } as typeof base;
    render(<RoutingTableDecisionPlayer scenarios={[malformed]} />);
    expect(screen.getByRole("alert")).toHaveTextContent("cannot be animated safely");
    expect(screen.getByRole("region", { name: "Static routing table" })).toBeVisible();
    expect(screen.getByText(base.plainLanguageConclusion!)).toBeVisible();
  });

  it("does not autoplay or award progress behind an invalid-scenario fallback", () => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const base = routeDecisionScenarios[0];
    const malformed = { ...base, allowEqualCost: false, routes: base.routes.map((route, index) => ({ ...route, prefix: "192.0.2.0/24", administrativeDistance: 1, metricDomain: index === 0 ? "cost" : "hops" })) } as typeof base;
    render(<RoutingTableDecisionPlayer progressItemId="invalid-route-player" scenarios={[malformed]} />);
    act(() => vi.advanceTimersByTime(30_000));
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
