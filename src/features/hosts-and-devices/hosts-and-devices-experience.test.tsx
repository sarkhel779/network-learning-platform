import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HostsAndDevicesExperience } from "./hosts-and-devices-experience";

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => false,
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("jest", { advanceTimersByTime: vi.advanceTimersByTime });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("HostsAndDevicesExperience", () => {
  it("offers four journeys and resets playback when the learner changes journey", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HostsAndDevicesExperience />);

    const choices = screen.getAllByRole("radio");
    expect(choices.map((choice) => choice.getAttribute("value"))).toEqual([
      "wired-local",
      "wireless-local",
      "wired-remote",
      "wireless-remote",
    ]);
    expect(screen.getByRole("radio", { name: "Wired host to local server" })).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(/Step 2 of/)).toBeVisible();

    await user.click(screen.getByRole("radio", { name: "Wireless host to remote server" }));
    expect(screen.getByRole("radio", { name: "Wireless host to remote server" })).toBeChecked();
    expect(screen.getByRole("img", { name: "Wireless host to remote server" })).toBeVisible();
    expect(screen.getByText(/Step 1 of/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeVisible();
  });

  it("opens descriptive device details, pauses, and preserves the current step when closed", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HostsAndDevicesExperience />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(/Step 2 of/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Explore Layer 2 switch" }));

    expect(screen.getByRole("heading", { name: "Layer 2 switch" })).toBeVisible();
    expect(screen.getByText(/mailroom that sends an envelope/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Close device details" }));
    expect(screen.queryByRole("heading", { name: "Layer 2 switch" })).not.toBeInTheDocument();
    expect(screen.getByText(/Step 2 of/)).toBeVisible();
  });
});
