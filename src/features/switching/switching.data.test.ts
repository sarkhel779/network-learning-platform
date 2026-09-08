import { describe, expect, it } from "vitest";

import { publicSwitchingComparison } from "./switching.data";

describe("public switching comparison data", () => {
  it("describes hub, bridge, and switch across every public dimension", () => {
    expect(publicSwitchingComparison.map(({ id }) => id)).toEqual(["hub", "bridge", "switch"]);
    for (const device of publicSwitchingComparison) {
      expect(Object.keys(device.dimensions)).toEqual([
        "signal-handling",
        "collision-scope",
        "bandwidth-sharing",
        "address-awareness",
        "delivery-scope",
      ]);
      for (const detail of Object.values(device.dimensions)) {
        expect(detail.explanation).toMatch(/\S/);
        expect(detail.behavior).toMatch(/^(repeat|segment|filter|learn|forward|flood)$/);
      }
    }
  });

  it("keeps public facts technically bounded", () => {
    const serialized = JSON.stringify(publicSwitchingComparison);
    expect(serialized).toContain("does not inspect MAC addresses");
    expect(serialized).toContain("source MAC");
    expect(serialized).toContain("broadcast domain");
    expect(serialized).not.toMatch(/same-segment-filtering|first-frame-unknown-destination|VLAN-aware/);
  });
});
