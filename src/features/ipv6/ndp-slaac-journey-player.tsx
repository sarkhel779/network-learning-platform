"use client";

import { useState } from "react";
import { PacketFlowPlayer } from "@/features/packet-flow/packet-flow-player";
import { ndpSlaacJourneys } from "./ndp-slaac-journeys";

export function NdpSlaacJourneyPlayer({ progressItemId }: { progressItemId?: string }) {
  const [index, setIndex] = useState(0);
  return <section aria-labelledby="ndp-slaac-title" className="ndp-slaac-player">
    <h3 id="ndp-slaac-title">Watch IPv6 configure and find the next hop</h3>
    <fieldset><legend>Choose an IPv6 journey</legend>{ndpSlaacJourneys.map((scenario, scenarioIndex) => <label key={scenario.id}><input checked={index === scenarioIndex} name="ipv6-journey" onChange={() => setIndex(scenarioIndex)} type="radio" />{scenario.title}</label>)}</fieldset>
    <PacketFlowPlayer autoplay inspectionDepthControl key={ndpSlaacJourneys[index].id} progressItemId={progressItemId} scenario={ndpSlaacJourneys[index]} suppressHeading />
  </section>;
}
