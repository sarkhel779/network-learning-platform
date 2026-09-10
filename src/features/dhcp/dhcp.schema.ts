import { z } from "zod";

const ipv4Schema = z.ipv4();
const portSchema = z.number().int().min(0).max(65_535);
const dhcpMessageTypeSchema = z.enum(["DISCOVER", "OFFER", "REQUEST", "ACK", "NAK", "DECLINE", "RELEASE"]);
const dhcpLegSchema = z.enum(["client-to-server", "server-to-client", "relay-to-server", "server-to-relay"]);
const deliveryModeSchema = z.enum(["broadcast", "unicast", "relay-forwarded", "silence"]);

const dhcpPacketSchema = z.object({
  messageType: dhcpMessageTypeSchema,
  leg: dhcpLegSchema,
  deliveryMode: deliveryModeSchema,
  ethernet: z.object({ source: z.string().min(1), destination: z.string().min(1) }),
  ipv4: z.object({ source: ipv4Schema, destination: ipv4Schema }),
  udp: z.object({ sourcePort: portSchema, destinationPort: portSchema }),
  bootp: z.object({
    op: z.union([z.literal(1), z.literal(2)]),
    htype: z.number().int().nonnegative().max(255),
    hlen: z.number().int().nonnegative().max(255),
    hops: z.number().int().nonnegative().max(255),
    xid: z.string().min(1),
    secs: z.number().int().nonnegative().max(65_535),
    flags: z.number().int().nonnegative().max(65_535),
    ciaddr: ipv4Schema,
    yiaddr: ipv4Schema,
    siaddr: ipv4Schema,
    giaddr: ipv4Schema,
    chaddr: z.string().min(1),
    sname: z.string(),
    file: z.string(),
    magicCookie: z.literal("63:82:53:63"),
  }),
  options: z.array(z.object({
    code: z.number().int().min(0).max(255),
    name: z.string().min(1),
    length: z.number().int().nonnegative().max(255),
    value: z.string().min(1),
    meaning: z.string().min(1),
  })),
}).superRefine((packet, context) => {
  const ports = packet.udp;
  if (packet.leg === "client-to-server" && (ports.sourcePort !== 68 || ports.destinationPort !== 67)) {
    context.addIssue({ code: "custom", message: "Direct client traffic must use UDP 68 to 67." });
  }
  if (packet.leg === "server-to-client" && (ports.sourcePort !== 67 || ports.destinationPort !== 68)) {
    context.addIssue({ code: "custom", message: "Direct server traffic must use UDP 67 to 68." });
  }
  if ((packet.leg === "relay-to-server" || packet.leg === "server-to-relay") && (ports.sourcePort !== 67 || ports.destinationPort !== 67)) {
    context.addIssue({ code: "custom", message: "Relay and server traffic must use UDP 67 to 67." });
  }
  if ((packet.leg === "relay-to-server" || packet.leg === "server-to-relay") && packet.bootp.giaddr === "0.0.0.0") {
    context.addIssue({ code: "custom", message: "Relayed traffic requires a non-zero giaddr." });
  }
  if (packet.messageType === "ACK" && packet.bootp.ciaddr === "0.0.0.0" && packet.bootp.yiaddr === "0.0.0.0") {
    context.addIssue({ code: "custom", message: "An initial-allocation ACK requires yiaddr." });
  }
});

const dhcpStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  explanation: z.string().min(1),
  evidence: z.string().min(1),
  clientState: z.string().min(1),
  serverState: z.string().min(1),
  packet: dhcpPacketSchema,
  terminal: z.boolean(),
});

const dhcpScenarioSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  mode: z.enum(["direct", "relay"]),
  steps: z.array(dhcpStepSchema).min(1),
  conclusion: z.string().min(1),
}).superRefine((scenario, context) => {
  const ids = scenario.steps.map(({ id }) => id);
  if (new Set(ids).size !== ids.length) context.addIssue({ code: "custom", message: "DHCP step ids must be unique." });
  if (new Set(scenario.steps.map(({ packet }) => packet.bootp.xid)).size !== 1) {
    context.addIssue({ code: "custom", message: "All journey packets must retain the transaction identifier." });
  }
  if (scenario.steps.filter(({ terminal }) => terminal).length !== 1) {
    context.addIssue({ code: "custom", message: "A DHCP scenario requires exactly one terminal step." });
  }
});

const leaseTimelineSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  leaseSeconds: z.number().int().positive(),
  t1Seconds: z.number().int().positive(),
  t2Seconds: z.number().int().positive(),
  events: z.array(z.object({
    id: z.string().min(1), seconds: z.number().int().nonnegative(), state: z.string().min(1),
    deliveryMode: deliveryModeSchema, leaseValid: z.boolean(), explanation: z.string().min(1),
  })).min(1),
}).superRefine((timeline, context) => {
  if (timeline.t1Seconds >= timeline.t2Seconds) context.addIssue({ code: "custom", message: "T1 must occur before T2." });
  if (timeline.t2Seconds >= timeline.leaseSeconds) context.addIssue({ code: "custom", message: "T2 must occur before lease expiry." });
});

const rfcCheckSchema = z.object({
  id: z.string().min(1), question: z.string().min(1), options: z.array(z.string().min(1)).min(2),
  correctIndex: z.number().int().nonnegative(), rule: z.string().min(1), evidence: z.string().min(1),
  consequence: z.string().min(1), referenceLabel: z.string().regex(/^RFC \d+$/),
  referenceUrl: z.string().url().startsWith("https://www.rfc-editor.org/"),
}).superRefine((check, context) => {
  if (check.correctIndex >= check.options.length) context.addIssue({ code: "custom", message: "Correct answer index must identify an option." });
});

export type DhcpPacket = z.infer<typeof dhcpPacketSchema>;
export type DhcpStep = z.infer<typeof dhcpStepSchema>;
export type DhcpScenario = z.infer<typeof dhcpScenarioSchema>;
export type LeaseTimeline = z.infer<typeof leaseTimelineSchema>;
export type RfcCheck = z.infer<typeof rfcCheckSchema>;

export const parseDhcpScenario = (input: unknown) => dhcpScenarioSchema.parse(input);
export const parseLeaseTimeline = (input: unknown) => leaseTimelineSchema.parse(input);
export const parseRfcCheck = (input: unknown) => rfcCheckSchema.parse(input);
