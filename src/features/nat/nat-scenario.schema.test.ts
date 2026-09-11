import { describe, expect, it } from "vitest";

import { natScenarioSchema } from "./nat-scenario.schema";

const tuple = {
  protocol: "tcp" as const,
  sourceIp: "10.0.0.25",
  sourcePort: 51514,
  destinationIp: "198.51.100.20",
  destinationPort: 443,
};

describe("natScenarioSchema", () => {
  it("accepts a synchronized PAT journey", () => {
    const parsed = natScenarioSchema.parse({
      id: "pat-web",
      mode: "pat",
      steps: [{
        id: "outbound",
        from: "client",
        to: "gateway",
        tuple,
        translations: [],
        tableMutations: [],
        explanation: "The private tuple reaches the translation boundary.",
      }],
    });

    expect(parsed.id).toBe("pat-web");
  });

  it("rejects a successful hairpin scenario without DNAT and SNAT", () => {
    expect(() => natScenarioSchema.parse({
      id: "invalid-hairpin",
      mode: "hairpin-success",
      outcome: "success",
      steps: [{
        id: "translated",
        from: "gateway",
        to: "server",
        tuple: { ...tuple, destinationIp: "10.0.0.50" },
        translations: [{ kind: "dnat", field: "destinationIp", before: "203.0.113.10", after: "10.0.0.50" }],
        tableMutations: [],
        explanation: "DNAT only.",
      }],
    })).toThrow(/DNAT and SNAT/);
  });

  it("rejects duplicate step identifiers", () => {
    const step = {
      id: "same-step",
      from: "client",
      to: "gateway",
      tuple,
      translations: [],
      tableMutations: [],
      explanation: "A valid explanation.",
    };

    expect(() => natScenarioSchema.parse({ id: "duplicate", mode: "pat", steps: [step, step] })).toThrow(/step IDs/i);
  });
});
