import { useId } from "react";

import type { TroubleshootingScenario } from "./troubleshooting-scenario.schema";

type Props = { checks: TroubleshootingScenario["restorationChecks"]; results: Record<string, boolean>; onChange: (id: string, passed: boolean) => void };

export function RestorationChecklist({ checks, results, onChange }: Props) {
  const titleId = useId();
  return <section className="restoration-checklist" aria-labelledby={titleId}><h3 id={titleId}>End-to-end restoration</h3><p>A ping alone is not enough. Verify every service layer.</p>{checks.map((check) => <label key={check.id}><input checked={Boolean(results[check.id])} onChange={(event) => onChange(check.id, event.target.checked)} type="checkbox" />{check.label}</label>)}</section>;
}
