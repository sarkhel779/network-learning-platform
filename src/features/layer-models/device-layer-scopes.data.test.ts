import { describe, expect, it } from "vitest";

import { deviceLayerScopes } from "./device-layer-scopes.data";

describe("deviceLayerScopes", () => {
  it("describes host, switch, router, and firewall scope without fixed-layer claims", () => {
    expect(deviceLayerScopes.map(({ id }) => id)).toEqual([
      "host",
      "switch",
      "router",
      "firewall",
    ]);
    for (const device of deviceLayerScopes) {
      expect(device.commonlyExamines).toBeTruthy();
      expect(device.explanation).toMatch(/commonly|may|can|depends/i);
    }
  });

  it("keeps firewall defaults focused on common Network, Transport, and optional Application inspection", () => {
    const firewall = deviceLayerScopes.find(({ id }) => id === "firewall");
    expect(firewall).toBeDefined();
    expect(firewall?.osiLayers).toEqual([7, 4, 3]);
    expect(firewall?.tcpIpLayers).toEqual([
      "application",
      "transport",
      "internet",
    ]);
    expect(firewall?.commonlyExamines).toMatch(
      /Network, Transport, and sometimes Application/i,
    );
    expect(firewall?.explanation).toBe(
      "A firewall may examine packet, port, session, and application information; its scope depends on its design and enabled features.",
    );
  });
});
