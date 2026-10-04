import { describe, expect, it } from "vitest";

import { buildLabJourney, quizFor } from "./packet-journey-scenarios";

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

describe("packet forwarding quiz content", () => {
  it("gives each configuration a distinct, answerable prediction", () => {
    for (const configuration of ["local", "remote", "no-gateway"] as const) {
      const quiz = quizFor(configuration);
      expect(quiz.options.some((option) => option.id === quiz.correctId)).toBe(true);
    }
  });

  it("matches the local scenario's forwarding behaviour", () => {
    expect(quizFor("local").correctId).toBe("server");
  });

  it("matches the remote scenario's forwarding behaviour", () => {
    expect(quizFor("remote").correctId).toBe("router");
  });

  it("matches the no-gateway scenario's forwarding behaviour", () => {
    expect(quizFor("no-gateway").correctId).toBe("no-frame");
  });
});
