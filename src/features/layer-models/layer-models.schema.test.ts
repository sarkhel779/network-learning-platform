import { describe, expect, it } from "vitest";

import {
  parseDeviceLayerScopes,
  parseLayerModelsLab,
} from "./layer-models.schema";

const validLab = {
  osiLayers: [
    { number: 7, name: "Application", summary: "User-facing network services", examples: ["HTTP"] },
    { number: 6, name: "Presentation", summary: "Data representation", examples: ["TLS"] },
    { number: 5, name: "Session", summary: "Conversation coordination", examples: ["Sessions"] },
    { number: 4, name: "Transport", summary: "End-to-end delivery", examples: ["TCP"] },
    { number: 3, name: "Network", summary: "Path selection", examples: ["IPv4"] },
    { number: 2, name: "Data Link", summary: "Local delivery", examples: ["Ethernet"] },
    { number: 1, name: "Physical", summary: "Signals and media", examples: ["Bits"] },
  ],
  tcpIpLayers: [
    { id: "application", name: "Application", summary: "Application services", examples: ["HTTP"] },
    { id: "transport", name: "Transport", summary: "Process delivery", examples: ["TCP"] },
    { id: "internet", name: "Internet", summary: "Internetwork delivery", examples: ["IPv4"] },
    { id: "network-access", name: "Network Access", summary: "Local link delivery", examples: ["Ethernet"] },
  ],
  mapping: [
    { tcpIpLayer: "application", osiLayers: [7, 6, 5], explanation: "Application concerns" },
    { tcpIpLayer: "transport", osiLayers: [4], explanation: "Transport concerns" },
    { tcpIpLayer: "internet", osiLayers: [3], explanation: "Internet concerns" },
    { tcpIpLayer: "network-access", osiLayers: [2, 1], explanation: "Link concerns" },
  ],
  encapsulationSteps: [
    {
      id: "sender-data",
      direction: "encapsulation",
      title: "Create application data",
      plainExplanation: "The browser creates a request.",
      technicalExplanation: "HTTP produces application data.",
      activeOsiLayer: 7,
      activeTcpIpLayer: "application",
      pdu: "Data",
      addedInformation: "HTTP request",
      durationMs: 1000,
    },
  ],
} as const;

const validDeviceScopes = [
  {
    id: "host",
    name: "Host",
    commonlyExamines: "All layers",
    osiLayers: [7, 6, 5, 4, 3, 2, 1],
    tcpIpLayers: ["application", "transport", "internet", "network-access"],
    explanation: "Creates and consumes application data.",
  },
] as const;

describe("parseLayerModelsLab", () => {
  it("accepts a complete public layer model lab", () => {
    expect(parseLayerModelsLab(validLab)).toEqual(validLab);
  });

  it("rejects account-only device scopes from the public layer model", () => {
    expect(() =>
      parseLayerModelsLab({ ...validLab, deviceScopes: validDeviceScopes }),
    ).toThrow(/deviceScopes/i);
  });

  it("accepts device scopes whose references exist in the public layer model", () => {
    expect(parseDeviceLayerScopes(validDeviceScopes, validLab)).toEqual(validDeviceScopes);
  });

  it("requires unique OSI layer numbers in exact descending order", () => {
    const duplicate = { ...validLab, osiLayers: validLab.osiLayers.map((layer, index) => index === 1 ? { ...layer, number: 7 } : layer) };
    expect(() => parseLayerModelsLab(duplicate)).toThrow(/OSI layers.*7, 6, 5, 4, 3, 2, 1/i);

    const ascending = { ...validLab, osiLayers: [...validLab.osiLayers].reverse() };
    expect(() => parseLayerModelsLab(ascending)).toThrow(/OSI layers.*7, 6, 5, 4, 3, 2, 1/i);
  });

  it("requires exactly the four canonical TCP/IP layer IDs", () => {
    expect(() => parseLayerModelsLab({ ...validLab, tcpIpLayers: validLab.tcpIpLayers.slice(0, 3) })).toThrow(/TCP\/IP layers/i);
  });

  it("requires every OSI layer to occur in exactly one mapping entry", () => {
    expect(() => parseLayerModelsLab({ ...validLab, mapping: [] })).toThrow(/coverage/i);

    const duplicatedCoverage = validLab.mapping.map((entry, index) => index === 1 ? { ...entry, osiLayers: [4, 7] } : entry);
    expect(() => parseLayerModelsLab({ ...validLab, mapping: duplicatedCoverage })).toThrow(/exactly one mapping/i);
  });

  it("requires every canonical TCP/IP layer to have exactly one mapping entry", () => {
    const missingMapping = validLab.mapping.filter((entry) => entry.tcpIpLayer !== "internet");
    expect(() => parseLayerModelsLab({ ...validLab, mapping: missingMapping })).toThrow();

    const duplicateMapping = [...validLab.mapping, { ...validLab.mapping[0] }];
    expect(() => parseLayerModelsLab({ ...validLab, mapping: duplicateMapping })).toThrow();
  });

  it("rejects invalid encapsulation layer references and non-positive durations", () => {
    const unknownLayer = [{ ...validLab.encapsulationSteps[0], activeOsiLayer: 8 }];
    expect(() => parseLayerModelsLab({ ...validLab, encapsulationSteps: unknownLayer })).toThrow(/OSI layer reference/i);

    const unknownTcpIpLayer = [{ ...validLab.encapsulationSteps[0], activeTcpIpLayer: "link" }];
    expect(() => parseLayerModelsLab({ ...validLab, encapsulationSteps: unknownTcpIpLayer })).toThrow(/TCP\/IP layer reference/i);

    const invalidDuration = [{ ...validLab.encapsulationSteps[0], durationMs: 0 }];
    expect(() => parseLayerModelsLab({ ...validLab, encapsulationSteps: invalidDuration })).toThrow(/greater than 0/i);
  });

  it("rejects invalid device-scope OSI and TCP/IP layer references", () => {
    const unknownOsiLayer = [{ ...validDeviceScopes[0], osiLayers: [7, 8] }];
    expect(() => parseDeviceLayerScopes(unknownOsiLayer, validLab)).toThrow(/device scope.*invalid OSI layer reference/i);

    const unknownTcpIpLayer = [{ ...validDeviceScopes[0], tcpIpLayers: ["application", "link"] }];
    expect(() => parseDeviceLayerScopes(unknownTcpIpLayer, validLab)).toThrow(/device scope.*invalid TCP\/IP layer reference/i);
  });
});
