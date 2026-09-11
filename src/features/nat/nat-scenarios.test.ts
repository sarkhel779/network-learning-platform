import { describe, expect, it } from "vitest";

import {
  hairpinBidirectionalJourney,
  hairpinDnatOnlyJourney,
  natScenarios,
  patInternetJourney,
} from "./nat-scenarios";

describe("NAT journeys", () => {
  it("maps and reverses a PAT HTTPS tuple", () => {
    expect(patInternetJourney.steps.some((step) => step.translations.some((item) => item.kind === "pat"))).toBe(true);
    expect(patInternetJourney.steps.at(-1)?.tuple).toMatchObject({
      sourceIp: "198.51.100.20",
      sourcePort: 443,
      destinationIp: "10.0.0.25",
      destinationPort: 51514,
    });
  });

  it("shows why DNAT-only hairpinning returns an unacceptable peer tuple", () => {
    expect(hairpinDnatOnlyJourney.outcome).toBe("failure");
    expect(hairpinDnatOnlyJourney.steps.at(-1)?.tuple).toMatchObject({
      sourceIp: "10.0.0.50",
      destinationIp: "10.0.0.25",
    });
  });

  it("keeps a successful hairpin response on the gateway path with paired translation", () => {
    const translations = hairpinBidirectionalJourney.steps.flatMap((step) => step.translations);
    expect(translations.map((item) => item.kind)).toEqual(expect.arrayContaining(["dnat", "snat"]));
    expect(hairpinBidirectionalJourney.steps.at(-1)?.tuple).toMatchObject({
      sourceIp: "203.0.113.10",
      sourcePort: 443,
      destinationIp: "10.0.0.25",
      destinationPort: 51514,
    });
  });

  it("exports all canonical scenarios", () => {
    expect(natScenarios.map((scenario) => scenario.id)).toEqual([
      "pat-internet-journey",
      "hairpin-dnat-only",
      "hairpin-bidirectional",
    ]);
  });
});
