import { describe, expect, it } from "vitest";

import { createSwitchingJourney } from "./create-switching-journey";

describe("createSwitchingJourney", () => {
  it.each([
    ["hub", "flood", "Physical signal", "P2 and P3"],
    ["bridge", "filter", "Source and destination MAC addresses", "Only the required segment"],
    ["switch", "forward", "Source and destination MAC addresses", "The selected switch port"],
  ] as const)("explains %s behavior without implying routing", (deviceId, behavior, inspected, egress) => {
    const journey = createSwitchingJourney(deviceId, "delivery-scope");
    const serialized = JSON.stringify(journey);

    expect(journey.stages.map(({ id }) => id)).toEqual(["arrive-on-p1", `${behavior}-at-intermediary`, "leave-eligible-ports"]);
    expect(journey.stages[1].explanation).toContain(inspected);
    expect(journey.stages[2].explanation).toContain(egress);
    expect(journey.stages[0].activeLinkId).toBe("source-intermediary");
    expect(serialized).not.toMatch(/routing|gateway|security boundary|IP forwarding/i);
  });
});
