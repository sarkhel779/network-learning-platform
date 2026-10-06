import { describe, expect, it } from "vitest";

import { buildLabJourney, layersForHop, quizFor } from "./packet-journey-scenarios";

describe("sample packet lab journeys", () => {
  it("keeps a local destination on the LAN without visiting the router", () => {
    const steps = buildLabJourney("local");
    expect(steps.map((step) => [step.from, step.to])).toEqual([
      ["pc", "switch"], ["switch", "server"], ["server", "switch"], ["switch", "pc"],
    ]);
    expect(steps.at(-1)?.outcome).toBe("delivered");
  });

  it("never changes TTL across a purely local, switch-only path", () => {
    const steps = buildLabJourney("local");
    expect(steps.every((step) => step.ttl === 64)).toBe(true);
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

  it("decrements TTL only at the router hops, not across the switch", () => {
    const steps = buildLabJourney("remote");
    expect(steps[0].ttl).toBe(64);
    expect(steps[1].ttl).toBe(64);
    expect(steps[2].ttl).toBe(63);
    expect(steps[3].ttl).toBe(64);
    expect(steps[4].ttl).toBe(63);
    expect(steps[5].ttl).toBe(63);
  });

  it("stops locally when a remote destination has no default gateway", () => {
    const steps = buildLabJourney("no-gateway");
    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({ from: "pc", to: null, outcome: "blocked", destinationIp: "198.51.100.20", ttl: null });
    expect(steps[0].explanation).toMatch(/no default gateway/i);
  });
});

describe("layersForHop", () => {
  it("marks nothing as changed on the first hop, with no previous hop to compare", () => {
    const steps = buildLabJourney("remote");
    const layers = layersForHop(steps[0], null);
    expect(layers.flatMap((layer) => layer.fields).every((field) => !field.changed)).toBe(true);
  });

  it("flags the Ethernet MACs and TTL as changed at the router hop", () => {
    const steps = buildLabJourney("remote");
    const layers = layersForHop(steps[2], steps[1]);
    const ethernet = layers.find((layer) => layer.id === "ethernet")!;
    const ip = layers.find((layer) => layer.id === "ip")!;
    expect(ethernet.fields.every((field) => field.changed)).toBe(true);
    expect(ip.fields.find((field) => field.label === "TTL")?.changed).toBe(true);
    expect(ip.fields.find((field) => field.label === "Source IP")?.changed).toBe(false);
  });

  it("does not flag TTL as changed across a switch-only hop", () => {
    const steps = buildLabJourney("remote");
    const layers = layersForHop(steps[1], steps[0]);
    expect(layers.find((layer) => layer.id === "ip")!.fields.find((field) => field.label === "TTL")?.changed).toBe(false);
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
