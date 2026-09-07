import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { accountConnectionScenarios } from "./connection-media.account.data";
import {
  evaluateConnectionChoice,
  safeEvaluateConnectionChoice,
} from "./evaluate-connection-choice";
import type { ConnectionMediumId } from "./connection-media.schema";

const homeDesktop = accountConnectionScenarios.find((scenario) => scenario.id === "home-desktop");
const campusBuildings = accountConnectionScenarios.find((scenario) => scenario.id === "campus-buildings");

if (!homeDesktop || !campusBuildings) {
  throw new Error("Expected Task 2 connection scenarios are missing");
}

describe("evaluateConnectionChoice", () => {
  it("returns the validated recommended result", () => {
    expect(evaluateConnectionChoice(homeDesktop, "copper")).toMatchObject({
      scenarioId: "home-desktop",
      outcome: "recommended",
      selectedMediumId: "copper",
      recommendedMediumId: "copper",
      explanation: homeDesktop.evaluations.copper.explanation,
    });
  });

  it("returns the validated workable-with-trade-offs result", () => {
    expect(evaluateConnectionChoice(homeDesktop, "wireless")).toMatchObject({
      outcome: "workable-with-trade-offs",
      selectedMediumId: "wireless",
      recommendedMediumId: "copper",
      decisiveRequirements: homeDesktop.evaluations.wireless.decisiveRequirements,
      explanation: homeDesktop.evaluations.wireless.explanation,
    });
  });

  it("returns the validated unsuitable result", () => {
    expect(evaluateConnectionChoice(campusBuildings, "wireless").outcome).toBe("workable-with-trade-offs");
    expect(evaluateConnectionChoice(campusBuildings, "copper")).toMatchObject({
      outcome: "unsuitable",
      selectedMediumId: "copper",
      recommendedMediumId: "fibre",
      decisiveRequirements: campusBuildings.evaluations.copper.decisiveRequirements,
      explanation: campusBuildings.evaluations.copper.explanation,
    });
  });

  it("copies and freezes decisive requirements while preserving the exact explanation", () => {
    const evaluation = homeDesktop.evaluations.copper;
    const result = evaluateConnectionChoice(homeDesktop, "copper");

    expect(result.decisiveRequirements).not.toBe(evaluation.decisiveRequirements);
    expect(result.decisiveRequirements).toEqual(evaluation.decisiveRequirements);
    expect(Object.isFrozen(result.decisiveRequirements)).toBe(true);
    expect(result.explanation).toBe(evaluation.explanation);
  });

  it("does not guess when a medium identifier is unknown", () => {
    const unknownMedium = "unknown" as ConnectionMediumId;

    expect(safeEvaluateConnectionChoice(campusBuildings, unknownMedium)).toBeUndefined();
    expect(() => evaluateConnectionChoice(campusBuildings, unknownMedium)).toThrow(
      /Unknown connection medium identifier: unknown/,
    );
  });
});
