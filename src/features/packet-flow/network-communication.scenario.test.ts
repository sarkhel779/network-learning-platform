import { describe, expect, it } from "vitest";

import { networkCommunicationScenario } from "./network-communication.scenario";

const fieldsFor = (stepId: string) => {
  const step = networkCommunicationScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const fieldValue = (stepId: string, label: string) =>
  [...fieldsFor(stepId).summaryFields, ...fieldsFor(stepId).detailFields].find((field) => field.label === label);

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

const detailValue = (stepId: string, label: string) =>
  fieldsFor(stepId).detailFields.find((field) => field.label === label)?.value;

describe("network communication scenario", () => {
  it("parses the ARP and ICMP journey with the expected topology", () => {
    expect(networkCommunicationScenario.devices.map((device) => device.label)).toEqual(["PC", "Switch", "Router", "Server"]);
    expect(networkCommunicationScenario.devices.map(({ x, y }) => [x, y])).toEqual([[80, 120], [280, 120], [520, 120], [720, 120]]);
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

  it("keeps frame essentials in the beginner summary and protocol codes in technical details", () => {
    const packetSteps = networkCommunicationScenario.steps.filter((step) => step.packet);
    const expectedMacs: Record<string, [string, string]> = {
      "pc-broadcasts-arp-request": ["00:11:22:33:44:10", "FF:FF:FF:FF:FF:FF"],
      "switch-floods-arp-request": ["00:11:22:33:44:10", "FF:FF:FF:FF:FF:FF"],
      "router-replies-to-arp": ["00:11:22:33:44:01", "00:11:22:33:44:10"],
      "switch-forwards-arp-reply": ["00:11:22:33:44:01", "00:11:22:33:44:10"],
      "pc-sends-icmp-request": ["00:11:22:33:44:10", "00:11:22:33:44:01"],
      "switch-forwards-icmp-request": ["00:11:22:33:44:10", "00:11:22:33:44:01"],
      "router-sends-icmp-request": ["00:11:22:33:55:01", "00:11:22:33:55:20"],
      "server-sends-icmp-reply": ["00:11:22:33:55:20", "00:11:22:33:55:01"],
      "router-sends-icmp-reply": ["00:11:22:33:44:01", "00:11:22:33:44:10"],
      "switch-forwards-icmp-reply": ["00:11:22:33:44:01", "00:11:22:33:44:10"],
    };

    expect(packetSteps).toHaveLength(Object.keys(expectedMacs).length);
    for (const step of packetSteps) {
      const [sourceMac, destinationMac] = expectedMacs[step.id];
      const etherType = step.packet!.label.startsWith("ARP") ? "0x0806" : "0x0800";

      expect(summaryValue(step.id, "Source MAC"), `${step.id} source MAC`).toBe(sourceMac);
      expect(summaryValue(step.id, "Destination MAC"), `${step.id} destination MAC`).toBe(destinationMac);
      expect(summaryValue(step.id, "EtherType"), `${step.id} EtherType`).toBe(etherType);
      expect(summaryValue(step.id, "Protocol"), `${step.id} protocol role`).toBe(step.packet!.label);
      expect(detailValue(step.id, "EtherType"), `${step.id} keeps EtherType out of disclosure`).toBeUndefined();

      if (step.packet!.label === "ARP request") expect(detailValue(step.id, "ARP opcode")).toBe("1 (request)");
      if (step.packet!.label === "ARP reply") expect(detailValue(step.id, "ARP opcode")).toBe("2 (reply)");
      if (step.packet!.label === "ICMP echo request") expect(detailValue(step.id, "ICMP type")).toBe("8 (Echo request)");
      if (step.packet!.label === "ICMP echo reply") expect(detailValue(step.id, "ICMP type")).toBe("0 (Echo reply)");
    }
  });

  it("shows the frame decision for the composed echo request before technical details are expanded", () => {
    expect(fieldsFor("pc-creates-icmp-echo-request").summaryFields).toEqual(expect.arrayContaining([
      { label: "Source MAC", value: "00:11:22:33:44:10" },
      { label: "Destination MAC", value: "00:11:22:33:44:01" },
      { label: "EtherType", value: "0x0800" },
      { label: "Protocol", value: "ICMP echo request" },
      { label: "Destination IP", value: "198.51.100.20" },
    ]));
    expect(detailValue("pc-creates-icmp-echo-request", "ICMP type")).toBe("8 (Echo request)");
  });
});
