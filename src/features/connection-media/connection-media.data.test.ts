import { describe, expect, it } from "vitest";

import {
  publicConnectionMedia,
} from "./connection-media.data";
import { accountConnectionScenarios } from "./connection-media.account.data";

describe("connection media lesson data", () => {
  it("provides the three approved public media in comparison order", () => {
    expect(publicConnectionMedia.map(({ id }) => id)).toEqual(["copper", "fibre", "wireless"]);
    expect(publicConnectionMedia.map(({ signalLabel }) => signalLabel)).toEqual([
      "Electrical pulses",
      "Light pulses",
      "Radio waves",
    ]);
  });

  it("describes every approved comparison quality for every public medium", () => {
    for (const medium of publicConnectionMedia) {
      expect(Object.keys(medium.qualities), medium.id).toEqual([
        "distance",
        "bandwidth",
        "interference",
        "mobility",
        "cost",
      ]);
    }
  });

  it("provides the six approved account scenarios in teaching order", () => {
    expect(accountConnectionScenarios.map(({ id }) => id)).toEqual([
      "home-desktop",
      "mobile-office",
      "noisy-workshop",
      "campus-buildings",
      "data-centre-interconnect",
      "temporary-classroom",
    ]);
  });

  it("covers every evaluation outcome across the approved scenarios", () => {
    const outcomes = new Set(
      accountConnectionScenarios.flatMap((scenario) => Object.values(scenario.evaluations).map(({ outcome }) => outcome)),
    );

    expect(outcomes).toEqual(new Set(["recommended", "workable-with-trade-offs", "unsuitable"]));
  });

  it("rejects fixed copper for mobile endpoints that require mobility", () => {
    const expectedMobileScenarios = [
      ["mobile-office", "staff laptop"],
      ["temporary-classroom", "student laptops"],
    ] as const;

    for (const [scenarioId, endpoint] of expectedMobileScenarios) {
      const scenario = accountConnectionScenarios.find(({ id }) => id === scenarioId)!;

      expect(scenario.mobilityRequired, scenarioId).toBe(true);
      expect(scenario.evaluations.copper.outcome, scenarioId).toBe("unsuitable");
      expect(scenario.evaluations.copper.explanation, scenarioId).toMatch(new RegExp(endpoint, "i"));
    }
  });
});
