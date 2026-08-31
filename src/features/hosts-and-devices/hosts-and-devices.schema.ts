import { z } from "zod";

import {
  safeParsePacketFlowScenario,
  type PacketFlowScenario,
} from "@/features/packet-flow/packet-flow.schema";

const nonEmptyString = z.string().trim().min(1);

const packetFlowScenarioSchema = z.custom<PacketFlowScenario>(
  (value) => safeParsePacketFlowScenario(value).success,
  { message: "Invalid packet-flow scenario" },
);

const deviceProfileSchema = z.object({
  deviceId: nonEmptyString,
  name: nonEmptyString,
  category: z.enum(["host", "intermediary", "security-boundary"]),
  summary: nonEmptyString,
  purpose: nonEmptyString,
  trafficRole: nonEmptyString,
  addressing: nonEmptyString,
  packetBehavior: nonEmptyString,
  evidence: nonEmptyString,
  commonFailure: nonEmptyString,
  analogy: nonEmptyString,
  technicalDetails: nonEmptyString,
  journeyNotes: z.record(nonEmptyString, nonEmptyString),
}).readonly();

const journeyChoiceSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  shortDescription: nonEmptyString,
  scenario: packetFlowScenarioSchema,
}).readonly();

const hostsAndDevicesLabSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  description: nonEmptyString,
  journeys: z.array(journeyChoiceSchema).min(2, "At least two journeys are required"),
  profiles: z.array(deviceProfileSchema).min(1),
}).superRefine(({ journeys, profiles }, context) => {
  const journeyIds = new Set<string>();
  journeys.forEach((journey, index) => {
    if (journeyIds.has(journey.id)) {
      context.addIssue({
        code: "custom",
        message: `Duplicate journey ID: ${journey.id}`,
        path: ["journeys", index, "id"],
      });
    }
    journeyIds.add(journey.id);
  });

  const expectedDeviceIds = journeys[0]?.scenario.devices
    .map(({ id }) => id)
    .sort() ?? [];
  journeys.slice(1).forEach((journey, index) => {
    const deviceIds = journey.scenario.devices.map(({ id }) => id).sort();
    if (deviceIds.join("\u0000") !== expectedDeviceIds.join("\u0000")) {
      context.addIssue({
        code: "custom",
        message: "Every journey must use the same topology devices",
        path: ["journeys", index + 1, "scenario", "devices"],
      });
    }
  });

  const profilesByDevice = new Map<string, number>();
  profiles.forEach((profile, index) => {
    if (profilesByDevice.has(profile.deviceId)) {
      context.addIssue({
        code: "custom",
        message: `Duplicate profile for device ${profile.deviceId}`,
        path: ["profiles", index, "deviceId"],
      });
    }
    profilesByDevice.set(profile.deviceId, index);

    for (const noteId of Object.keys(profile.journeyNotes)) {
      if (!journeyIds.has(noteId)) {
        context.addIssue({
          code: "custom",
          message: `Unknown journey note: ${noteId}`,
          path: ["profiles", index, "journeyNotes", noteId],
        });
      }
    }

    for (const journeyId of journeyIds) {
      if (!(journeyId in profile.journeyNotes)) {
        context.addIssue({
          code: "custom",
          message: `Missing journey note ${journeyId} for profile ${profile.deviceId}`,
          path: ["profiles", index, "journeyNotes"],
        });
      }
    }
  });

  for (const deviceId of expectedDeviceIds) {
    if (!profilesByDevice.has(deviceId)) {
      context.addIssue({
        code: "custom",
        message: `Missing profile for topology device ${deviceId}`,
        path: ["profiles"],
      });
    }
  }

  profiles.forEach((profile, index) => {
    if (!expectedDeviceIds.includes(profile.deviceId)) {
      context.addIssue({
        code: "custom",
        message: `Profile references unknown topology device ${profile.deviceId}`,
        path: ["profiles", index, "deviceId"],
      });
    }
  });
}).readonly();

export type DeviceProfile = z.infer<typeof deviceProfileSchema>;
export type JourneyChoice = z.infer<typeof journeyChoiceSchema>;
export type HostsAndDevicesLab = z.infer<typeof hostsAndDevicesLabSchema>;

export function parseHostsAndDevicesLab(input: unknown): HostsAndDevicesLab {
  return hostsAndDevicesLabSchema.parse(input);
}

export function safeParseHostsAndDevicesLab(input: unknown) {
  return hostsAndDevicesLabSchema.safeParse(input);
}
