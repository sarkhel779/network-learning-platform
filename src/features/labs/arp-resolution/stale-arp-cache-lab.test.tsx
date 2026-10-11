import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ArpResolutionLab } from "./arp-resolution-lab";
import { staleArpCacheSim } from "./stale-arp-cache-sim";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function decisionGroup() {
  return within(screen.getByRole("group", { name: "Pick one" }));
}

function reachDecisionStep() {
  fireEvent.click(screen.getByRole("button", { name: "Start" }));
  fireEvent.click(screen.getByRole("radio", { name: "AND" }));
  fireEvent.click(screen.getByRole("button", { name: "Check" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

describe("ArpResolutionLab (stale ARP cache scenario)", () => {
  it("drops silently when the learner just resends with the stale cache entry", () => {
    vi.useFakeTimers();
    render(<ArpResolutionLab config={staleArpCacheSim} />);
    reachDecisionStep();

    fireEvent.click(decisionGroup().getByRole("radio", { name: "Resend the print job — the cached entry should still be fine" }));
    fireEvent.click(decisionGroup().getByRole("button", { name: "Check" }));
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByText(staleArpCacheSim.decisionStep!.dropExplanation)).toBeVisible();
  });

  it("pre-fills the draft request with the stale MAC and flags it until corrected", () => {
    vi.useFakeTimers();
    render(<ArpResolutionLab config={staleArpCacheSim} />);
    reachDecisionStep();
    fireEvent.click(decisionGroup().getByRole("radio", { name: "Clear the stale entry and send a fresh ARP request" }));
    fireEvent.click(decisionGroup().getByRole("button", { name: "Check" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("combobox", { name: "Target MAC (ARP payload)" })).toHaveValue("dd:dd:dd:dd:dd:dd");

    fireEvent.click(screen.getByRole("button", { name: "Send ARP Request" }));
    expect(screen.getAllByText("Not correct")).toHaveLength(staleArpCacheSim.requestFields.length);
  });

  it("resolves the new MAC once every field is fixed, replacing the stale entry", () => {
    vi.useFakeTimers();
    render(<ArpResolutionLab config={staleArpCacheSim} />);
    reachDecisionStep();
    fireEvent.click(decisionGroup().getByRole("radio", { name: "Clear the stale entry and send a fresh ARP request" }));
    fireEvent.click(decisionGroup().getByRole("button", { name: "Check" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    for (const field of staleArpCacheSim.requestFields) {
      fireEvent.change(screen.getByRole("combobox", { name: field.label }), { target: { value: field.correctValue } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Send ARP Request" }));
    act(() => vi.advanceTimersByTime(4000));

    expect(screen.getByText(staleArpCacheSim.cacheLearnedMessage)).toBeVisible();
  });
});
