import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NdpSlaacJourneyPlayer } from "./ndp-slaac-journey-player";

describe("NdpSlaacJourneyPlayer", () => {
  afterEach(cleanup);
  beforeEach(() => Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) }));

  it("offers five scenarios and renders labelled interfaces with packet inspection", () => {
    render(<NdpSlaacJourneyPlayer />);
    expect(within(screen.getByRole("group", { name: "Choose an IPv6 journey" })).getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByText("Host eth0")).toBeVisible();
    expect(screen.getByText("Router Gi0/0")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Packet inspector" })).toBeVisible();
  });

  it("changes to DAD conflict and resets the journey", () => {
    render(<NdpSlaacJourneyPlayer />);
    fireEvent.click(screen.getByRole("radio", { name: "DAD conflict" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getAllByText(/tentative address cannot be assigned/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Step 2 of 2")).toBeVisible();
  });
});
