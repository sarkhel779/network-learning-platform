import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { PacketJourneyLab } from "./packet-journey-lab";

afterEach(cleanup);

describe("PacketJourneyLab", () => {
  it("shows a blocked packet run when there is no default gateway", () => {
    render(<PacketJourneyLab configuration="no-gateway" />);
    expect(screen.getByRole("status")).toHaveTextContent(/cannot leave the PC/i);
    expect(screen.getByText("198.51.100.20")).toBeInTheDocument();
    expect(screen.getByText(/no Ethernet frame is sent/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Send to next hop" })).toBeDisabled();
  });

  it("lets the user step hop by hop and unfold the packet to see what changed", async () => {
    const user = userEvent.setup();
    render(<PacketJourneyLab configuration="remote" />);
    expect(screen.getByText(/which device's MAC is the destination/i)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Send to next hop" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Switch forwards to the router/i);

    await user.click(screen.getByRole("button", { name: "Send to next hop" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Router creates a new frame/i);

    await user.click(screen.getByRole("button", { name: /IP packet/ }));
    expect(screen.getByText("63")).toBeVisible();
    expect(screen.getByRole("button", { name: /Ethernet frame/ })).toHaveTextContent("2 changed");

    await user.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("status")).toHaveTextContent(/PC sends toward its gateway/i);

    await user.click(screen.getByRole("radio", { name: /The router/i }));
    await user.click(screen.getByRole("button", { name: "Check prediction" }));
    expect(screen.getByRole("status", { name: "Prediction feedback" })).toHaveTextContent(/Correct/i);
  });

  it("disables the next-hop button once the final hop is reached", async () => {
    const user = userEvent.setup();
    render(<PacketJourneyLab configuration="local" />);
    for (let step = 0; step < 3; step += 1) {
      await user.click(screen.getByRole("button", { name: "Send to next hop" }));
    }
    expect(screen.getByRole("status")).toHaveTextContent(/Hop 4 of 4/i);
    expect(screen.getByRole("button", { name: "Send to next hop" })).toBeDisabled();
  });

  it("asks a same-subnet-specific prediction question for the local scenario", () => {
    render(<PacketJourneyLab configuration="local" />);
    expect(screen.getByText(/pings a server on its own subnet/i)).toBeVisible();
  });
});
