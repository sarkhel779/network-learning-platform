import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { serviceScenarios } from "./service-scenarios";
import { ServiceJourneyPlayer } from "./service-journey-player";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({
  useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }),
}));

beforeEach(() => {
  markTerminalStateReached.mockClear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(cleanup);

describe("ServiceJourneyPlayer", () => {
  it("keeps topology, ports, and message evidence synchronized with navigation", async () => {
    const user = userEvent.setup();
    render(<ServiceJourneyPlayer progressItemId="essential_services_interactive_web" service="web" />);
    expect(screen.getByRole("region", { name: "Web service journey" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Step 1 of 3: HTTP request");
    expect(screen.getByRole("table", { name: /protocol message/i })).toHaveTextContent("GET");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent("Step 2 of 3: HTTPS service");
    expect(screen.getByRole("region", { name: /active service exchange/i })).toHaveTextContent("browser to secure-web-server");
    expect(screen.getByText("TCP 51001 → 443")).toBeVisible();
  });

  it("records progress only when the rendered journey reaches its terminal step", async () => {
    const user = userEvent.setup();
    render(<ServiceJourneyPlayer progressItemId="essential_services_interactive_web" service="web" />);
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("contains invalid authored data instead of breaking the lesson", () => {
    const invalid = { ...serviceScenarios.web, steps: serviceScenarios.web.steps.map((step) => ({ ...step, terminal: false })) };
    render(<ServiceJourneyPlayer scenario={invalid} service="web" />);
    expect(screen.getByRole("alert")).toHaveTextContent(/cannot be animated safely/i);
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
  });
});
