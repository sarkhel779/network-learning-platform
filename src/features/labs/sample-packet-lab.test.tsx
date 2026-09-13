import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SamplePacketLab } from "./sample-packet-lab";

afterEach(cleanup);

describe("SamplePacketLab", () => {
  it("lets a learner configure and inspect a blocked packet run", async () => {
    const user = userEvent.setup();
    render(<SamplePacketLab />);
    for (const name of ["Lab Topology", "Packet Flow", "Config", "Explanation"]) expect(screen.getByRole("tab", { name })).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Config" }));
    await user.click(screen.getByRole("radio", { name: /No default gateway/i }));
    await user.click(screen.getByRole("tab", { name: "Lab Topology" }));
    expect(screen.getByRole("status")).toHaveTextContent(/cannot leave the PC/i);
    expect(screen.queryByTestId("moving-lab-packet")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Packet Flow" }));
    expect(screen.getByText("198.51.100.20")).toBeVisible();
    expect(screen.getByText(/no Ethernet frame is sent/i)).toBeVisible();
  });

  it("advances a remote journey and gives immediate prediction feedback", async () => {
    const user = userEvent.setup();
    render(<SamplePacketLab />);
    expect(screen.getByText(/Which device’s MAC is the destination/i)).toBeVisible();
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
      render(<SamplePacketLab />);
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
});
