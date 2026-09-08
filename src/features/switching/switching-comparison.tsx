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

export function SwitchingComparison() {
  const [dimensionId, setDimensionId] = useState<ComparisonDimensionId>("signal-handling");
  const [deviceId, setDeviceId] = useState<SwitchingDeviceId>("hub");
  const device = publicSwitchingComparison.find(({ id }) => id === deviceId)!;
  const detail = device.dimensions[dimensionId];
  const journey = createSwitchingJourney(deviceId, dimensionId);
  const inspected = deviceId === "hub" ? "The physical signal; it does not read MAC addresses." : "The source and destination MAC addresses in the Ethernet frame.";
  const egress = deviceId === "hub" ? "P2 and P3, because a hub repeats toward every other port." : deviceId === "bridge" ? "Only the segment required by its learned MAC information." : "The selected port for known unicast, or all eligible ports when flooding is required.";

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
          <PacketJourneyPlayer journey={journey} />
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
