import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ArpResolutionLab } from "./arp-resolution-lab";
import { sameSubnetArpSim } from "./same-subnet-arp-sim";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function start() {
  fireEvent.click(screen.getByRole("button", { name: "Start" }));
}

function fixAllFields() {
  for (const field of sameSubnetArpSim.requestFields) {
    fireEvent.change(screen.getByRole("combobox", { name: field.label }), { target: { value: field.correctValue } });
  }
}

describe("ArpResolutionLab", () => {
  it("shows the intro and hides every step until Start is clicked", () => {
    render(<ArpResolutionLab config={sameSubnetArpSim} />);
    expect(screen.getByText(sameSubnetArpSim.intro)).toBeVisible();
    expect(screen.queryByText(sameSubnetArpSim.andQuestion)).not.toBeInTheDocument();
    start();
    expect(screen.getByText(sameSubnetArpSim.andQuestion)).toBeVisible();
  });

  it("rejects a wrong operation choice and reveals the worked AND calculation on the right one", () => {
    render(<ArpResolutionLab config={sameSubnetArpSim} />);
    start();

    fireEvent.click(screen.getByRole("radio", { name: "OR" }));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status")).toHaveTextContent("Not correct");

    fireEvent.click(screen.getByRole("radio", { name: "AND" }));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getAllByText("(192.168.1.0)")).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent(sameSubnetArpSim.nextHopConclusion);
  });

  it("flags every wrong field in the draft ARP request and blocks sending until they're all fixed", () => {
    render(<ArpResolutionLab config={sameSubnetArpSim} />);
    start();
    fireEvent.click(screen.getByRole("radio", { name: "AND" }));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Draft ARP request")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Send ARP Request" }));
    expect(screen.getAllByText("Not correct")).toHaveLength(sameSubnetArpSim.requestFields.length);
    expect(screen.getByText("Draft ARP request")).toBeVisible();
  });

  it("completes the exchange once every field is corrected and shows the reply and cache-learned result", () => {
    vi.useFakeTimers();
    render(<ArpResolutionLab config={sameSubnetArpSim} />);
    start();
    fireEvent.click(screen.getByRole("radio", { name: "AND" }));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fixAllFields();
    fireEvent.click(screen.getByRole("button", { name: "Send ARP Request" }));
    expect(screen.queryByText("Not correct")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(4000));

    expect(screen.getByText("ARP reply")).toBeVisible();
    expect(screen.getByText(sameSubnetArpSim.cacheLearnedMessage)).toBeVisible();
    expect(screen.getByRole("button", { name: "Restart" })).toBeVisible();
  });
});
