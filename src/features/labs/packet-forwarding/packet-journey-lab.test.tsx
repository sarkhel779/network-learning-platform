import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PacketJourneyLab } from "./packet-journey-lab";

afterEach(cleanup);

describe("PacketJourneyLab", () => {
  it("shows a blocked packet run when there is no default gateway", async () => {
    const user = userEvent.setup();
    render(<PacketJourneyLab configuration="no-gateway" />);
    for (const name of ["Lab Topology", "Packet Flow", "Explanation"]) expect(screen.getByRole("tab", { name })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(/cannot leave the PC/i);
    expect(screen.queryByTestId("moving-lab-packet")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Packet Flow" }));
    expect(screen.getByText("198.51.100.20")).toBeVisible();
    expect(screen.getByText(/no Ethernet frame is sent/i)).toBeVisible();
  });

  it("advances a remote journey and gives immediate prediction feedback", async () => {
    const user = userEvent.setup();
    render(<PacketJourneyLab configuration="remote" />);
    expect(screen.getByText(/which device's MAC is the destination/i)).toBeVisible();
    expect(screen.getByTestId("moving-lab-packet")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next hop" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Switch forwards to the router/i);
    await user.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("status")).toHaveTextContent(/PC sends toward its gateway/i);
    await user.click(screen.getByRole("radio", { name: /The router/i }));
    await user.click(screen.getByRole("button", { name: "Check prediction" }));
    expect(screen.getByRole("status", { name: "Prediction feedback" })).toHaveTextContent(/Correct/i);
  });

  it("stops playback when the packet reaches the final hop", () => {
    vi.useFakeTimers();
    try {
      render(<PacketJourneyLab configuration="remote" />);
      fireEvent.click(screen.getByRole("button", { name: "Play packet flow" }));
      for (let hop = 0; hop < 5; hop += 1) {
        act(() => vi.advanceTimersByTime(1650));
      }
      expect(screen.getByRole("status")).toHaveTextContent(/Hop 6 of 6/i);
      expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Play packet flow" })).toBeDisabled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("asks a same-subnet-specific prediction question for the local scenario", () => {
    render(<PacketJourneyLab configuration="local" />);
    expect(screen.getByText(/pings a server on its own subnet/i)).toBeVisible();
  });
});
