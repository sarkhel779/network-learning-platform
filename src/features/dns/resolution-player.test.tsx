import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resolutionScenarios } from "./resolution-journeys";
import { DnsResolutionPlayer } from "./resolution-player";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({
  useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }),
}));

beforeEach(() => {
  markTerminalStateReached.mockClear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(cleanup);

describe("DnsResolutionPlayer", () => {
  it("offers all journeys and synchronizes the selected packet evidence", async () => {
    const user = userEvent.setup();
    render(<DnsResolutionPlayer progressItemId="dns_name_resolution_interactive_complete_resolution" />);
    expect(screen.getAllByRole("radio")).toHaveLength(6);
    expect(screen.getByRole("status")).toHaveTextContent("Application asks its resolver");
    expect(screen.getByRole("button", { name: "Next" }).closest(".player-controls")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent("Root refers");
    expect(screen.getByRole("region", { name: /active dns exchange/i })).toHaveTextContent("Root server to Recursive resolver");
    expect(screen.getByRole("region", { name: /authority section/i })).toHaveTextContent("NS");
  });

  it("records progress only at a rendered terminal step", async () => {
    const user = userEvent.setup();
    render(<DnsResolutionPlayer progressItemId="dns_name_resolution_interactive_complete_resolution" />);
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(markTerminalStateReached).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("resets playback without erasing completion when the journey changes", async () => {
    const user = userEvent.setup();
    render(<DnsResolutionPlayer />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByLabelText("Warm-cache answer"));
    expect(screen.getByRole("status")).toHaveTextContent("Step 1 of 2");
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("fails closed when authored scenario data is invalid", () => {
    const invalid = { ...resolutionScenarios[0], steps: resolutionScenarios[0].steps.map((step) => ({ ...step, terminal: false })) };
    render(<DnsResolutionPlayer scenarios={[invalid]} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/cannot be animated safely/i);
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(markTerminalStateReached).not.toHaveBeenCalled();
  });
});
