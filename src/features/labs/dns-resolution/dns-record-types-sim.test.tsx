import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DnsJourneyLab } from "./dns-journey-lab";
import { dnsRecordTypesSim } from "./dns-record-types-sim";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("DnsJourneyLab (record types scenario)", () => {
  it("routes the packet to the web server after the A-record hop and to the mail server after the MX hop", () => {
    vi.useFakeTimers();
    render(<DnsJourneyLab config={dnsRecordTypesSim} />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    for (let i = 0; i < 3; i += 1) {
      const hop = dnsRecordTypesSim.hops[i];
      const correctOption = hop.options.find((option) => option.id === hop.correctId)!;
      const group = within(screen.getAllByRole("group", { name: "Pick one" })[i]);
      fireEvent.click(group.getByRole("radio", { name: correctOption.label }));
      fireEvent.click(group.getByRole("button", { name: "Check" }));
      fireEvent.click(screen.getByRole("button", { name: "Continue" }));
      act(() => vi.advanceTimersByTime(2000));
    }

    expect(screen.getByText(dnsRecordTypesSim.hops[2].explanation, { exact: false })).toBeVisible();
  });
});
