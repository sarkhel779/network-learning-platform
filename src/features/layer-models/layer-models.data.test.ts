import { describe, expect, it } from "vitest";

import { layerModelsLab } from "./layer-models.data";

describe("layerModelsLab", () => {
  it("defines the canonical OSI and TCP/IP layer order", () => {
    expect(layerModelsLab.osiLayers.map(({ number }) => number)).toEqual([7, 6, 5, 4, 3, 2, 1]);
    expect(layerModelsLab.tcpIpLayers.map(({ id }) => id)).toEqual([
      "application",
      "transport",
      "internet",
      "network-access",
    ]);
  });

  it("maps every OSI layer to the canonical TCP/IP layer", () => {
    expect(layerModelsLab.mapping.map(({ tcpIpLayer, osiLayers }) => [tcpIpLayer, osiLayers])).toEqual([
      ["application", [7, 6, 5]],
      ["transport", [4]],
      ["internet", [3]],
      ["network-access", [2, 1]],
    ]);
  });

  it("models the canonical nine-step browser-request PDU journey", () => {
    expect(layerModelsLab.encapsulationSteps.map(({ pdu }) => pdu)).toEqual([
      "Data",
      "Segment",
      "Packet",
      "Frame",
      "Bits",
      "Frame",
      "Packet",
      "Segment",
      "Data",
    ]);
    expect(layerModelsLab.encapsulationSteps.map(({ direction }) => direction)).toEqual([
      "encapsulation",
      "encapsulation",
      "encapsulation",
      "encapsulation",
      "transmission",
      "decapsulation",
      "decapsulation",
      "decapsulation",
      "decapsulation",
    ]);
  });

  it("describes host, switch, router, and firewall scope without fixed-layer claims", () => {
    expect(layerModelsLab.deviceScopes.map(({ id }) => id)).toEqual(["host", "switch", "router", "firewall"]);
    for (const device of layerModelsLab.deviceScopes) {
      expect(device.commonlyExamines).toBeTruthy();
      expect(device.explanation).toMatch(/commonly|may|can|depends/i);
    }
  });
});
