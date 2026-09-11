import { describe, expect, it } from "vitest";

import { troubleshootingScenarioSchema } from "./troubleshooting-scenario.schema";

const validScenario = {
  id: "branch-portal",
  title: "Branch portal outage",
  topology: {
    nodes: [
      { id: "client", label: "Branch client", kind: "client" },
      { id: "switch", label: "Access switch", kind: "switch" },
    ],
    links: [{ id: "client-switch", from: "client", to: "switch", fromInterface: "eth0", toInterface: "Gi1/0/10" }],
  },
  faults: [
    { id: "wrong-vlan", title: "Wrong access VLAN", explanation: "The access port is in VLAN 30.", unlocksFaultId: "wrong-route" },
    { id: "wrong-route", title: "Wrong route", explanation: "A host route selects the wrong next hop." },
  ],
  hypotheses: [{ id: "vlan-mismatch", label: "VLAN mismatch", faultId: "wrong-vlan", predictions: [{ id: "port-vlan-30", label: "The port reports VLAN 30", supportingTestIds: ["show-switchport"] }] }],
  tests: [{ id: "show-switchport", label: "Show interface switchport", command: "show interfaces Gi1/0/10 switchport", risk: "read-only", timeCost: 2, expectedFaultId: "wrong-vlan", evidence: { kind: "cli", title: "Switchport state", body: "Access Mode VLAN: 30" } }],
  remediations: [{ id: "set-vlan-20", label: "Set access VLAN 20", faultId: "wrong-vlan", requiresTestIds: ["show-switchport"], timeCost: 3 }],
  restorationChecks: [{ id: "verify-vlan", label: "Verify VLAN forwarding", testId: "show-switchport" }],
};

describe("troubleshootingScenarioSchema", () => {
  it("accepts a strictly referenced sequential incident", () => {
    expect(troubleshootingScenarioSchema.parse(validScenario)).toEqual({ ...validScenario, tests: [{ ...validScenario.tests[0], phase: "diagnostic" }] });
  });

  it("rejects unknown and cyclic fault unlock references", () => {
    expect(() => troubleshootingScenarioSchema.parse({ ...validScenario, faults: [{ ...validScenario.faults[0], unlocksFaultId: "missing" }] })).toThrow(/fault reference/i);
    const cyclic = { ...validScenario, faults: [validScenario.faults[0], { ...validScenario.faults[1], unlocksFaultId: "wrong-vlan" }] };
    expect(() => troubleshootingScenarioSchema.parse(cyclic)).toThrow(/cycle/i);
  });

  it("rejects duplicate IDs and broken cross-references", () => {
    expect(() => troubleshootingScenarioSchema.parse({ ...validScenario, topology: { ...validScenario.topology, nodes: [validScenario.topology.nodes[0], validScenario.topology.nodes[0]] } })).toThrow(/duplicate/i);
    expect(() => troubleshootingScenarioSchema.parse({ ...validScenario, topology: { ...validScenario.topology, links: [{ ...validScenario.topology.links[0], to: "missing" }] } })).toThrow(/node reference/i);
    expect(() => troubleshootingScenarioSchema.parse({ ...validScenario, hypotheses: [{ ...validScenario.hypotheses[0], faultId: "missing" }] })).toThrow(/fault reference/i);
    expect(() => troubleshootingScenarioSchema.parse({ ...validScenario, remediations: [{ ...validScenario.remediations[0], requiresTestIds: ["missing"] }] })).toThrow(/test reference/i);
    expect(() => troubleshootingScenarioSchema.parse({ ...validScenario, restorationChecks: [{ ...validScenario.restorationChecks[0], testId: "missing" }] })).toThrow(/test reference/i);
    expect(() => troubleshootingScenarioSchema.parse({ ...validScenario, hypotheses: [{ ...validScenario.hypotheses[0], predictions: [{ ...validScenario.hypotheses[0].predictions[0], supportingTestIds: ["missing"] }] }] })).toThrow(/prediction test reference/i);
  });

  it("rejects unsafe risk labels and non-positive time costs", () => {
    expect(() => troubleshootingScenarioSchema.parse({ ...validScenario, tests: [{ ...validScenario.tests[0], risk: "dangerous" }] })).toThrow();
    expect(() => troubleshootingScenarioSchema.parse({ ...validScenario, tests: [{ ...validScenario.tests[0], timeCost: 0 }] })).toThrow();
  });
});
