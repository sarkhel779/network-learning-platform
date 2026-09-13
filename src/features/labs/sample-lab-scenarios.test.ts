import { describe, expect, it } from "vitest";

import { buildLabJourney } from "./sample-lab-scenarios";

describe("sample packet lab journeys", () => {
  it("keeps a local destination on the LAN without visiting the router", () => {
    const steps = buildLabJourney("local");
    expect(steps.map((step) => [step.from, step.to])).toEqual([
      ["pc", "switch"], ["switch", "server"], ["server", "switch"], ["switch", "pc"],
    ]);
    expect(steps.at(-1)?.outcome).toBe("delivered");
  });

  it("uses the gateway for a remote IP and changes Ethernet headers at the router", () => {
    const steps = buildLabJourney("remote");
    expect(steps.map((step) => step.to)).toContain("router");
    const ingress = steps.find((step) => step.to === "router")!;
    const egress = steps.find((step) => step.from === "router" && step.to === "server")!;
    expect(ingress.destinationIp).toBe("198.51.100.20");
    expect(egress.destinationIp).toBe("198.51.100.20");
    expect(ingress.destinationMac).not.toBe(egress.destinationMac);
    expect(steps.at(-1)?.outcome).toBe("delivered");
  });

  it("stops locally when a remote destination has no default gateway", () => {
    const steps = buildLabJourney("no-gateway");
    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({ from: "pc", to: null, outcome: "blocked", destinationIp: "198.51.100.20" });
    expect(steps[0].explanation).toMatch(/no default gateway/i);
  });
});
