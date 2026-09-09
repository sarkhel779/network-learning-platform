import { addressFamilyOf, parsePrefix, prefixMatches, type RouteDecisionScenario } from "./routing.schema";

export type RouteCriterion = "address-family" | "prefix-match" | "longest-prefix" | "administrative-distance" | "metric";
export type RouteDecisionStage = Readonly<{ criterion: RouteCriterion; candidates: readonly Readonly<{ routeId: string; status: "retained" | "rejected"; reason: string }>[] }>;
export type RouteOutcome = Readonly<{ kind: "selected" | "equal-cost"; routeIds: readonly string[] }> | Readonly<{ kind: "no-route"; routeIds: readonly [] }>;
export type RouteDecisionTrace = Readonly<{ stages: readonly RouteDecisionStage[]; outcome: RouteOutcome }>;

const reasons: Record<RouteCriterion, [string, string]> = {
  "address-family": ["Address family matches", "Wrong address family"],
  "prefix-match": ["Destination matches this prefix", "Destination does not match this prefix"],
  "longest-prefix": ["Longest matching prefix", "A longer matching prefix is available"],
  "administrative-distance": ["Best route-source preference", "A lower administrative distance is available"],
  metric: ["Best comparable metric", "A lower comparable metric is available"],
};

export function selectRoute(scenario: RouteDecisionScenario): RouteDecisionTrace {
  let retained = new Set(scenario.routes.map(({ id }) => id));
  const stages: RouteDecisionStage[] = [];
  const stage = (criterion: RouteCriterion, keep: (route: RouteDecisionScenario["routes"][number]) => boolean) => {
    const next = new Set<string>();
    for (const route of scenario.routes) if (retained.has(route.id) && keep(route)) next.add(route.id);
    stages.push({ criterion, candidates: scenario.routes.map((route) => ({ routeId: route.id, status: next.has(route.id) ? "retained" : "rejected", reason: next.has(route.id) ? reasons[criterion][0] : retained.has(route.id) ? reasons[criterion][1] : "Rejected in an earlier step" })) });
    retained = next;
  };

  stage("address-family", (route) => parsePrefix(route.prefix).family === scenario.family && (!route.nextHop || addressFamilyOf(route.nextHop) === scenario.family));
  stage("prefix-match", (route) => prefixMatches(scenario.destination, route.prefix));
  const longest = Math.max(-1, ...scenario.routes.filter(({ id }) => retained.has(id)).map(({ prefix }) => parsePrefix(prefix).length));
  stage("longest-prefix", (route) => parsePrefix(route.prefix).length === longest);
  const bestDistance = Math.min(Infinity, ...scenario.routes.filter(({ id }) => retained.has(id)).map(({ administrativeDistance }) => administrativeDistance));
  stage("administrative-distance", (route) => route.administrativeDistance === bestDistance);
  const remaining = scenario.routes.filter(({ id }) => retained.has(id));
  const domains = new Set(remaining.map(({ metricDomain }) => metricDomain));
  const comparable = domains.size <= 1;
  if (!comparable && !scenario.allowEqualCost) throw new Error("Routes reaching metric comparison use incomparable metric domains");
  const bestMetric = comparable ? Math.min(Infinity, ...remaining.map(({ metric }) => metric)) : Infinity;
  stage("metric", (route) => !comparable || route.metric === bestMetric);

  const routeIds = scenario.routes.filter(({ id }) => retained.has(id)).map(({ id }) => id);
  if (routeIds.length === 0) return { stages, outcome: { kind: "no-route", routeIds: [] } };
  return { stages, outcome: { kind: scenario.allowEqualCost && routeIds.length > 1 ? "equal-cost" : "selected", routeIds: scenario.allowEqualCost ? routeIds : routeIds.slice(0, 1) } };
}
