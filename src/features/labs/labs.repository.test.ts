import { describe, expect, it } from "vitest";

import { getLabScenario, getLabTopic, listLabTopics } from "./labs.repository";

describe("labs repository", () => {
  it("lists every topic with at least one scenario", () => {
    const topics = listLabTopics();
    expect(topics.length).toBeGreaterThan(0);
    for (const topic of topics) expect(topic.scenarios.length).toBeGreaterThan(0);
  });

  it("finds a topic by slug", () => {
    expect(getLabTopic("packet-forwarding").title).toBe("Packet Forwarding");
  });

  it("throws for an unknown topic", () => {
    expect(() => getLabTopic("does-not-exist")).toThrow("LAB_TOPIC_NOT_FOUND");
  });

  it("finds a scenario within a topic", () => {
    expect(getLabScenario("packet-forwarding", "local-delivery").title).toBe("Local delivery on one LAN");
  });

  it("throws for an unknown scenario", () => {
    expect(() => getLabScenario("packet-forwarding", "does-not-exist")).toThrow("LAB_SCENARIO_NOT_FOUND");
  });
});
