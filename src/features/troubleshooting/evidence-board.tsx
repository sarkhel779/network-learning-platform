import { useId } from "react";

import type { TroubleshootingScenario, TroubleshootingTest } from "./troubleshooting-scenario.schema";

type Evidence = TroubleshootingScenario["tests"][number]["evidence"];
type Props = { tests: TroubleshootingTest[]; selectedEvidence?: Evidence; onRunTest: (testId: string) => void };

export function EvidenceBoard({ tests, selectedEvidence, onRunTest }: Props) {
  const titleId = useId();
  return <section className="evidence-board" aria-labelledby={titleId}>
    <h3 id={titleId}>Evidence board</h3>
    <div className="evidence-board__tools">
      {tests.map((test) => <button key={test.id} type="button" onClick={() => onRunTest(test.id)}>
        <span>{test.label}</span><small>{test.risk} · {test.timeCost} min</small>
      </button>)}
    </div>
    {selectedEvidence ? <EvidenceResult evidence={selectedEvidence} /> : <p>Select a safe test to collect evidence.</p>}
  </section>;
}

function EvidenceResult({ evidence }: { evidence: Evidence }) {
  const headingId = useId();
  if (evidence.kind === "capture") return <section className="evidence-board__result" aria-labelledby={headingId}>
    <h4 id={headingId}>{evidence.title}</h4>
    <div className="evidence-board__scroll"><table aria-label="Packet capture evidence"><thead><tr><th>Frame evidence</th><th>Interpretation</th></tr></thead><tbody><tr><td>SYN → 443</td><td>{evidence.body}</td></tr></tbody></table></div>
  </section>;
  return <section className="evidence-board__result" aria-labelledby={headingId}>
    <h4 id={headingId}>{evidence.title}</h4>
    {evidence.kind === "cli" || evidence.kind === "log" ? <pre><code>{evidence.body}</code></pre> : <p>{evidence.body}</p>}
  </section>;
}
