import { describe, expect, it } from "vitest";

import {
  parseConnectionMediaCatalog,
  safeParseConnectionMediaCatalog,
} from "./connection-media.schema";

const qualities = {
  distance: { label: "Distance", explanation: "Useful across a nearby room." },
  bandwidth: { label: "Bandwidth", explanation: "Carries a practical amount of traffic." },
  interference: { label: "Interference", explanation: "Needs a reasonably clean environment." },
  mobility: { label: "Mobility", explanation: "Suited to a fixed endpoint." },
  cost: { label: "Cost", explanation: "Uses familiar equipment." },
};

const media = [
  {
    id: "copper",
    name: "Copper",
    signalLabel: "Electrical pulses",
    summary: "Twisted-pair cable carries electrical signals.",
    analogy: "A dedicated path between nearby rooms.",
    qualities,
  },
  {
    id: "fibre",
    name: "Fibre",
    signalLabel: "Light pulses",
    summary: "Fibre carries light signals.",
    analogy: "A light-guided route between distant points.",
    qualities,
  },
  {
    id: "wireless",
    name: "Wireless",
    signalLabel: "Radio waves",
    summary: "Wireless carries radio signals through shared air.",
    analogy: "A shared conversation across a room.",
    qualities,
  },
] as const;

function evaluation(outcome: "recommended" | "workable-with-trade-offs" | "unsuitable") {
  return {
    outcome,
    decisiveRequirements: ["The required distance"],
    explanation: "This choice is assessed against the scenario requirements.",
  };
}

const validCatalog = {
  media,
  scenarios: [
    {
      id: "nearby-workstation",
      title: "Nearby workstation",
      source: "A desktop",
      destination: "A router",
      distance: "5 metres",
      minimumBandwidth: "1 Gbit/s",
      latencySensitivity: "medium",
      environment: "A quiet room",
      mobilityRequired: false,
      reliabilityPriority: "standard",
      budget: "low",
      recommendedMediumId: "copper",
      evaluations: {
        copper: evaluation("recommended"),
        fibre: evaluation("workable-with-trade-offs"),
        wireless: evaluation("unsuitable"),
      },
    },
  ],
} as const;

describe("connection media catalog schema", () => {
  it("accepts a complete catalog", () => {
    expect(() => parseConnectionMediaCatalog(validCatalog)).not.toThrow();
  });

  it("requires the three approved media", () => {
    expect(() => parseConnectionMediaCatalog({ ...validCatalog, media: [] })).toThrow(/three.*media/i);
  });

  it("rejects duplicate medium IDs", () => {
    expect(() => parseConnectionMediaCatalog({ ...validCatalog, media: [...media.slice(0, 2), { ...media[2], id: "copper" }] })).toThrow(/duplicate medium/i);
  });

  it("rejects duplicate scenario IDs", () => {
    expect(() => parseConnectionMediaCatalog({ ...validCatalog, scenarios: [validCatalog.scenarios[0], validCatalog.scenarios[0]] })).toThrow(/duplicate scenario/i);
  });

  it("requires an evaluation for every medium", () => {
    const { wireless: _wireless, ...evaluations } = validCatalog.scenarios[0].evaluations;

    expect(() => parseConnectionMediaCatalog({
      ...validCatalog,
      scenarios: [{ ...validCatalog.scenarios[0], evaluations }],
    })).toThrow(/wireless/i);
  });

  it("requires exactly one recommended choice", () => {
    expect(() => parseConnectionMediaCatalog({
      ...validCatalog,
      scenarios: [{
        ...validCatalog.scenarios[0],
        evaluations: { ...validCatalog.scenarios[0].evaluations, fibre: evaluation("recommended") },
      }],
    })).toThrow(/one recommended/i);
  });

  it("requires the recommended ID to name a recommended evaluation", () => {
    expect(() => parseConnectionMediaCatalog({
      ...validCatalog,
      scenarios: [{ ...validCatalog.scenarios[0], recommendedMediumId: "fibre" }],
    })).toThrow(/recommended.*fibre/i);
  });

  it("rejects an unknown recommended medium ID", () => {
    expect(safeParseConnectionMediaCatalog({
      ...validCatalog,
      scenarios: [{ ...validCatalog.scenarios[0], recommendedMediumId: "satellite" }],
    }).success).toBe(false);
  });

  it("rejects empty decisive requirements", () => {
    expect(safeParseConnectionMediaCatalog({
      ...validCatalog,
      scenarios: [{
        ...validCatalog.scenarios[0],
        evaluations: {
          ...validCatalog.scenarios[0].evaluations,
          copper: { ...validCatalog.scenarios[0].evaluations.copper, decisiveRequirements: [] },
        },
      }],
    }).success).toBe(false);
  });

  it("rejects unapproved outcomes", () => {
    expect(safeParseConnectionMediaCatalog({
      ...validCatalog,
      scenarios: [{
        ...validCatalog.scenarios[0],
        evaluations: {
          ...validCatalog.scenarios[0].evaluations,
          copper: { ...validCatalog.scenarios[0].evaluations.copper, outcome: "maybe" },
        },
      }],
    }).success).toBe(false);
  });
});
