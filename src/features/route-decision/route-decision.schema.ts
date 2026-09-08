import { z } from "zod";

const ipv4Schema = z.string().refine((value) => {
  const parts = value.split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}, "Invalid IPv4 address");

const prefixLengthSchema = z.number().int().min(0).max(32);
const macAddressSchema = z.string().regex(/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i);

export const routeEntrySchema = z.object({
  id: z.string().min(1),
  destination: ipv4Schema,
  prefixLength: prefixLengthSchema,
  nextHop: ipv4Schema.optional(),
  interfaceId: z.string().min(1),
  kind: z.enum(["connected", "static", "default"]),
});

const networkInterfaceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  ip: ipv4Schema,
  prefixLength: prefixLengthSchema,
  mac: macAddressSchema,
});

export const routeDecisionOutcomeSchema = z.object({
  scope: z.enum(["on-link", "remote-via-gateway", "no-route", "local-broadcast"]),
  routeId: z.string().min(1).optional(),
  interfaceId: z.string().min(1).optional(),
  nextHopIp: ipv4Schema.optional(),
  firstHopRecipient: z.enum(["destination", "gateway", "local-broadcast", "none"]),
  boundaryAction: z.enum(["direct-delivery", "route-unicast", "stop-broadcast", "host-routing-failure", "router-no-route"]),
});

const scenarioShape = z.object({
  id: z.string().min(1),
  difficulty: z.enum(["foundational", "intermediate"]),
  title: z.string().min(1),
  sourceIp: ipv4Schema,
  sourcePrefixLength: prefixLengthSchema,
  destinationIp: ipv4Schema,
  interfaces: z.array(networkInterfaceSchema).min(1),
  routes: z.array(routeEntrySchema).min(1),
  destinationMac: macAddressSchema.optional(),
  nextHopMac: macAddressSchema.optional(),
  destinationKind: z.enum(["unicast", "local-broadcast"]),
  expected: routeDecisionOutcomeSchema,
  plainExplanation: z.string().min(1),
  technicalExplanation: z.string().min(1),
  wrongAnswerExplanations: z.object({
    scope: z.string().min(1), interface: z.string().min(1), nextHop: z.string().min(1), boundary: z.string().min(1),
  }),
});

function toInteger(ip: string) {
  return ip.split(".").reduce((result, octet) => (result * 256) + Number(octet), 0) >>> 0;
}

function isOnLink(ip: string, interfaceIp: string, prefixLength: number) {
  if (prefixLength === 0) return true;
  const mask = (0xffffffff << (32 - prefixLength)) >>> 0;
  return (toInteger(ip) & mask) === (toInteger(interfaceIp) & mask);
}

export const routeDecisionScenarioSchema = scenarioShape.superRefine((scenario, context) => {
  const interfaceIds = scenario.interfaces.map(({ id }) => id);
  const routeIds = scenario.routes.map(({ id }) => id);

  if (new Set(interfaceIds).size !== interfaceIds.length) {
    context.addIssue({ code: "custom", path: ["interfaces"], message: "Interface identifiers must be unique" });
  }
  if (new Set(routeIds).size !== routeIds.length) {
    context.addIssue({ code: "custom", path: ["routes"], message: "Route identifiers must be unique" });
  }

  const routeKeys = scenario.routes.map(({ destination, prefixLength }) => `${destination}/${prefixLength}`);
  if (new Set(routeKeys).size !== routeKeys.length) {
    context.addIssue({ code: "custom", path: ["routes"], message: "Routes cannot create ambiguous equal-prefix matches" });
  }

  for (const [index, route] of scenario.routes.entries()) {
    const networkInterface = scenario.interfaces.find(({ id }) => id === route.interfaceId);
    if (!networkInterface) {
      context.addIssue({ code: "custom", path: ["routes", index, "interfaceId"], message: "Route must reference an existing interface" });
      continue;
    }
    if (route.kind === "connected" && route.nextHop) {
      context.addIssue({ code: "custom", path: ["routes", index, "nextHop"], message: "Connected routes cannot have a next hop" });
    }
    if (route.kind === "default" && (route.destination !== "0.0.0.0" || route.prefixLength !== 0 || !route.nextHop)) {
      context.addIssue({ code: "custom", path: ["routes", index], message: "A default route must be 0.0.0.0/0 with a next hop" });
    }
    if (route.nextHop && !isOnLink(route.nextHop, networkInterface.ip, networkInterface.prefixLength)) {
      context.addIssue({ code: "custom", path: ["routes", index, "nextHop"], message: "Next hop must be reachable on the selected interface" });
    }
  }

  if (scenario.expected.routeId && !routeIds.includes(scenario.expected.routeId)) {
    context.addIssue({ code: "custom", path: ["expected", "routeId"], message: "Expected route must exist" });
  }
  if (scenario.expected.interfaceId && !interfaceIds.includes(scenario.expected.interfaceId)) {
    context.addIssue({ code: "custom", path: ["expected", "interfaceId"], message: "Expected interface must exist" });
  }

  if (scenario.destinationKind === "local-broadcast") {
    if (scenario.expected.scope !== "local-broadcast" || scenario.expected.firstHopRecipient !== "local-broadcast"
      || scenario.expected.boundaryAction !== "stop-broadcast" || scenario.expected.routeId || scenario.expected.nextHopIp) {
      context.addIssue({ code: "custom", path: ["expected"], message: "Local broadcasts must stop at the router boundary" });
    }
  } else if (scenario.expected.scope === "remote-via-gateway") {
    const route = scenario.routes.find(({ id }) => id === scenario.expected.routeId);
    if (!route?.nextHop || scenario.expected.nextHopIp !== route.nextHop || scenario.expected.interfaceId !== route.interfaceId
      || scenario.expected.firstHopRecipient !== "gateway" || scenario.expected.boundaryAction !== "route-unicast") {
      context.addIssue({ code: "custom", path: ["expected"], message: "Remote delivery must consistently identify its route, interface, and gateway" });
    }
  }
});

export const routeDecisionCatalogSchema = z.array(routeDecisionScenarioSchema).min(1).superRefine((scenarios, context) => {
  const ids = scenarios.map(({ id }) => id);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: "custom", message: "Scenario identifiers must be unique" });
  }
});

export type RouteEntry = z.infer<typeof routeEntrySchema>;
export type RouteDecisionOutcome = z.infer<typeof routeDecisionOutcomeSchema>;
export type RouteDecisionScenario = z.infer<typeof routeDecisionScenarioSchema>;
export type RouteDecisionScenarioInput = z.input<typeof routeDecisionScenarioSchema>;
export type LearnerRoutePrediction = Readonly<Pick<RouteDecisionOutcome, "scope" | "interfaceId" | "nextHopIp" | "boundaryAction">>;

export function parseRouteDecisionCatalog(input: unknown): RouteDecisionScenario[] {
  return routeDecisionCatalogSchema.parse(input);
}

export function safeParseRouteDecisionCatalog(input: unknown) {
  return routeDecisionCatalogSchema.safeParse(input);
}
