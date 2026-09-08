import { describe, expect, it } from "vitest";

import { getVlanTagJourney } from "./vlan-tag-journey.data";

describe("getVlanTagJourney", () => {
  it("shows the tag being inserted for the trunk and removed before delivery", () => {
    const journey = getVlanTagJourney(10);
    expect(journey).toHaveLength(7);
    expect(journey.map(({ tagged }) => tagged)).toEqual([false, false, true, true, true, false, false]);
    expect(journey.map(({ phase }) => phase)).toEqual(["untagged", "classified", "tagged", "tagged", "classified", "untagged", "delivered"]);
  });

  it.each([10, 20] as const)("preserves VLAN %s and exposes the exact 802.1Q fields", (vlan) => {
    const journey = getVlanTagJourney(vlan);
    expect(journey.every((step) => step.vlan === vlan)).toBe(true);
    expect(journey[2].detailFields).toEqual(expect.arrayContaining([
      { label: "TPID", value: "0x8100" },
      { label: "PCP", value: "0" },
      { label: "DEI", value: "0" },
      { label: "VLAN ID", value: String(vlan) },
      { label: "Encapsulated EtherType", value: "0x0800" },
    ]));
    expect(journey[2].explanation).toMatch(/newly transmitted FCS/i);
  });
});
