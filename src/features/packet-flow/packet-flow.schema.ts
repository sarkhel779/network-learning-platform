import { z } from "zod";

export const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2] as const;

const nonEmptyString = z.string().min(1);
const fieldSchema = z.object({
  label: nonEmptyString,
  value: nonEmptyString,
  changed: z.boolean().optional(),
}).readonly();

const deviceSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  role: nonEmptyString,
  x: z.number().finite(),
  y: z.number().finite(),
}).readonly();

const linkSchema = z.object({
  id: nonEmptyString,
  from: nonEmptyString,
  to: nonEmptyString,
}).readonly();

const packetSchema = z.object({
  kind: z.enum(["frame", "packet"]),
  label: nonEmptyString,
  from: nonEmptyString,
  to: nonEmptyString,
  broadcast: z.boolean().optional(),
}).readonly();

const stepSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  explanation: nonEmptyString,
  durationMs: z.number().int().positive(),
  activeDeviceIds: z.array(nonEmptyString).readonly(),
  activeLinkIds: z.array(nonEmptyString).readonly(),
  packet: packetSchema.optional(),
  summaryFields: z.array(fieldSchema).readonly(),
  detailFields: z.array(fieldSchema).readonly(),
  stateNote: nonEmptyString.optional(),
}).readonly();

const packetFlowScenarioSchema = z
  .object({
    id: nonEmptyString,
    title: nonEmptyString,
    description: nonEmptyString,
    defaultSpeed: z.union(PLAYBACK_SPEEDS.map((speed) => z.literal(speed))),
    devices: z.array(deviceSchema).readonly(),
    links: z.array(linkSchema).readonly(),
    steps: z.array(stepSchema).min(1).readonly(),
  })
  .superRefine((scenario, context) => {
    const checkDuplicateIds = (items: readonly { id: string }[], path: string) => {
      const seen = new Set<string>();
      for (const [index, item] of items.entries()) {
        if (seen.has(item.id)) {
          context.addIssue({ code: "custom", path: [path, index, "id"], message: `Duplicate ${path.slice(0, -1)} ID` });
        }
        seen.add(item.id);
      }
    };

    checkDuplicateIds(scenario.devices, "devices");
    checkDuplicateIds(scenario.links, "links");
    checkDuplicateIds(scenario.steps, "steps");

    const deviceIds = new Set(scenario.devices.map((device) => device.id));
    const linkIds = new Set(scenario.links.map((link) => link.id));

    scenario.links.forEach((link, index) => {
      if (!deviceIds.has(link.from)) context.addIssue({ code: "custom", path: ["links", index, "from"], message: "Unknown device endpoint" });
      if (!deviceIds.has(link.to)) context.addIssue({ code: "custom", path: ["links", index, "to"], message: "Unknown device endpoint" });
    });

    scenario.steps.forEach((step, stepIndex) => {
      step.activeDeviceIds.forEach((id, idIndex) => {
        if (!deviceIds.has(id)) context.addIssue({ code: "custom", path: ["steps", stepIndex, "activeDeviceIds", idIndex], message: "Unknown active device" });
      });
      step.activeLinkIds.forEach((id, idIndex) => {
        if (!linkIds.has(id)) context.addIssue({ code: "custom", path: ["steps", stepIndex, "activeLinkIds", idIndex], message: "Unknown active link" });
      });
      if (step.packet) {
        const hasMatchingActiveLink = step.activeLinkIds.some((linkId) => {
          const link = scenario.links.find((candidate) => candidate.id === linkId);
          return link !== undefined && ((link.from === step.packet!.from && link.to === step.packet!.to) || (link.from === step.packet!.to && link.to === step.packet!.from));
        });
        if (!hasMatchingActiveLink) context.addIssue({ code: "custom", path: ["steps", stepIndex, "packet"], message: "Packet path must match an active link" });
      }
    });
  })
  .readonly();

export type PacketFlowScenario = z.infer<typeof packetFlowScenarioSchema>;
export type PacketFlowStep = z.infer<typeof stepSchema>;

export function parsePacketFlowScenario(input: unknown): PacketFlowScenario {
  return packetFlowScenarioSchema.parse(input);
}

export function safeParsePacketFlowScenario(input: unknown) {
  return packetFlowScenarioSchema.safeParse(input);
}
