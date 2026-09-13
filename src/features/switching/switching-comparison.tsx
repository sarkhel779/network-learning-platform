"use client";

import { useState } from "react";

import { PacketJourneyPlayer } from "@/features/packet-journey/packet-journey-player";

import { createSwitchingJourney } from "./create-switching-journey";
import { publicSwitchingComparison } from "./switching.data";
import type { ComparisonDimensionId, SwitchingDeviceId } from "./switching.schema";

const dimensionIds: readonly ComparisonDimensionId[] = [
  "signal-handling",
  "collision-scope",
  "bandwidth-sharing",
  "address-awareness",
  "delivery-scope",
];

export function SwitchingComparison({ progressItemId }: { progressItemId?: string }) {
  const [dimensionId, setDimensionId] = useState<ComparisonDimensionId>("signal-handling");
  const [deviceId, setDeviceId] = useState<SwitchingDeviceId>("hub");
  const device = publicSwitchingComparison.find(({ id }) => id === deviceId)!;
  const detail = device.dimensions[dimensionId];
  const journey = createSwitchingJourney(deviceId, dimensionId);
  const inspected = deviceId === "hub" ? "The physical signal; it does not read MAC addresses." : "The source and destination MAC addresses in the Ethernet frame.";
  const egress = deviceId === "hub" ? "P2 and P3, because a hub repeats toward every other port." : deviceId === "bridge" ? "Only the segment required by its learned MAC information." : "The selected port for known unicast, or all eligible ports when flooding is required.";
  const simpleAction = deviceId === "hub"
    ? "Hub copies the signal to both Host B and Host C"
    : deviceId === "bridge"
      ? "Bridge checks whether the other segment needs it"
      : "Switch sends a known destination to its learned port";
  const simpleResult = deviceId === "hub"
    ? "Host B accepts it; Host C ignores it"
    : "Host B receives it; unnecessary ports are skipped";
  const simpleSummary = deviceId === "hub"
    ? "In simple terms, a hub is like a loudspeaker: everyone hears Host A, but only Host B keeps the message."
    : deviceId === "bridge"
      ? "In simple terms, a bridge is a doorway between two groups: it passes the message across only when needed."
      : "In simple terms, a switch is more selective: it uses the destination address to choose the right port when it knows where Host B is.";

  return (
    <section aria-labelledby="switching-comparison-title" className="switching-comparison">
      <h3 id="switching-comparison-title">See the forwarding behavior change</h3>
      <p>Select one dimension and compare the same local conversation without treating a switch as a router or security boundary.</p>

      <fieldset className="switching-comparison__devices">
        <legend>Choose intermediary</legend>
        {publicSwitchingComparison.map((item) => (
          <label key={item.id}>
            <input checked={deviceId === item.id} name="switching-device" onChange={() => setDeviceId(item.id)} type="radio" />
            {item.name}
          </label>
        ))}
      </fieldset>

      <fieldset className="switching-comparison__dimensions">
        <legend>Compare intermediary behavior</legend>
        {dimensionIds.map((id) => (
          <label key={id}>
            <input
              checked={dimensionId === id}
              name="switching-comparison-dimension"
              onChange={() => setDimensionId(id)}
              type="radio"
              value={id}
            />
            {publicSwitchingComparison[0].dimensions[id].label}
          </label>
        ))}
      </fieldset>

      <div className="switching-comparison__panels">
        <article aria-labelledby={`switching-device-${device.id}`} className="switching-device-card" data-behavior={detail.behavior}>
          <h4 id={`switching-device-${device.id}`}>{device.name}</h4>
          <p>{device.summary}</p>
          <p className="switching-simple-summary">{simpleSummary}</p>
          <p className="switching-scroll-hint">Swipe sideways to follow the packet →</p>
          <div className="switching-simple-topology" role="group" aria-label={`${device.name} in plain English`}>
            <div><span>1</span><strong>Host A sends</strong><small>A message meant for Host B enters on P1.</small></div>
            <div><span>2</span><strong>{simpleAction}</strong><small>{deviceId === "hub" ? "A hub does not read the destination address." : "The device decides which link needs the frame."}</small></div>
            <div><span>3</span><strong>{simpleResult}</strong><small>The intended host handles the message.</small></div>
          </div>
          <PacketJourneyPlayer journey={journey} progressItemId={progressItemId} />
          <section className="switching-what-changed" aria-label="What changed?">
            <h5>What changed?</h5>
            <dl>
              <div><dt>What entered?</dt><dd>Traffic from Host A entered on P1.</dd></div>
              <div><dt>Where did it leave?</dt><dd>{egress}</dd></div>
              <div><dt>What did it inspect or learn?</dt><dd>{inspected}</dd></div>
            </dl>
          </section>
          <details><summary>Technical detail</summary><p>{detail.explanation}</p></details>
        </article>
      </div>
    </section>
  );
}
