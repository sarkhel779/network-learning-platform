import { describe, expect, it } from "vitest";

import { hostsAndDevicesLab } from "./hosts-and-devices.data";

function fieldValue(
  step: (typeof hostsAndDevicesLab.journeys)[number]["scenario"]["steps"][number],
  label: string,
) {
  return [...step.summaryFields, ...step.detailFields].find((field) => field.label === label)?.value;
}

describe("hosts and devices lesson data", () => {
  it("offers the four approved journeys in order", () => {
    expect(hostsAndDevicesLab.journeys.map(({ id }) => id)).toEqual([
      "wired-local",
      "wireless-local",
      "wired-remote",
      "wireless-remote",
    ]);
  });

  it("provides one descriptive profile for every topology device", () => {
    expect(hostsAndDevicesLab.profiles.map(({ deviceId }) => deviceId)).toEqual([
      "wired-pc",
      "wireless-laptop",
      "access-point",
      "switch",
      "gateway",
      "firewall",
      "local-server",
      "remote-server",
    ]);

    for (const profile of hostsAndDevicesLab.profiles) {
      expect(profile.summary.length).toBeGreaterThan(20);
      expect(profile.technicalDetails.length).toBeGreaterThan(20);
      expect(Object.keys(profile.journeyNotes)).toEqual([
        "wired-local",
        "wireless-local",
        "wired-remote",
        "wireless-remote",
      ]);
    }
  });

  it.each(hostsAndDevicesLab.journeys)("includes outbound and return phases in $id", ({ scenario }) => {
    expect(scenario.steps.some(({ id }) => id.includes("outbound"))).toBe(true);
    expect(scenario.steps.some(({ id }) => id.includes("return"))).toBe(true);
  });

  it.each([
    ["wired-local", "192.168.10.50", "02:00:00:00:10:50"],
    ["wireless-local", "192.168.10.50", "02:00:00:00:10:50"],
    ["wired-remote", "203.0.113.50", "02:00:00:00:10:01"],
    ["wireless-remote", "203.0.113.50", "02:00:00:00:10:01"],
  ])("uses the correct first-hop addressing in %s", (journeyId, destinationIp, destinationMac) => {
    const journey = hostsAndDevicesLab.journeys.find(({ id }) => id === journeyId);
    const firstRequestStep = journey?.scenario.steps.find(
      (step) => fieldValue(step, "Protocol") === "ICMP echo request",
    );

    expect(firstRequestStep).toBeDefined();
    expect(fieldValue(firstRequestStep!, "Destination IP")).toBe(destinationIp);
    expect(fieldValue(firstRequestStep!, "Destination MAC")).toBe(destinationMac);
  });

  it("keeps routed links out of local journeys and includes them in remote journeys", () => {
    for (const journey of hostsAndDevicesLab.journeys) {
      const activeLinks = journey.scenario.steps.flatMap(({ activeLinkIds }) => activeLinkIds);

      if (journey.id.endsWith("local")) {
        expect(activeLinks).not.toContain("gateway-firewall");
        expect(activeLinks).not.toContain("firewall-remote");
      } else {
        expect(activeLinks).toContain("gateway-firewall");
        expect(activeLinks).toContain("firewall-remote");
      }
    }
  });
});
