"use client";

import { useState } from "react";
import { PacketJourneyPlayer } from "@/features/packet-journey/packet-journey-player";
import { StaticPacketJourney } from "@/features/packet-journey/static-packet-journey";
import { createRouteJourney } from "./create-route-journey";
import { evaluateRouteDecision } from "./evaluate-route-decision";
import { publicRouteDecisionScenarios } from "./route-decision.data";

const scopeLabels = { "on-link": "On-link", "remote-via-gateway": "Remote via gateway", "no-route": "No route", "local-broadcast": "Local broadcast" } as const;
const recipientLabels = { destination: "Destination host", gateway: "Gateway interface", "local-broadcast": "Local broadcast", none: "No frame" } as const;
const actionLabels = { "direct-delivery": "Direct delivery", "route-unicast": "Route unicast", "stop-broadcast": "Stop broadcast", "host-routing-failure": "Host routing failure", "router-no-route": "Router has no onward route" } as const;

export function RouteDecisionPlayer({ progressItemId }: { progressItemId?: string }) {
  const [selectedId, setSelectedId] = useState(publicRouteDecisionScenarios[0].id);
  const [explanationMode, setExplanationMode] = useState<"plain" | "technical">("plain");
  const scenario = publicRouteDecisionScenarios.find(({ id }) => id === selectedId)!;
  const outcome = evaluateRouteDecision(scenario);
  const journey = createRouteJourney(scenario, outcome);
  const interfaceLabel = scenario.interfaces.find(({ id }) => id === outcome.interfaceId)?.label ?? "None";

  return (
    <section aria-labelledby="route-decision-title" className="route-decision-player">
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

      <PacketJourneyPlayer journey={journey} progressItemId={progressItemId} />
      <noscript><StaticPacketJourney journey={journey} /></noscript>

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
