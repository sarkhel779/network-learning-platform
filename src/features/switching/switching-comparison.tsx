"use client";

import { useState } from "react";

import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";

import { publicSwitchingComparison } from "./switching.data";
import type { ComparisonDimensionId } from "./switching.schema";

const dimensionIds: readonly ComparisonDimensionId[] = [
  "signal-handling",
  "collision-scope",
  "bandwidth-sharing",
  "address-awareness",
  "delivery-scope",
];

const behaviorLabels = {
  repeat: "Repeat",
  segment: "Segment",
  filter: "Filter",
  learn: "Learn",
  forward: "Forward",
  flood: "Flood",
} as const;

export function SwitchingComparison() {
  const [dimensionId, setDimensionId] = useState<ComparisonDimensionId>("signal-handling");
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const motion = reducedMotion || !isHydrated ? "reduced" : "travel";

  return (
    <section aria-labelledby="switching-comparison-title" className="switching-comparison">
      <h3 id="switching-comparison-title">See the forwarding behavior change</h3>
      <p>Select one dimension and compare the same local conversation without treating a switch as a router or security boundary.</p>

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

      <div
        aria-label="Three hosts connected through the selected Ethernet intermediary"
        className="switching-topology"
        role="img"
      >
        <span>Host A</span><span aria-hidden="true">—</span><span>Intermediary</span><span aria-hidden="true">—</span><span>Hosts B and C</span>
      </div>

      <div className="switching-comparison__panels">
        {publicSwitchingComparison.map((device, index) => {
          const detail = device.dimensions[dimensionId];
          const headingId = `switching-device-${device.id}`;
          return (
            <article
              aria-labelledby={headingId}
              className="switching-device-card"
              data-behavior={detail.behavior}
              key={device.id}
            >
              <h4 id={headingId}>{device.name}</h4>
              <p>{device.summary}</p>
              <div
                aria-label={`${device.name} traffic path: ${detail.explanation}`}
                className="switching-traffic-path"
                data-motion={motion}
                role="img"
              >
                <span>Ingress</span><span aria-hidden="true">→</span>
                <span>Action: <strong>{behaviorLabels[detail.behavior]}</strong></span>
                <span aria-hidden="true">→</span><span>Egress</span>
              </div>
              <p data-port={`port-${index + 1}`}><strong>Port cue:</strong> ingress P1; eligible egress P2 and P3</p>
              <p><strong>Behavior:</strong> {behaviorLabels[detail.behavior]}</p>
              <p>{detail.explanation}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
