"use client";

import { useState } from "react";
import { NetworkDeviceSymbol } from "@/features/packet-flow/network-device-symbol";
import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { evaluateRouteDecision } from "./evaluate-route-decision";
import { publicRouteDecisionScenarios } from "./route-decision.data";

const scopeLabels = { "on-link": "On-link", "remote-via-gateway": "Remote via gateway", "no-route": "No route", "local-broadcast": "Local broadcast" } as const;
const recipientLabels = { destination: "Destination host", gateway: "Gateway interface", "local-broadcast": "Local broadcast", none: "No frame" } as const;
const actionLabels = { "direct-delivery": "Direct delivery", "route-unicast": "Route unicast", "stop-broadcast": "Stop broadcast", "host-routing-failure": "Host routing failure", "router-no-route": "Router has no onward route" } as const;

export function RouteDecisionPlayer() {
  const [selectedId, setSelectedId] = useState(publicRouteDecisionScenarios[0].id);
  const [explanationMode, setExplanationMode] = useState<"plain" | "technical">("plain");
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const scenario = publicRouteDecisionScenarios.find(({ id }) => id === selectedId)!;
  const outcome = evaluateRouteDecision(scenario);
  const interfaceLabel = scenario.interfaces.find(({ id }) => id === outcome.interfaceId)?.label ?? "None";

  return (
    <section aria-labelledby="route-decision-title" className="route-decision-player" data-motion={reducedMotion || !isHydrated ? "reduced" : "travel"}>
      <h3 id="route-decision-title">Make the host&apos;s route decision</h3>
      <p>Change the destination and watch the route, next hop, first frame, and boundary action update together.</p>

      <fieldset className="route-decision-player__choices">
        <legend>Choose a route decision scenario</legend>
        {publicRouteDecisionScenarios.map((item) => (
          <label key={item.id}>
            <input checked={item.id === selectedId} name="route-decision-scenario" onChange={() => setSelectedId(item.id)} type="radio" />
            {item.title}
          </label>
        ))}
      </fieldset>

      <div className="route-decision-topology" role="img" aria-label="Source host through a local link and router toward the destination">
        <svg aria-hidden="true" viewBox="0 0 520 130">
          <path className="route-decision-topology__link" d="M88 58 H224 M296 58 H432" />
          <NetworkDeviceSymbol kind="host" transform="translate(60 58)" />
          <NetworkDeviceSymbol kind="router" transform="translate(260 58)" />
          <NetworkDeviceSymbol kind="server" transform="translate(460 58)" />
          <text x="60" y="112" textAnchor="middle">Source</text>
          <text x="260" y="112" textAnchor="middle">Router</text>
          <text x="460" y="112" textAnchor="middle">Destination</text>
        </svg>
        <p><strong>{scenario.sourceIp}/{scenario.sourcePrefixLength}</strong> → <strong>{scenario.destinationIp}</strong></p>
      </div>

      <div className="route-decision-results" aria-live="polite">
        <section aria-labelledby="route-result-decision"><h4 id="route-result-decision">Decision</h4><p>{scopeLabels[outcome.scope]}</p></section>
        <section aria-labelledby="route-result-interface"><h4 id="route-result-interface">Outgoing interface</h4><p>{interfaceLabel}</p></section>
        <section aria-labelledby="route-result-next-hop"><h4 id="route-result-next-hop">Next hop</h4><p>{outcome.nextHopIp ?? "None"}</p></section>
        <section aria-labelledby="route-result-frame"><h4 id="route-result-frame">First frame</h4><p>{recipientLabels[outcome.firstHopRecipient]}</p></section>
        <section aria-labelledby="route-result-boundary"><h4 id="route-result-boundary">Boundary action</h4><p>{actionLabels[outcome.boundaryAction]}</p></section>
      </div>

      <fieldset className="route-decision-player__explanation-mode">
        <legend>Explanation depth</legend>
        <label><input checked={explanationMode === "plain"} name="route-explanation-mode" onChange={() => setExplanationMode("plain")} type="radio" />Plain language</label>
        <label><input checked={explanationMode === "technical"} name="route-explanation-mode" onChange={() => setExplanationMode("technical")} type="radio" />Technical reasoning</label>
      </fieldset>
      <p className="route-decision-player__explanation">{explanationMode === "plain" ? outcome.plainExplanation : outcome.technicalExplanation}</p>
    </section>
  );
}
