"use client";

import { useState } from "react";

import { PacketFlowPlayer } from "@/features/packet-flow/packet-flow-player";
import { routerOnStickScenario } from "./router-on-stick-scenario";

export function RouterOnStickPlayer() {
  const [stepIndex, setStepIndex] = useState(0);
  const vlan = stepIndex <= 1 ? "10" : stepIndex === 2 ? "routing" : "20";

  return <section className="router-on-stick-player" data-active-vlan={vlan} aria-labelledby="router-on-stick-title">
    <h3 id="router-on-stick-title">Router on a stick: one interface, two VLANs</h3>
    <p>The red and green paths in the diagram share one switch-to-router trunk. Play the journey to see the tag change after the router makes its Layer 3 decision.</p>
    <div className="router-on-stick-player__legend" aria-label="VLAN path key"><span>VLAN 10 · red</span><span>VLAN 20 · green</span><span>Shared 802.1Q trunk</span></div>
    <PacketFlowPlayer scenario={routerOnStickScenario} suppressHeading inspectionDepthControl onStepChange={setStepIndex} />
  </section>;
}
