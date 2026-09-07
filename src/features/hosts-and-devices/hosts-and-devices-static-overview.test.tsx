import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HostsAndDevicesStaticOverview } from "./hosts-and-devices-static-overview";

describe("HostsAndDevicesStaticOverview", () => {
  it("server-renders the topology relationships and every device summary", () => {
    render(<HostsAndDevicesStaticOverview />);

    expect(screen.getByRole("heading", { name: "Static topology guide" })).toBeVisible();
    expect(screen.getByText(/Wired PC → Layer 2 switch → local server/)).toBeVisible();
    expect(screen.getByText(/Wireless laptop → access point → Layer 2 switch/)).toBeVisible();

    for (const name of [
      "Wired PC",
      "Wireless laptop",
      "Wireless access point",
      "Layer 2 switch",
      "Router and default gateway",
      "Firewall boundary",
      "Local server",
      "Remote server",
    ]) {
      expect(screen.getByRole("heading", { name, level: 4 })).toBeVisible();
    }
  });
});
