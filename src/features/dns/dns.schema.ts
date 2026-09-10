import { z } from "zod";

const absoluteNameSchema = z.string().min(2).regex(/^(?:[A-Za-z0-9_-]+\.)+$/, "DNS names must use absolute trailing-dot form.");
const portSchema = z.number().int().min(1).max(65_535);
const roleSchema = z.enum(["application", "stub", "recursive", "root", "tld", "authoritative"]);
const recordTypeSchema = z.enum(["A", "AAAA", "CNAME", "NS", "SOA", "MX", "TXT", "PTR", "SRV", "CAA", "OPT"]);
const rcodeSchema = z.enum(["NOERROR", "NXDOMAIN", "SERVFAIL", "REFUSED", "FORMERR"]);

const dnsQuestionSchema = z.object({ name: absoluteNameSchema, type: recordTypeSchema.exclude(["OPT"]), class: z.literal("IN") });
const dnsRecordSchema = z.object({
  owner: absoluteNameSchema,
  type: recordTypeSchema,
  class: z.literal("IN"),
  ttl: z.number().int().nonnegative(),
  rdLength: z.number().int().nonnegative(),
  data: z.string().min(1),
  purpose: z.string().min(1),
});
const dnsHeaderSchema = z.object({
  id: z.string().min(1), qr: z.boolean(), opcode: z.number().int().min(0).max(15),
  aa: z.boolean(), tc: z.boolean(), rd: z.boolean(), ra: z.boolean(), ad: z.boolean(), cd: z.boolean(),
  rcode: rcodeSchema, qdCount: z.number().int().nonnegative(), anCount: z.number().int().nonnegative(),
  nsCount: z.number().int().nonnegative(), arCount: z.number().int().nonnegative(),
});
const dnsMessageSchema = z.object({
  transport: z.enum(["UDP", "TCP"]), sourcePort: portSchema, destinationPort: portSchema,
  header: dnsHeaderSchema, question: z.array(dnsQuestionSchema), answer: z.array(dnsRecordSchema),
  authority: z.array(dnsRecordSchema), additional: z.array(dnsRecordSchema),
}).superRefine((message, context) => {
  if (!message.header.qr && message.header.aa) context.addIssue({ code: "custom", message: "A DNS query cannot set AA." });
  if (message.header.qdCount !== message.question.length) context.addIssue({ code: "custom", message: "QDCOUNT must match the Question section." });
  if (message.header.anCount !== message.answer.length) context.addIssue({ code: "custom", message: "ANCOUNT must match the Answer section." });
  if (message.header.nsCount !== message.authority.length) context.addIssue({ code: "custom", message: "NSCOUNT must match the Authority section." });
  if (message.header.arCount !== message.additional.length) context.addIssue({ code: "custom", message: "ARCOUNT must match the Additional section." });

  const aliases = new Map(message.answer.filter((record) => record.type === "CNAME").map((record) => [record.owner, record.data]));
  for (const start of aliases.keys()) {
    const visited = new Set<string>();
    let name: string | undefined = start;
    while (name && aliases.has(name)) {
      if (visited.has(name)) {
        context.addIssue({ code: "custom", message: "CNAME cycle detected." });
        break;
      }
      visited.add(name);
      name = aliases.get(name);
    }
  }
});

