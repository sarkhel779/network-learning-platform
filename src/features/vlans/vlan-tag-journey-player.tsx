"use client";

import { useEffect, useMemo, useReducer, useState } from "react";

import { NetworkTopology } from "@/features/packet-flow/network-topology";
import { PlaybackControls } from "@/features/packet-flow/playback-controls";
import { createPlaybackState, getStepDelay, playbackReducer } from "@/features/packet-flow/playback";
import { parsePacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";
import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { VlanFrameStage } from "./vlan-frame-stage";
import { getVlanTagJourney } from "./vlan-tag-journey.data";

const devices = [
  { id: "host-a", label: "Host A", role: "VLAN 10 endpoint", x: 55, y: 55 },
  { id: "host-c", label: "Host C", role: "VLAN 20 endpoint", x: 55, y: 190 },
  { id: "switch-a", label: "Switch A", role: "ingress switch", x: 300, y: 120 },
  { id: "switch-b", label: "Switch B", role: "egress switch", x: 535, y: 120 },
  { id: "host-b", label: "Host B", role: "VLAN 10 endpoint", x: 780, y: 55 },
  { id: "host-d", label: "Host D", role: "VLAN 20 endpoint", x: 780, y: 190 },
] as const;

const links = [
  { id: "host-a-switch-a", from: "host-a", to: "switch-a", fromInterface: "Host A eth0", toInterface: "Switch A Gi0/1 · access VLAN 10" },
  { id: "host-c-switch-a", from: "host-c", to: "switch-a", fromInterface: "Host C eth0", toInterface: "Switch A Gi0/2 · access VLAN 20" },
  { id: "trunk", from: "switch-a", to: "switch-b", fromInterface: "Switch A Gi0/24 · 802.1Q trunk", toInterface: "Switch B Gi0/24 · 802.1Q trunk" },
  { id: "switch-b-host-b", from: "switch-b", to: "host-b", fromInterface: "Switch B Gi0/1 · access VLAN 10", toInterface: "Host B eth0" },
  { id: "switch-b-host-d", from: "switch-b", to: "host-d", fromInterface: "Switch B Gi0/2 · access VLAN 20", toInterface: "Host D eth0" },
] as const;

export function VlanTagJourneyPlayer() {
  const [vlan, setVlan] = useState<10 | 20>(10);
  const [technical, setTechnical] = useState(false);
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const journey = useMemo(() => getVlanTagJourney(vlan), [vlan]);
  const scenario = useMemo(() => parsePacketFlowScenario({
    id: `vlan-${vlan}-tag-journey`, title: `VLAN ${vlan} 802.1Q journey`,
    description: "Watch one Ethernet frame gain a VLAN tag for the trunk and lose it before endpoint delivery.",
    defaultSpeed: 1, devices, links,
    steps: journey.map((step, index) => ({
      id: step.id, title: step.title, explanation: step.explanation, durationMs: 3000,
      activeDeviceIds: step.activeDeviceIds, activeLinkIds: step.activeLinkIds,
      packet: { kind: "frame" as const, label: step.tagged ? `Tagged VLAN ${vlan} frame` : `Untagged VLAN ${vlan} frame`,
        from: index < 2 ? (vlan === 10 ? "host-a" : "host-c") : index < 5 ? "switch-a" : "switch-b",
        to: index < 2 ? "switch-a" : index < 5 ? "switch-b" : (vlan === 10 ? "host-b" : "host-d") },
      summaryFields: step.summaryFields.map((field) => ({ ...field, layer: "context" as const })),
      detailFields: step.detailFields.map((field) => ({ ...field, layer: "ethernet" as const })),
    })),
  }), [journey, vlan]);
  const [state, dispatch] = useReducer(playbackReducer, { count: journey.length, reduced: reducedMotion || !isHydrated }, ({ count, reduced }) => createPlaybackState(count, 1, reduced));
  const step = journey[state.stepIndex];

  useEffect(() => { dispatch({ type: "restart", autoplay: isHydrated && !reducedMotion }); }, [vlan, isHydrated, reducedMotion]);
  useEffect(() => {
    if (!state.playing || state.stepIndex === state.stepCount - 1) return;
    const timer = window.setTimeout(() => dispatch({ type: "tick" }), getStepDelay(3000, state.speed));
    return () => window.clearTimeout(timer);
  }, [state.playing, state.speed, state.stepCount, state.stepIndex]);

  return <section className="vlan-tag-journey-player" aria-labelledby="vlan-tag-journey-title">
    <h3 id="vlan-tag-journey-title">Follow the 802.1Q tag across a trunk</h3>
    <p>{scenario.description}</p>
    <fieldset className="vlan-tag-journey-player__choices"><legend>Choose the operational VLAN</legend>
      {([10, 20] as const).map((id) => <label key={id}><input type="radio" name="tag-vlan" checked={vlan === id} onChange={() => setVlan(id)} />VLAN {id} journey</label>)}
    </fieldset>
    <NetworkTopology scenario={scenario} step={scenario.steps[state.stepIndex]} reducedMotion={reducedMotion} />
    <PlaybackControls state={state} dispatch={dispatch} reducedMotion={reducedMotion} />
    <div className="vlan-tag-journey-player__details" aria-live="polite">
      <section><p>Step {state.stepIndex + 1} of {state.stepCount}</p><h4>{step.title}</h4><p>{step.explanation}</p></section>
      <section><fieldset className="vlan-tag-journey-player__inspection"><legend>Frame inspection</legend>
        <label><input type="radio" name="tag-depth" checked={!technical} onChange={() => setTechnical(false)} />Plain-language inspection</label>
        <label><input type="radio" name="tag-depth" checked={technical} onChange={() => setTechnical(true)} />Technical inspection</label>
      </fieldset><VlanFrameStage tagged={step.tagged} vlan={vlan} technical={technical} /></section>
    </div>
  </section>;
}
