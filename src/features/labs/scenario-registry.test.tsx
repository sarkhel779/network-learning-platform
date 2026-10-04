import { describe, expect, it } from "vitest";

import { labTopics } from "./labs.data";
import { getScenarioComponent } from "./scenario-registry";

describe("scenario registry", () => {
  it("has a registered interactive component for every topic's scenario", () => {
    for (const topic of labTopics) {
      for (const scenario of topic.scenarios) {
        expect(getScenarioComponent(topic.slug, scenario.slug), `${topic.slug}/${scenario.slug}`).toBeDefined();
      }
    }
  });

  it("returns undefined for an unregistered scenario", () => {
    expect(getScenarioComponent("does-not-exist", "nope")).toBeUndefined();
  });
});
