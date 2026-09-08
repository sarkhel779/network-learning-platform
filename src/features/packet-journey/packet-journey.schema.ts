import { z } from "zod";

import { PACKET_JOURNEY_LINK_IDS, type PacketJourney } from "./packet-journey.types";

const fieldSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  changed: z.boolean().optional(),
});

const layerSchema = z.object({
  kind: z.enum(["application", "ip", "ethernet"]),
  label: z.string().min(1),
  fields: z.array(fieldSchema).min(1),
});

const deviceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(["host", "hub", "bridge", "switch", "router", "server"]),
  interfaces: z.array(z.string().min(1)),
});

const stageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  explanation: z.string().min(1),
  technicalDetail: z.string().min(1).optional(),
  activeDeviceId: z.string().min(1),
  activeInterfaceId: z.string().min(1).optional(),
  activeLinkId: z.string().min(1).optional(),
  position: z.enum(["at-device", "on-link", "at-boundary"]),
  layers: z.array(layerSchema).min(1),
});

export const packetJourneySchema = z.object({
  id: z.string().min(1),
  accessibleName: z.string().min(1),
  devices: z.array(deviceSchema).min(1),
  stages: z.array(stageSchema).min(1),
}).superRefine((journey, context) => {
  const deviceIds = journey.devices.map(({ id }) => id);
  const stageIds = journey.stages.map(({ id }) => id);

  if (new Set(deviceIds).size !== deviceIds.length) {
    context.addIssue({ code: "custom", path: ["devices"], message: "Device identifiers must be unique" });
  }
  if (new Set(stageIds).size !== stageIds.length) {
    context.addIssue({ code: "custom", path: ["stages"], message: "Stage identifiers must be unique" });
  }

  journey.stages.forEach((stage, index) => {
    const device = journey.devices.find(({ id }) => id === stage.activeDeviceId);
    if (!device) {
      context.addIssue({ code: "custom", path: ["stages", index, "activeDeviceId"], message: "Stage device must be declared" });
    }
    if (stage.activeInterfaceId && !device?.interfaces.includes(stage.activeInterfaceId)) {
      context.addIssue({ code: "custom", path: ["stages", index, "activeInterfaceId"], message: "Stage interface must belong to its active device" });
    }
    if (stage.activeLinkId && !(PACKET_JOURNEY_LINK_IDS as readonly string[]).includes(stage.activeLinkId)) {
      context.addIssue({ code: "custom", path: ["stages", index, "activeLinkId"], message: "Stage link must use a supported topology link" });
    }
  });
});

export function parsePacketJourney(input: unknown): PacketJourney {
  return packetJourneySchema.parse(input) as PacketJourney;
}

export function safeParsePacketJourney(input: unknown) {
  return packetJourneySchema.safeParse(input);
}
