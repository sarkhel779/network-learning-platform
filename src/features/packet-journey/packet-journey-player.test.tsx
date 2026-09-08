import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRouteJourney } from "@/features/route-decision/create-route-journey";
import { evaluateRouteDecision } from "@/features/route-decision/evaluate-route-decision";
import { publicRouteDecisionScenarios } from "@/features/route-decision/route-decision.data";

import { PacketJourneyPlayer } from "./packet-journey-player";

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotionState: () => ({ reducedMotion: motion.reduced, isHydrated: true }),
}));

const remote = publicRouteDecisionScenarios.find(({ id }) => id === "remote-through-default-gateway")!;
const direct = publicRouteDecisionScenarios.find(({ id }) => id === "same-subnet-destination")!;
const remoteJourney = createRouteJourney(remote, evaluateRouteDecision(remote));
const directJourney = createRouteJourney(direct, evaluateRouteDecision(direct));

beforeEach(() => {
  motion.reduced = false;
  vi.useFakeTimers();
  vi.stubGlobal("jest", { advanceTimersByTime: vi.advanceTimersByTime });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("PacketJourneyPlayer", () => {
  it("autoplays once, pauses for manual navigation, and exposes Replay at completion", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PacketJourneyPlayer journey={remoteJourney} />);

    expect(screen.getByText("Stage 1 of 6")).toBeVisible();
    expect(screen.getByRole("button", { name: "Pause" })).toBeEnabled();

    await act(async () => vi.advanceTimersByTimeAsync(1400));
    expect(screen.getByText("Stage 2 of 6")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Stage 3 of 6")).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();

    for (let index = 0; index < 3; index += 1) {
      await user.click(screen.getByRole("button", { name: "Next" }));
    }
    expect(screen.getByText("Stage 6 of 6")).toBeVisible();
    expect(screen.getByRole("button", { name: "Replay" })).toBeEnabled();
  });

  it("starts paused under reduced motion and resets when the journey changes", async () => {
    motion.reduced = true;
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { rerender } = render(<PacketJourneyPlayer journey={remoteJourney} />);

    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
    await act(async () => vi.advanceTimersByTimeAsync(2800));
    expect(screen.getByText("Stage 1 of 6")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Stage 2 of 6")).toBeVisible();

    rerender(<PacketJourneyPlayer journey={directJourney} />);
    expect(screen.getByText("Stage 1 of 3")).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
  });
});
