import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { Ipv4AddressBoundaryPlayer } from "./ipv4-address-boundary-player";
import { Ipv4BinaryExplorer } from "./ipv4-binary-explorer";

afterEach(cleanup);

describe("IPv4 lesson interactives", () => {
  it("lets a learner change an octet bit and see its decimal value", async () => {
    const user = userEvent.setup();
    render(<Ipv4BinaryExplorer />);
    expect(screen.getByText("192 = 11000000")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Toggle 32 bit" }));
    expect(screen.getByText("224 = 11100000")).toBeVisible();
  });

  it("shows the network boundary and address classification for each scenario", async () => {
    const user = userEvent.setup();
    render(<Ipv4AddressBoundaryPlayer />);
    expect(screen.getByText("Network: 192.0.2.0")).toBeVisible();
    expect(screen.getByText("Type: documentation")).toBeVisible();
    await user.click(screen.getByRole("radio", { name: "Private office host" }));
    expect(screen.getByText("Network: 10.20.16.0")).toBeVisible();
    expect(screen.getByText("Type: private")).toBeVisible();
  });
});
