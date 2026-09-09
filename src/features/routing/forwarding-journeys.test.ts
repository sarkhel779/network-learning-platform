import { describe, expect, it } from "vitest";
import { forwardingJourneys } from "./forwarding-journeys";

describe("forwardingJourneys", () => {
  it.each(["ipv4-success", "ipv6-success"])("preserves Layer 3 addressing and rewrites Layer 2 at every router in %s", (id) => {
    const journey = forwardingJourneys.find((candidate) => candidate.id === id)!;
    const forwards = journey.steps.filter((step) => step.kind === "forward");
    expect(new Set(journey.steps.map((step) => step.destinationIp))).toEqual(new Set([journey.destination]));
    expect(forwards.map((step) => step.hopLimit)).toEqual([63, 62]);
    expect(new Set(forwards.map((step) => `${step.sourceMac}->${step.destinationMac}`)).size).toBe(forwards.length);
    expect(forwards.every((step) => step.selectedRouteId && step.ingressDevice && step.egressDevice)).toBe(true);
  });

  it("models each exceptional terminal outcome explicitly", () => {
    expect(forwardingJourneys.find(({ id }) => id === "no-route")?.terminal).toMatchObject({ kind: "discarded", reason: "no-route", deviceId: "r1" });
    expect(forwardingJourneys.find(({ id }) => id === "hop-limit-expired")?.terminal).toMatchObject({ kind: "discarded", reason: "hop-limit-expired", deviceId: "r1" });
    expect(forwardingJourneys.find(({ id }) => id === "unresolved-next-hop")?.terminal).toMatchObject({ kind: "preview", reason: "unresolved-next-hop", deviceId: "r1" });
  });

  it("names both interfaces on every link", () => {
    expect(forwardingJourneys.flatMap(({ links }) => links).every((link) => link.fromInterface && link.toInterface)).toBe(true);
  });
});
