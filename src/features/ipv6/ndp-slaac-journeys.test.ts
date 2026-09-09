import { describe, expect, it } from "vitest";
import { ndpSlaacJourneys } from "./ndp-slaac-journeys";

describe("NDP and SLAAC journeys", () => {
  it("defines five valid journeys with fully labelled interfaces", () => {
    expect(ndpSlaacJourneys).toHaveLength(5);
    for (const scenario of ndpSlaacJourneys) {
      expect(scenario.links.every((link) => link.fromInterface && link.toInterface)).toBe(true);
    }
  });

  it("shows the complete foundational SLAAC sequence and packet evidence", () => {
    const titles = ndpSlaacJourneys[0].steps.map(({ title }) => title).join(" ");
    expect(titles).toContain("Duplicate Address Detection");
    expect(titles).toContain("Router Solicitation");
    expect(titles).toContain("Router Advertisement");
    expect(titles).toContain("Neighbor Solicitation");
    expect(titles).toContain("Neighbor Advertisement");
    expect(ndpSlaacJourneys[0].steps.some(({ summaryFields }) => summaryFields.some(({ value }) => value.includes("ff02::1:ff")))).toBe(true);
  });
});
