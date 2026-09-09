"use client";

import { useMemo, useState } from "react";
import { PacketFlowPlayer } from "@/features/packet-flow/packet-flow-player";
import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";
import { forwardingJourneys, type ForwardingJourney } from "./forwarding-journeys";

function toPacketFlowScenario(journey: ForwardingJourney): PacketFlowScenario {
  return parsePacketFlowScenario({ id: journey.id, title: journey.title, description: journey.description, defaultSpeed: 1, devices: journey.devices, links: journey.links,
    steps: journey.steps.map((step) => ({ id: step.id, title: step.title, explanation: step.explanation, durationMs: 2400, activeDeviceIds: step.activeDeviceIds, activeLinkIds: step.activeLinkIds,
      ...(step.activeLinkIds.length && step.ingressDevice && step.egressDevice ? { packet: { kind: "packet", label: `${journey.family.toUpperCase()} packet`, from: step.ingressDevice, to: step.egressDevice } } : {}),
      summaryFields: [
        { label: "IP source", value: step.sourceIp, layer: "ip" }, { label: "IP destination", value: step.destinationIp, layer: "ip" },
        { label: journey.family === "ipv4" ? "TTL" : "Hop Limit", value: String(step.hopLimit), layer: "ip", changed: step.kind === "forward" },
        { label: "Layer 2 source", value: step.sourceMac, layer: "ethernet", changed: step.kind === "forward" }, { label: "Layer 2 destination", value: step.destinationMac, layer: "ethernet", changed: step.kind === "forward" },
      ],
      detailFields: [
        { label: "Selected route", value: step.selectedRouteId ?? "No route selected", layer: "context" },
        { label: "Ingress", value: step.ingressDevice ?? "Local decision", layer: "context" }, { label: "Egress", value: step.egressDevice ?? "No egress", layer: "context" },
      ], stateNote: `Direction: ${step.ingressDevice ?? "local"} → ${step.egressDevice ?? "none"}.`,
    })),
  });
}

export function HopByHopForwardingPlayer({ progressItemId }: { progressItemId?: string }) {
  const [index, setIndex] = useState(0);
  const journey = forwardingJourneys[index];
  const scenario = useMemo(() => { try { return toPacketFlowScenario(journey); } catch { return null; } }, [journey]);
  if (!scenario) return <section className="hop-by-hop-player" aria-label="Hop-by-hop forwarding"><p>The forwarding walkthrough is temporarily unavailable. The packet keeps its destination IP while each router makes a fresh route lookup.</p></section>;
  const responsibleDevice = journey.devices.find(({ id }) => id === journey.terminal.deviceId)?.label ?? journey.terminal.deviceId;
  return <section aria-labelledby="hop-by-hop-title" className="hop-by-hop-player">
    <h3 id="hop-by-hop-title">Follow the packet one router at a time</h3>
    <fieldset><legend>Choose a forwarding journey</legend>{forwardingJourneys.map((candidate, candidateIndex) => <label key={candidate.id}><input checked={index === candidateIndex} name="forwarding-journey" onChange={() => setIndex(candidateIndex)} type="radio" />{candidate.title}</label>)}</fieldset>
    <PacketFlowPlayer autoplay inspectionDepthControl key={journey.id} progressItemId={progressItemId} scenario={scenario} suppressHeading />
    <aside aria-label="Journey outcome" className={`forwarding-outcome forwarding-outcome--${journey.terminal.kind}`} role="status">
      <strong>{journey.terminal.kind === "discarded" ? `${responsibleDevice} discards the packet.` : journey.terminal.kind === "preview" ? `${responsibleDevice} pauses forwarding for next-hop resolution.` : `${responsibleDevice} receives the packet.`}</strong>
      {journey.terminal.icmpNote ? <p>{journey.terminal.icmpNote}</p> : null}
    </aside>
  </section>;
}
