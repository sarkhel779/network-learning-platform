"use client";

import { useState } from "react";
import { useReducedMotionState } from "../packet-flow/use-reduced-motion";

import { publicConnectionMedia } from "./connection-media.data";
import type { ComparisonQualityId, ConnectionMediumId } from "./connection-media.schema";

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

type SignalVisualState = Readonly<{
  activeStage: "source" | "medium" | "destination";
  cue: string;
}>;

const signalVisualStates: Readonly<Record<ComparisonQualityId, Readonly<Record<ConnectionMediumId, SignalVisualState>>>> = {
  distance: {
    copper: { activeStage: "destination", cue: "Short copper run: the electrical signal reaches a nearby destination." },
    fibre: { activeStage: "destination", cue: "Long fibre run: light stays clear over a much longer route." },
    wireless: { activeStage: "medium", cue: "Coverage edge: radio range changes with the surroundings." },
  },
  bandwidth: {
    copper: { activeStage: "medium", cue: "Negotiated link: cable category and ports set the available capacity." },
    fibre: { activeStage: "destination", cue: "High-capacity path: compatible optics carry more data together." },
    wireless: { activeStage: "source", cue: "Shared airtime: devices take turns using radio capacity." },
  },
  interference: {
    copper: { activeStage: "medium", cue: "Noise-sensitive path: electrical interference can disrupt the signal." },
    fibre: { activeStage: "destination", cue: "Optical isolation: electrical noise stays outside the light path." },
    wireless: { activeStage: "source", cue: "Radio contention: nearby transmissions compete for airtime." },
  },
  mobility: {
    copper: { activeStage: "destination", cue: "Fixed endpoint: moving the device breaks its cable connection." },
    fibre: { activeStage: "destination", cue: "Careful fixed link: fibre connects fixed equipment, not moving endpoints." },
    wireless: { activeStage: "medium", cue: "Roaming coverage: a device can move while it remains in range." },
  },
  cost: {
    copper: { activeStage: "source", cue: "Familiar hardware: nearby runs use common ports and cable." },
    fibre: { activeStage: "medium", cue: "Specialist optics: compatible equipment adds initial cost." },
    wireless: { activeStage: "destination", cue: "Coverage planning: fewer device cables still need capable coverage." },
  },
};

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
          const visualState = signalVisualStates[qualityId][medium.id];
          const headingId = `connection-media-${medium.id}`;

          return (
            <article aria-labelledby={headingId} className="connection-media-card connection-media-comparison__panel" key={medium.id}>
              <h4 id={headingId}>{medium.name}</h4>
              <p><strong>Signal:</strong> {medium.signalLabel}</p>
              <div
                aria-label={`${medium.name} signal track: ${visualState.cue}`}
                className="signal-track connection-media-comparison__signal-track"
                data-active-stage={visualState.activeStage}
                data-motion={reducedMotion || !isHydrated ? "reduced" : "travel"}
                data-quality={qualityId}
                data-signal={signalType}
                role="img"
              >
                <span aria-hidden="true" className="signal-track__stages">
                  <span className="signal-track__stage signal-track__stage--source">Source</span>
                  <span className="signal-track__stage signal-track__stage--medium">Medium</span>
                  <span className="signal-track__stage signal-track__stage--destination">Destination</span>
                </span>
                <span aria-hidden="true" className="signal-track__pulse connection-media-comparison__signal-pulse" />
              </div>
              <p className="connection-media-comparison__visual-cue"><strong>Signal cue:</strong> {visualState.cue}</p>
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
