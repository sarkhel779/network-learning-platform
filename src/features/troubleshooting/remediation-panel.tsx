import { useId } from "react";

import type { TroubleshootingScenario } from "./troubleshooting-scenario.schema";

type Props = { remediations: TroubleshootingScenario["remediations"]; correctedFaultIds: string[]; onApply: (id: string) => void };

export function RemediationPanel({ remediations, correctedFaultIds, onApply }: Props) {
  const titleId = useId();
  return <section className="remediation-panel" aria-labelledby={titleId}><h3 id={titleId}>Remediation controls</h3><div>{remediations.map((item) => <button disabled={correctedFaultIds.includes(item.faultId)} key={item.id} onClick={() => onApply(item.id)} type="button">{correctedFaultIds.includes(item.faultId) ? `Completed: ${item.label}` : item.label}</button>)}</div></section>;
}
