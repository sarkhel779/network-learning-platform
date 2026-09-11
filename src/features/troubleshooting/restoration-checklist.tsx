import { useId } from "react";

import type { TroubleshootingScenario } from "./troubleshooting-scenario.schema";

type Props = { checks: TroubleshootingScenario["restorationChecks"]; results: Record<string, boolean>; enabled: boolean; onRun: (id: string) => void };

export function RestorationChecklist({ checks, results, enabled, onRun }: Props) {
  const titleId = useId();
  return <section className="restoration-checklist" aria-labelledby={titleId}><h3 id={titleId}>End-to-end restoration</h3><p>{enabled ? "Run every service-layer verification. A ping alone is not enough." : "Complete evidence-backed remediation before restoration testing."}</p>{checks.map((check) => <button disabled={!enabled || Boolean(results[check.id])} key={check.id} onClick={() => onRun(check.id)} type="button">{results[check.id] ? `Passed: ${check.label}` : `Run verification: ${check.label}`}</button>)}</section>;
}
