import { describe, expect, it } from "vitest";

import { safeParsePacketJourney } from "./packet-journey.schema";

const validJourney = {
  id: "sample",
  accessibleName: "Sample packet journey",
  devices: [
    { id: "source", label: "Source", kind: "host", interfaces: ["Host eth0"] },
    { id: "destination", label: "Destination", kind: "server", interfaces: ["Destination eth0"] },
  ],
  stages: [{
    id: "start",
    title: "Build at source",
    explanation: "The source creates application data.",
    activeDeviceId: "source",
    activeInterfaceId: "Host eth0",
    position: "at-device",
    layers: [{ kind: "application", label: "Application data", fields: [{ label: "Message", value: "Hello" }] }],
  }],
} as const;

describe("packetJourneySchema", () => {
  it("accepts a journey whose stages reference declared devices and interfaces", () => {
    expect(safeParsePacketJourney(validJourney).success).toBe(true);
  });

  it("rejects duplicate stage ids and undeclared device, interface, or link references", () => {
    const malformed = {
      ...validJourney,
      stages: [
        validJourney.stages[0],
        {
          ...validJourney.stages[0],
          activeDeviceId: "router",
          activeInterfaceId: "Router WAN",
          activeLinkId: "not-a-link",
        },
      ],
    };

    const result = safeParsePacketJourney(malformed);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map(({ message }) => message)).toEqual(expect.arrayContaining([
        "Stage identifiers must be unique",
        "Stage device must be declared",
        "Stage interface must belong to its active device",
        "Stage link must use a supported topology link",
      ]));
    }
  });
});
