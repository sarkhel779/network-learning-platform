import { describe, expect, it } from "vitest";

import {
  safeParseSwitchingCatalog,
  type SwitchingCatalogInput,
} from "./switching.schema";

function validCatalog(): SwitchingCatalogInput {
  return {
    comparison: [
      {
        id: "switch",
        name: "Switch",
        summary: "Learns source locations and selects an egress action.",
        dimensions: {
          "signal-handling": { label: "Signal handling", behavior: "learn", explanation: "Reads an Ethernet frame." },
          "collision-scope": { label: "Collision scope", behavior: "segment", explanation: "Each port is a separate collision domain." },
          "bandwidth-sharing": { label: "Bandwidth sharing", behavior: "forward", explanation: "Each link has dedicated capacity." },
          "address-awareness": { label: "Address awareness", behavior: "learn", explanation: "Learns source MAC addresses." },
          "delivery-scope": { label: "Delivery scope", behavior: "filter", explanation: "Selects eligible egress ports." },
        },
      },
    ],
    scenarios: [
      {
        id: "known-destination",
        difficulty: "foundational",
        title: "Known destination",
        ports: [
          { id: "p1", label: "Port 1", eligible: true },
          { id: "p2", label: "Port 2", eligible: true },
          { id: "p3", label: "Port 3", eligible: true },
        ],
        initialTable: [{ mac: "02:00:00:00:00:02", portId: "p2" }],
        ingressPortId: "p1",
        sourceMac: "02:00:00:00:00:01",
        destinationMac: "02:00:00:00:00:02",
        destinationType: "unicast",
        eligibleEgressPortIds: ["p2", "p3"],
        expectedDecision: "known-unicast",
        expectedEgressPortIds: ["p2"],
        expectedLearnedEntry: { mac: "02:00:00:00:00:01", portId: "p1" },
        explanation: "Learn the source on port 1 and forward the known destination to port 2.",
        wrongAnswerExplanations: {
          "known-unicast": "Check the selected egress port.",
          filter: "The destination is not on the ingress port.",
          "unknown-unicast-flood": "The destination is already learned.",
          "broadcast-flood": "The destination is unicast.",
        },
        evidenceNotes: ["The destination entry maps to port 2."],
      },
    ],
  };
}

describe("switching catalog schema", () => {
  it("accepts a complete, internally consistent switching catalog", () => {
    const result = safeParseSwitchingCatalog(validCatalog());
    expect(result.success).toBe(true);
  });

  it("rejects malformed MAC address notation", () => {
    const catalog = validCatalog();
    catalog.scenarios[0].sourceMac = "02-00-00-00-00-01";
    expect(safeParseSwitchingCatalog(catalog).success).toBe(false);
  });

  it("rejects duplicate scenario and port identifiers", () => {
    const duplicateScenario = validCatalog();
    duplicateScenario.scenarios.push({ ...duplicateScenario.scenarios[0] });
    expect(safeParseSwitchingCatalog(duplicateScenario).success).toBe(false);

    const duplicatePort = validCatalog();
    duplicatePort.scenarios[0].ports.push({ id: "p1", label: "Duplicate", eligible: true });
    expect(safeParseSwitchingCatalog(duplicatePort).success).toBe(false);
  });

  it("rejects unknown ingress, egress, and forwarding-table port references", () => {
    for (const mutate of [
      (catalog: SwitchingCatalogInput) => { catalog.scenarios[0].ingressPortId = "p9"; },
      (catalog: SwitchingCatalogInput) => { catalog.scenarios[0].eligibleEgressPortIds = ["p9"]; },
      (catalog: SwitchingCatalogInput) => { catalog.scenarios[0].initialTable[0].portId = "p9"; },
    ]) {
      const catalog = validCatalog();
      mutate(catalog);
      expect(safeParseSwitchingCatalog(catalog).success).toBe(false);
    }
  });

  it("rejects ingress as eligible egress and duplicate forwarding MAC entries", () => {
    const ingressEgress = validCatalog();
    ingressEgress.scenarios[0].eligibleEgressPortIds = ["p1", "p2"];
    expect(safeParseSwitchingCatalog(ingressEgress).success).toBe(false);

    const duplicateMac = validCatalog();
    duplicateMac.scenarios[0].initialTable.push({ mac: "02:00:00:00:00:02", portId: "p3" });
    expect(safeParseSwitchingCatalog(duplicateMac).success).toBe(false);
  });

  it("requires eligible egress identifiers to match eligible non-ingress ports", () => {
    const omittedEligiblePort = validCatalog();
    omittedEligiblePort.scenarios[0].eligibleEgressPortIds = ["p2"];
    expect(safeParseSwitchingCatalog(omittedEligiblePort).success).toBe(false);

    const ineligiblePort = validCatalog();
    ineligiblePort.scenarios[0].ports[2].eligible = false;
    expect(safeParseSwitchingCatalog(ineligiblePort).success).toBe(false);
  });

  it("requires the Ethernet broadcast address for a broadcast destination", () => {
    const catalog = validCatalog();
    Object.assign(catalog.scenarios[0], {
      destinationType: "broadcast",
      expectedDecision: "broadcast-flood",
      expectedEgressPortIds: ["p2", "p3"],
    });
    expect(safeParseSwitchingCatalog(catalog).success).toBe(false);
  });

  it("rejects known-unicast and filtering outcomes inconsistent with the table", () => {
    const missingKnownEntry = validCatalog();
    missingKnownEntry.scenarios[0].initialTable = [];
    expect(safeParseSwitchingCatalog(missingKnownEntry).success).toBe(false);

    const wrongFilterPort = validCatalog();
    wrongFilterPort.scenarios[0].expectedDecision = "filter";
    wrongFilterPort.scenarios[0].expectedEgressPortIds = [];
    expect(safeParseSwitchingCatalog(wrongFilterPort).success).toBe(false);
  });

  it("requires flood outcomes to contain every eligible egress port", () => {
    const catalog = validCatalog();
    catalog.scenarios[0].initialTable = [];
    catalog.scenarios[0].expectedDecision = "unknown-unicast-flood";
    catalog.scenarios[0].expectedEgressPortIds = ["p2"];
    expect(safeParseSwitchingCatalog(catalog).success).toBe(false);
  });
});