const cacheEntrySchema = z.object({
  name: absoluteNameSchema, type: recordTypeSchema, originalTtl: z.number().int().nonnegative(),
  remainingTtl: z.number().int().nonnegative(),
}).superRefine((entry, context) => {
  if (entry.remainingTtl > entry.originalTtl) context.addIssue({ code: "custom", message: "Remaining TTL cannot exceed original TTL." });
});
const dnsStepSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), roles: z.object({ sender: roleSchema, receiver: roleSchema }),
  classification: z.enum(["query", "answer", "referral", "negative", "failure"]), message: dnsMessageSchema,
  cache: z.object({ result: z.enum(["miss", "hit", "store", "negative-store", "expired", "unchanged"]), entries: z.array(cacheEntrySchema), explanation: z.string().min(1) }),
  explanation: z.string().min(1), evidence: z.string().min(1), terminal: z.boolean(),
}).superRefine((step, context) => {
  if (step.classification !== "query" && !step.message.header.qr) context.addIssue({ code: "custom", message: "A response step must set QR." });
  if (step.classification === "referral" && (step.message.answer.length > 0 || !step.message.authority.some((record) => record.type === "NS"))) {
    context.addIssue({ code: "custom", message: "A referral requires NS authority data and no final answer." });
  }
  if (step.classification === "negative") {
    if (!step.message.header.qr || !step.message.authority.some((record) => record.type === "SOA")) context.addIssue({ code: "custom", message: "A negative cached response requires authoritative SOA evidence." });
    if (!(["NXDOMAIN", "NOERROR"] as const).includes(step.message.header.rcode as "NXDOMAIN" | "NOERROR")) context.addIssue({ code: "custom", message: "Negative classification requires NXDOMAIN or NOERROR/NODATA." });
  }
});
const dnsScenarioSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), description: z.string().min(1), steps: z.array(dnsStepSchema).min(1), conclusion: z.string().min(1),
}).superRefine((scenario, context) => {
  const ids = scenario.steps.map(({ id }) => id);
  if (new Set(ids).size !== ids.length) context.addIssue({ code: "custom", message: "DNS step ids must be unique." });
  if (scenario.steps.filter(({ terminal }) => terminal).length !== 1) context.addIssue({ code: "custom", message: "A DNS scenario requires exactly one terminal step." });
});

const dnsIncidentSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), access: z.enum(["public", "account"]), evidence: z.array(z.string().min(1)).min(1),
  choices: z.array(z.string().min(1)).min(2), correctIndex: z.number().int().nonnegative(), diagnosis: z.string().min(1),
  explanation: z.string().min(1), responsibleRole: roleSchema, nextStep: z.string().min(1),
}).superRefine((incident, context) => {
  if (incident.correctIndex >= incident.choices.length) context.addIssue({ code: "custom", message: "Correct diagnosis must identify a choice." });
});
const dnsTimingSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), events: z.array(z.object({
    id: z.string().min(1), milliseconds: z.number().int().nonnegative(), title: z.string().min(1), explanation: z.string().min(1), cacheState: z.string().min(1),
  })).min(1),
}).superRefine((timing, context) => {
  const ids = timing.events.map(({ id }) => id);
  if (new Set(ids).size !== ids.length) context.addIssue({ code: "custom", message: "Timing event ids must be unique." });
  if (timing.events.some((event, index) => index > 0 && event.milliseconds < timing.events[index - 1].milliseconds)) context.addIssue({ code: "custom", message: "Timing events must be chronological." });
});
const dnsRfcCheckSchema = z.object({
  id: z.string().min(1), question: z.string().min(1), options: z.array(z.string().min(1)).min(2), correctIndex: z.number().int().nonnegative(),
  rule: z.string().min(1), evidence: z.string().min(1), consequence: z.string().min(1), referenceLabel: z.string().regex(/^RFC \d+$/),
  referenceUrl: z.string().url().startsWith("https://www.rfc-editor.org/"),
}).superRefine((check, context) => {
  if (check.correctIndex >= check.options.length) context.addIssue({ code: "custom", message: "Correct answer index must identify an option." });
});

export type DnsHeader = z.infer<typeof dnsHeaderSchema>;
export type DnsQuestion = z.infer<typeof dnsQuestionSchema>;
export type DnsRecord = z.infer<typeof dnsRecordSchema>;
export type DnsMessage = z.infer<typeof dnsMessageSchema>;
export type DnsStep = z.infer<typeof dnsStepSchema>;
export type DnsScenario = z.infer<typeof dnsScenarioSchema>;
export type DnsIncident = z.infer<typeof dnsIncidentSchema>;
export type DnsTimingScenario = z.infer<typeof dnsTimingSchema>;
export type DnsRfcCheck = z.infer<typeof dnsRfcCheckSchema>;

export const parseDnsScenario = (input: unknown): DnsScenario => dnsScenarioSchema.parse(input);
export const parseDnsIncident = (input: unknown): DnsIncident => dnsIncidentSchema.parse(input);
export const parseDnsTiming = (input: unknown): DnsTimingScenario => dnsTimingSchema.parse(input);
export const parseDnsRfcCheck = (input: unknown): DnsRfcCheck => dnsRfcCheckSchema.parse(input);
