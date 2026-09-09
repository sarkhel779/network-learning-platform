import { z } from "zod";
import { parseIpv6 } from "@/features/ipv6/ipv6";

export type AddressFamily = "ipv4" | "ipv6";

const ipv4Parts = (value: string) => {
  const parts = value.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) throw new Error("Invalid IPv4 address");
  return parts.map(Number);
};

export function addressFamilyOf(address: string): AddressFamily {
  try { ipv4Parts(address); return "ipv4"; } catch { parseIpv6(address); return "ipv6"; }
}

export function parsePrefix(prefix: string) {
  const separator = prefix.lastIndexOf("/");
  if (separator < 1) throw new Error("Invalid route prefix");
  const address = prefix.slice(0, separator);
  const lengthText = prefix.slice(separator + 1);
  if (!/^\d{1,3}$/.test(lengthText)) throw new Error("Invalid route prefix");
  const family = addressFamilyOf(address);
  const length = Number(lengthText);
  if (length > (family === "ipv4" ? 32 : 128)) throw new Error("Invalid route prefix");
  return { address, family, length } as const;
}

const routeCandidateSchema = z.object({
  id: z.string().min(1),
  source: z.enum(["connected", "static", "learned", "default"]),
  prefix: z.string().min(1),
  nextHop: z.string().min(1).optional(),
  outgoingInterface: z.string().min(1),
  administrativeDistance: z.number().int().nonnegative(),
  metric: z.number().nonnegative(),
  metricDomain: z.string().min(1).nullable(),
}).superRefine((route, context) => {
  try {
    const prefix = parsePrefix(route.prefix);
    if (route.nextHop && addressFamilyOf(route.nextHop) !== prefix.family) context.addIssue({ code: "custom", message: "Next hop and prefix families must match" });
    if (route.source !== "connected" && !route.nextHop) context.addIssue({ code: "custom", message: "Gateway routes require a next hop" });
  } catch (error) { context.addIssue({ code: "custom", message: error instanceof Error ? error.message : "Invalid route prefix" }); }
});

const scenarioSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), family: z.enum(["ipv4", "ipv6"]),
  destination: z.string().min(1), routes: z.array(routeCandidateSchema).min(1),
  allowEqualCost: z.boolean().default(false), plainLanguageConclusion: z.string().min(1).optional(),
}).superRefine((scenario, context) => {
  try { if (addressFamilyOf(scenario.destination) !== scenario.family) context.addIssue({ code: "custom", message: "Destination family does not match scenario" }); }
  catch { context.addIssue({ code: "custom", message: "Invalid destination address" }); }
  if (new Set(scenario.routes.map(({ id }) => id)).size !== scenario.routes.length) context.addIssue({ code: "custom", message: "Route ids must be unique" });
});

export type RouteCandidate = z.infer<typeof routeCandidateSchema>;
export type RouteDecisionScenario = z.infer<typeof scenarioSchema>;
export function parseRouteDecisionScenario(input: unknown): RouteDecisionScenario { return scenarioSchema.parse(input); }

export function prefixMatches(destination: string, prefixText: string) {
  const prefix = parsePrefix(prefixText);
  if (addressFamilyOf(destination) !== prefix.family) return false;
  if (prefix.family === "ipv4") {
    const number = (value: string) => ipv4Parts(value).reduce((total, part) => ((total << 8) | part) >>> 0, 0);
    const mask = prefix.length === 0 ? 0 : (0xffffffff << (32 - prefix.length)) >>> 0;
    return (number(destination) & mask) === (number(prefix.address) & mask);
  }
  const number = (value: string) => parseIpv6(value).hextets.reduce((total, part) => (total << 16n) | BigInt(part), 0n);
  const shift = BigInt(128 - prefix.length);
  return (number(destination) >> shift) === (number(prefix.address) >> shift);
}
