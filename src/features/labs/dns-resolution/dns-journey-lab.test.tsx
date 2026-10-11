import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DnsJourneyLab } from "./dns-journey-lab";
import { dnsResolutionOrderSim } from "./dns-resolution-order-sim";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function hopGroup(index: number) {
  return within(screen.getAllByRole("group", { name: "Pick one" })[index]);
}

describe("DnsJourneyLab", () => {
  it("hides every hop until Start is clicked, then reveals only the first", () => {
    render(<DnsJourneyLab config={dnsResolutionOrderSim} />);
    expect(screen.getByText(dnsResolutionOrderSim.intro)).toBeVisible();
    expect(screen.queryByText(dnsResolutionOrderSim.hops[0].prompt)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(screen.getByText(dnsResolutionOrderSim.hops[0].prompt)).toBeVisible();
    expect(screen.queryByText(dnsResolutionOrderSim.hops[1].prompt)).not.toBeInTheDocument();
  });

  it("rejects a wrong answer without advancing, then accepts the correct one and reveals the next hop", () => {
    vi.useFakeTimers();
    render(<DnsJourneyLab config={dnsResolutionOrderSim} />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    const wrongOption = dnsResolutionOrderSim.hops[0].options.find((option) => option.id !== dnsResolutionOrderSim.hops[0].correctId)!;
    fireEvent.click(hopGroup(0).getByRole("radio", { name: wrongOption.label }));
    fireEvent.click(hopGroup(0).getByRole("button", { name: "Check" }));
    expect(screen.getByText("Not correct — try again.")).toBeVisible();
    expect(screen.queryByText(dnsResolutionOrderSim.hops[1].prompt)).not.toBeInTheDocument();

    const correctOption = dnsResolutionOrderSim.hops[0].options.find((option) => option.id === dnsResolutionOrderSim.hops[0].correctId)!;
    fireEvent.click(hopGroup(0).getByRole("radio", { name: correctOption.label }));
    fireEvent.click(hopGroup(0).getByRole("button", { name: "Check" }));
    expect(screen.getByText(dnsResolutionOrderSim.hops[0].explanation)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText(dnsResolutionOrderSim.hops[1].prompt)).toBeVisible();
  });

  it("walks every hop and shows the completion message on the last Finish", () => {
    vi.useFakeTimers();
    render(<DnsJourneyLab config={dnsResolutionOrderSim} />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    for (let i = 0; i < dnsResolutionOrderSim.hops.length; i += 1) {
      const hop = dnsResolutionOrderSim.hops[i];
      const correctOption = hop.options.find((option) => option.id === hop.correctId)!;
      fireEvent.click(hopGroup(i).getByRole("radio", { name: correctOption.label }));
      fireEvent.click(hopGroup(i).getByRole("button", { name: "Check" }));
      const isLast = i === dnsResolutionOrderSim.hops.length - 1;
      fireEvent.click(screen.getByRole("button", { name: isLast ? "Finish" : "Continue" }));
      act(() => vi.advanceTimersByTime(2000));
    }

    expect(screen.getByText(dnsResolutionOrderSim.completionMessage)).toBeVisible();
    expect(screen.getByRole("button", { name: "Restart" })).toBeVisible();
  });
});
