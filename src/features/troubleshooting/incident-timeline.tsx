import { useId } from "react";

import type { TimelineEntry } from "./troubleshooting-engine";

export function IncidentTimeline({ entries }: { entries: TimelineEntry[] }) {
  const titleId = useId();
  return <section className="incident-timeline" aria-labelledby={titleId}>
    <h3 id={titleId}>Incident timeline</h3>
    <ol aria-label="Incident timeline">
      {entries.length ? entries.map((entry, index) => <li key={`${entry.kind}-${index}`}>
        <span>{entry.kind === "test" ? "Hypothesis test" : entry.kind}</span>
        <strong>{entry.label}</strong>
        {entry.hypothesis ? <span>Hypothesis: {entry.hypothesis}</span> : null}
        {entry.prediction ? <span>Prediction: {entry.prediction}</span> : null}
        {entry.conclusion ? <span>Conclusion: {entry.conclusion} · confidence: {entry.confidence}</span> : null}
        <small>{entry.result} · {entry.elapsedMinutes} minutes elapsed</small>
      </li>) : <li>No evidence collected yet.</li>}
    </ol>
  </section>;
}
