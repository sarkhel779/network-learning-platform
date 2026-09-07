import { describe, expect, it, vi } from "vitest";

vi.mock("./device-layer-scopes.data", () => {
  throw new Error("PUBLIC_GRAPH_REACHED_PROTECTED_DEVICE_SCOPES");
});

import { layerModelsLab } from "./layer-models.data";

describe("layerModelsLab", () => {
  it("does not expose account-only device scope data from the public lab export", () => {
    expect(layerModelsLab).not.toHaveProperty("deviceScopes");
    expect(JSON.stringify(layerModelsLab)).not.toContain(
      "scope depends on its design and enabled features",
    );
  });

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

  it("does not reach the protected device-scope module from the public data import graph", () => {
    expect(layerModelsLab.encapsulationSteps).toHaveLength(9);
  });
});
