"use client";

import { useState } from "react";
import { useReducedMotionState } from "../packet-flow/use-reduced-motion";

import { publicConnectionMedia } from "./connection-media.data";
import type { ComparisonQualityId } from "./connection-media.schema";

const comparisonQualityIds: readonly ComparisonQualityId[] = [
  "distance",
  "bandwidth",
  "interference",
  "mobility",
  "cost",
];

const signalTypeByMediumId = {
  copper: "electrical",
  fibre: "optical",
  wireless: "radio",
} as const;

export function ConnectionMediaComparison() {
  const [qualityId, setQualityId] = useState<ComparisonQualityId>("distance");
  const { reducedMotion, isHydrated } = useReducedMotionState();

  return (
    <section aria-labelledby="connection-media-comparison-title" className="connection-media-comparison">
      <h3 id="connection-media-comparison-title">Compare connection media</h3>
      <p>
        Each medium represents bits differently. Select a quality to compare the trade-offs without treating any one medium as the winner in every situation.
      </p>

      <fieldset className="connection-media-comparison__qualities">
        <legend>Compare connection qualities</legend>
        {comparisonQualityIds.map((id) => {
          const label = publicConnectionMedia[0].qualities[id].label;

          return (
            <label key={id}>
              <input
                checked={qualityId === id}
                name="connection-media-quality"
                onChange={() => setQualityId(id)}
                type="radio"
                value={id}
              />
              {label}
            </label>
          );
        })}
      </fieldset>

      <div className="connection-media-comparison__panels">
        {publicConnectionMedia.map((medium) => {
          const signalType = signalTypeByMediumId[medium.id];
          const quality = medium.qualities[qualityId];
          const headingId = `connection-media-${medium.id}`;

          return (
            <article aria-labelledby={headingId} className="connection-media-card connection-media-comparison__panel" key={medium.id}>
              <h4 id={headingId}>{medium.name}</h4>
              <p><strong>Signal:</strong> {medium.signalLabel}</p>
              <div
                aria-label={`${medium.name} signal track: ${medium.signalLabel}`}
                className="signal-track connection-media-comparison__signal-track"
                data-motion={reducedMotion || !isHydrated ? "reduced" : "travel"}
                data-quality={qualityId}
                data-signal={signalType}
                role="img"
              >
                <span aria-hidden="true" className="signal-track__stages">
                  <span>Source</span><span>Medium</span><span>Destination</span>
                </span>
                <span aria-hidden="true" className="signal-track__pulse connection-media-comparison__signal-pulse" />
              </div>
              <p>{medium.summary}</p>
              <p><strong>Picture it:</strong> {medium.analogy}</p>
              <p><strong>{quality.label}:</strong> {quality.explanation}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
