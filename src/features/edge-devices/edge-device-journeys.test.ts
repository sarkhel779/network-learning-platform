import { describe, expect, it } from "vitest";

import { edgeDeviceJourneys } from "./edge-device-journeys";

describe("edge device journeys", () => {
  it("models fibre, cable, office wireless, and bridge-only layouts as distinct roles", () => {
    expect(edgeDeviceJourneys.map(({ id }) => id)).toEqual([
      "home-fibre",
      "home-cable",
      "office-wireless",
      "bridge-only-handoff",
    ]);
    expect(edgeDeviceJourneys[0].devices.map(({ label }) => label)).toEqual([
      "Laptop",
      "Wi-Fi access point",
      "Router + firewall",
      "ONT",
      "ISP network",
    ]);
  });

  it("shows conversion and security boundaries without claiming that the ONT routes or filters", () => {
    const fibre = edgeDeviceJourneys[0];
    expect(fibre.stages.map(({ role }) => role)).toEqual([
      "create-data", "bridge-access", "route", "inspect-policy", "convert-signal", "provider-handoff",
    ]);
    expect(fibre.stages.find(({ role }) => role === "convert-signal")).toMatchObject({
      activeDeviceId: "conversion",
      changesPacketAddressing: false,
    });
    expect(fibre.stages.find(({ role }) => role === "inspect-policy")?.explanation)
      .toMatch(/permit|deny/i);
  });
});
