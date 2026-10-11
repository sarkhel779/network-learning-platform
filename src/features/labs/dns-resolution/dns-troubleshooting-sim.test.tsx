import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DnsJourneyLab } from "./dns-journey-lab";
import { dnsTroubleshootingSim } from "./dns-troubleshooting-sim";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("DnsJourneyLab (troubleshooting scenario)", () => {
  it("has no node movement for the purely conceptual second hop, and blocks at the resolver for the negative-cache hop", () => {
    vi.useFakeTimers();
    render(<DnsJourneyLab config={dnsTroubleshootingSim} />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    for (let i = 0; i < dnsTroubleshootingSim.hops.length; i += 1) {
      const hop = dnsTroubleshootingSim.hops[i];
      const correctOption = hop.options.find((option) => option.id === hop.correctId)!;
      const group = within(screen.getAllByRole("group", { name: "Pick one" })[i]);
      fireEvent.click(group.getByRole("radio", { name: correctOption.label }));
      fireEvent.click(group.getByRole("button", { name: "Check" }));
      const isLast = i === dnsTroubleshootingSim.hops.length - 1;
      fireEvent.click(screen.getByRole("button", { name: isLast ? "Finish" : "Continue" }));
      act(() => vi.advanceTimersByTime(2000));
    }

    expect(screen.getByText(dnsTroubleshootingSim.completionMessage)).toBeVisible();
  });
});
