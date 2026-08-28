import { describe, expect, it } from "vitest";

import { networkCommunicationScenario } from "./network-communication.scenario";

const fieldsFor = (stepId: string) => {
  const step = networkCommunicationScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const fieldValue = (stepId: string, label: string) =>
  [...fieldsFor(stepId).summaryFields, ...fieldsFor(stepId).detailFields].find((field) => field.label === label);

describe("network communication scenario", () => {
  it("parses the ARP and ICMP journey with the expected topology", () => {
    expect(networkCommunicationScenario.devices.map((device) => device.label)).toEqual(["PC", "Switch", "Router", "Server"]);
    expect(networkCommunicationScenario.devices.map((device) => device.x)).toEqual([80, 280, 520, 720]);
    expect(networkCommunicationScenario.links.map((link) => link.id)).toEqual(["pc-switch", "switch-router", "router-server"]);
  });

  it("represents the approved learning stages in order", () => {
    const stageIds = networkCommunicationScenario.steps.map((step) => step.id);
    const expectedStageIds = [
      "pc-determines-server-is-remote",
      "pc-broadcasts-arp-request",
      "switch-floods-arp-request",
      "router-replies-to-arp",
      "pc-records-arp-mapping",
      "pc-creates-icmp-echo-request",
      "switch-forwards-icmp-request",
      "router-routes-icmp-request",
      "server-receives-icmp-request",
      "server-creates-icmp-echo-reply",
      "pc-receives-icmp-echo-reply",
    ];

    let previousIndex = -1;
    for (const stageId of expectedStageIds) {
      const index = stageIds.indexOf(stageId);
      expect(index, `missing stage ${stageId}`).toBeGreaterThan(previousIndex);
      previousIndex = index;
    }

    expect(stageIds.indexOf("pc-broadcasts-arp-request")).toBeLessThan(stageIds.indexOf("router-replies-to-arp"));
    expect(stageIds.indexOf("pc-creates-icmp-echo-request")).toBeLessThan(stageIds.indexOf("server-creates-icmp-echo-reply"));
    expect(networkCommunicationScenario.steps.at(-1)?.stateNote).toContain("Ping succeeds");
  });

  it("keeps IP addresses end-to-end while frames use the correct next-hop MAC addresses", () => {
    expect(fieldValue("pc-sends-icmp-request", "Destination MAC")).toMatchObject({ value: "00:11:22:33:44:01" });
    expect(fieldValue("pc-sends-icmp-request", "Destination IP")).toMatchObject({ value: "198.51.100.20" });
    expect(fieldValue("pc-creates-icmp-echo-request", "TTL")).toMatchObject({ value: "64" });
    expect(fieldValue("pc-sends-icmp-request", "TTL")).toMatchObject({ value: "64" });
    expect(fieldValue("router-routes-icmp-request", "TTL")).toMatchObject({ value: "63", changed: true });
    expect(fieldValue("router-routes-icmp-request", "TTL transition")).toMatchObject({ value: "64 → 63", changed: true });
    expect(fieldValue("router-sends-icmp-request", "Source MAC")).toMatchObject({ value: "00:11:22:33:55:01" });
    expect(fieldValue("router-sends-icmp-request", "Destination MAC")).toMatchObject({ value: "00:11:22:33:55:20" });

    for (const stepId of ["server-sends-icmp-reply", "router-routes-icmp-reply", "router-sends-icmp-reply"]) {
      expect(fieldValue(stepId, "Source IP")).toMatchObject({ value: "198.51.100.20" });
      expect(fieldValue(stepId, "Destination IP")).toMatchObject({ value: "192.0.2.10" });
    }
  });

  it("moves every packet marker across exactly one declared link", () => {
    const links = new Map(networkCommunicationScenario.links.map((link) => [link.id, link]));

    for (const step of networkCommunicationScenario.steps) {
      if (!step.packet) continue;

      expect(step.activeLinkIds).toHaveLength(1);
      const link = links.get(step.activeLinkIds[0]);
      expect(link).toBeDefined();
      expect([link!.from, link!.to]).toContain(step.packet.from);
      expect([link!.from, link!.to]).toContain(step.packet.to);
    }
  });
});
