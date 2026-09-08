import { z } from "zod";
import {
  ipv4Schema,
  routeDecisionScenarioSchema,
  type LearnerRoutePrediction,
  type RouteDecisionOutcome,
  type RouteDecisionScenario,
} from "./route-decision.schema";

function toInteger(ip: string) {
  return ip.split(".").reduce((result, octet) => (result * 256) + Number(octet), 0) >>> 0;
}

function matchesPrefix(ip: string, network: string, prefixLength: number) {
  if (prefixLength === 0) return true;
  const mask = (0xffffffff << (32 - prefixLength)) >>> 0;
  return (toInteger(ip) & mask) === (toInteger(network) & mask);
}

export type EvaluatedRouteDecision = RouteDecisionOutcome & Readonly<{
  plainExplanation: string;
  technicalExplanation: string;
}>;

export function evaluateRouteDecision(scenario: RouteDecisionScenario): EvaluatedRouteDecision {
  if (scenario.destinationKind === "local-broadcast") {
    return {
      scope: "local-broadcast",
      interfaceId: scenario.expected.interfaceId ?? scenario.interfaces[0].id,
      firstHopRecipient: "local-broadcast",
      boundaryAction: "stop-broadcast",
      plainExplanation: scenario.plainExplanation,
      technicalExplanation: scenario.technicalExplanation,
    };
  }

  const route = scenario.routes
    .filter(({ destination, prefixLength }) => matchesPrefix(scenario.destinationIp, destination, prefixLength))
    .sort((left, right) => right.prefixLength - left.prefixLength)[0];

  if (!route) {
    return {
      scope: "no-route",
      firstHopRecipient: "none",
      boundaryAction: scenario.expected.boundaryAction === "router-no-route" ? "router-no-route" : "host-routing-failure",
      plainExplanation: scenario.plainExplanation,
      technicalExplanation: scenario.technicalExplanation,
    };
  }

  if (route.kind === "connected") {
    return {
      scope: "on-link",
      routeId: route.id,
      interfaceId: route.interfaceId,
      nextHopIp: scenario.destinationIp,
      firstHopRecipient: "destination",
      boundaryAction: "direct-delivery",
      plainExplanation: scenario.plainExplanation,
      technicalExplanation: scenario.technicalExplanation,
    };
  }

  return {
    scope: "remote-via-gateway",
    routeId: route.id,
    interfaceId: route.interfaceId,
    nextHopIp: route.nextHop,
    firstHopRecipient: "gateway",
    boundaryAction: "route-unicast",
    plainExplanation: scenario.plainExplanation,
    technicalExplanation: scenario.technicalExplanation,
  };
}

const learnerRoutePredictionSchema = z.object({
  scope: z.enum(["on-link", "remote-via-gateway", "no-route", "local-broadcast"]),
  interfaceId: z.string().min(1).optional(),
  nextHopIp: ipv4Schema.optional(),
  boundaryAction: z.enum(["direct-delivery", "route-unicast", "stop-broadcast", "host-routing-failure", "router-no-route"]),
});

export function evaluateRoutePrediction(scenario: RouteDecisionScenario, prediction: LearnerRoutePrediction) {
  const outcome = evaluateRouteDecision(scenario);
  const correct = {
    scopeCorrect: prediction.scope === outcome.scope,
    interfaceCorrect: prediction.interfaceId === outcome.interfaceId,
    nextHopCorrect: prediction.nextHopIp === outcome.nextHopIp,
    boundaryCorrect: prediction.boundaryAction === outcome.boundaryAction,
  };
  return {
    ...correct,
    allCorrect: Object.values(correct).every(Boolean),
    outcome,
    feedback: {
      scope: correct.scopeCorrect ? undefined : scenario.wrongAnswerExplanations.scope,
      interface: correct.interfaceCorrect ? undefined : scenario.wrongAnswerExplanations.interface,
      nextHop: correct.nextHopCorrect ? undefined : scenario.wrongAnswerExplanations.nextHop,
      boundary: correct.boundaryCorrect ? undefined : scenario.wrongAnswerExplanations.boundary,
    },
  };
}

export function safeEvaluateRouteDecision(input: unknown) {
  const parsed = routeDecisionScenarioSchema.safeParse(input);
  return parsed.success
    ? { success: true as const, data: evaluateRouteDecision(parsed.data) }
    : { success: false as const, error: parsed.error };
}

export function safeEvaluateRoutePrediction(scenarioInput: unknown, predictionInput: unknown) {
  const scenario = routeDecisionScenarioSchema.safeParse(scenarioInput);
  const prediction = learnerRoutePredictionSchema.safeParse(predictionInput);
  if (!scenario.success) return { success: false as const, error: scenario.error };
  if (!prediction.success) return { success: false as const, error: prediction.error };
  return { success: true as const, data: evaluateRoutePrediction(scenario.data, prediction.data) };
}
