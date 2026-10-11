import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ArpResolutionLab } from "./arp-resolution-lab";
import { crossSubnetArpSim } from "./cross-subnet-arp-sim";

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

describe("ArpResolutionLab (cross-subnet scenario)", () => {
  it("concludes the destination is on a different network after the AND reveal", () => {
    render(<ArpResolutionLab config={crossSubnetArpSim} />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(screen.getByRole("radio", { name: "AND" }));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status")).toHaveTextContent(crossSubnetArpSim.nextHopConclusion);
  });

  it("drops the request with no reply when the learner picks the remote server instead of the gateway", () => {
    vi.useFakeTimers();
    render(<ArpResolutionLab config={crossSubnetArpSim} />);
    reachDecisionStep();

    fireEvent.click(decisionGroup().getByRole("radio", { name: "203.0.113.50 (the remote server)" }));
    fireEvent.click(decisionGroup().getByRole("button", { name: "Check" }));
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByText(crossSubnetArpSim.decisionStep!.dropExplanation)).toBeVisible();
    expect(screen.queryByText("Draft ARP request")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  it("lets the learner retry, pick the gateway, and complete the exchange", () => {
    vi.useFakeTimers();
    render(<ArpResolutionLab config={crossSubnetArpSim} />);
    reachDecisionStep();

    fireEvent.click(decisionGroup().getByRole("radio", { name: "203.0.113.50 (the remote server)" }));
    fireEvent.click(decisionGroup().getByRole("button", { name: "Check" }));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    fireEvent.click(decisionGroup().getByRole("radio", { name: "192.168.1.1 (the default gateway)" }));
    fireEvent.click(decisionGroup().getByRole("button", { name: "Check" }));
    expect(screen.getByText(crossSubnetArpSim.decisionStep!.proceedExplanation)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Draft ARP request")).toBeVisible();

    for (const field of crossSubnetArpSim.requestFields) {
      fireEvent.change(screen.getByRole("combobox", { name: field.label }), { target: { value: field.correctValue } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Send ARP Request" }));
    act(() => vi.advanceTimersByTime(4000));

    expect(screen.getByText(crossSubnetArpSim.cacheLearnedMessage)).toBeVisible();
  });
});
