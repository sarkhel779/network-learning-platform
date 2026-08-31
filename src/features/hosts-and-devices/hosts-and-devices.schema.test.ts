import { describe, expect, it } from "vitest";

import {
  parseHostsAndDevicesLab,
  safeParseHostsAndDevicesLab,
} from "./hosts-and-devices.schema";

function scenario(id: string, deviceIds = ["client", "server"]) {
  return {
    id,
    title: `${id} title`,
    description: `${id} description`,
    defaultSpeed: 1,
    devices: deviceIds.map((deviceId, index) => ({
      id: deviceId,
      label: deviceId === "client" ? "Client" : "Server",
      role: deviceId === "client" ? "host" : "destination",
      x: index === 0 ? 80 : 720,
      y: 120,
    })),
    links: [{ id: `${deviceIds[0]}-${deviceIds[1]}`, from: deviceIds[0], to: deviceIds[1] }],
    steps: [
      {
        id: `${id}-outbound`,
        title: "Client sends",
        explanation: "The client sends one frame.",
        durationMs: 1000,
        activeDeviceIds: deviceIds,
        activeLinkIds: [`${deviceIds[0]}-${deviceIds[1]}`],
        packet: { kind: "frame", label: "Test frame", from: deviceIds[0], to: deviceIds[1] },
        summaryFields: [{ label: "Direction", value: "Outbound" }],
        detailFields: [],
      },
    ],
  };
}

function profile(deviceId: string) {
  return {
    deviceId,
    name: deviceId === "client" ? "Client" : "Server",
    category: "host",
    summary: "A concise explanation.",
    purpose: "Creates or receives traffic.",
    trafficRole: "Acts as an endpoint.",
    addressing: "Uses MAC and IP addresses.",
    packetBehavior: "Creates or accepts the packet.",
    evidence: "Appears in packet capture fields.",
    commonFailure: "Incorrect addressing prevents delivery.",
    analogy: "Like a sender or receiver of a parcel.",
    technicalDetails: "The network stack processes the payload.",
    journeyNotes: {
      local: "This device participates in the local journey.",
      remote: "This device participates in the remote journey.",
    },
  };
}

const validLab = {
  id: "hosts-and-devices",
  title: "Hosts and devices",
  description: "Compare device roles.",
  journeys: [
    { id: "local", label: "Local journey", shortDescription: "Stay on the LAN.", scenario: scenario("local") },
    { id: "remote", label: "Remote journey", shortDescription: "Use a gateway.", scenario: scenario("remote") },
  ],
  profiles: [profile("client"), profile("server")],
};

describe("hosts and devices lab schema", () => {
  it("accepts a complete lab with shared topology devices", () => {
    const parsed = parseHostsAndDevicesLab(validLab);

    expect(parsed.journeys).toHaveLength(2);
    expect(parsed.profiles.map(({ deviceId }) => deviceId)).toEqual(["client", "server"]);
  });

  it("requires at least two journeys", () => {
    expect(() => parseHostsAndDevicesLab({ ...validLab, journeys: [] })).toThrow(/journey/i);
  });

  it("rejects duplicate journey IDs", () => {
    const journeys = [validLab.journeys[0], { ...validLab.journeys[1], id: "local" }];

    expect(() => parseHostsAndDevicesLab({ ...validLab, journeys })).toThrow(/duplicate journey/i);
  });

  it("requires exactly one profile for every topology device", () => {
    expect(() => parseHostsAndDevicesLab({ ...validLab, profiles: [profile("client")] })).toThrow(
      /profile.*server/i,
    );
  });

  it("requires every journey to use the same device IDs", () => {
    const journeys = [
      validLab.journeys[0],
      { ...validLab.journeys[1], scenario: scenario("remote", ["client", "gateway"]) },
    ];

    expect(() => parseHostsAndDevicesLab({ ...validLab, journeys })).toThrow(/same topology devices/i);
  });

  it("rejects an invalid embedded packet-flow scenario", () => {
    const journeys = [
      validLab.journeys[0],
      { ...validLab.journeys[1], scenario: { ...validLab.journeys[1].scenario, steps: [] } },
    ];

    expect(safeParseHostsAndDevicesLab({ ...validLab, journeys }).success).toBe(false);
  });

  it("rejects journey notes for undeclared journeys", () => {
    const profiles = [
      { ...profile("client"), journeyNotes: { ...profile("client").journeyNotes, missing: "Unknown." } },
      profile("server"),
    ];

    expect(() => parseHostsAndDevicesLab({ ...validLab, profiles })).toThrow(/unknown journey note/i);
  });
});
