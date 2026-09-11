"use client";

import { useState } from "react";

import { scoreIncident, type IncidentState } from "./troubleshooting-engine";
import type { TroubleshootingScenario } from "./troubleshooting-scenario.schema";

export type IncidentReport = { impact: string; evidence: string; rootCauses: string; correction: string; restoration: string; prevention: string };
const fields: { key: keyof IncidentReport; label: string }[] = [
  { key: "impact", label: "Impact" }, { key: "evidence", label: "Evidence" }, { key: "rootCauses", label: "Root causes" },
  { key: "correction", label: "Correction" }, { key: "restoration", label: "Restoration" }, { key: "prevention", label: "Prevention" },
];
const emptyReport: IncidentReport = { impact: "", evidence: "", rootCauses: "", correction: "", restoration: "", prevention: "" };

export function IncidentReportBuilder({ state, scenario, onSubmit = () => undefined }: { state: IncidentState; scenario: TroubleshootingScenario; onSubmit?: (report: IncidentReport) => void }) {
  const [report, setReport] = useState(emptyReport);
  const [message, setMessage] = useState("");
  const score = scoreIncident(state, scenario);
  const submit = () => {
    const missing = fields.filter(({ key }) => !report[key].trim()).map(({ label }) => label);
    if (missing.length) { setMessage(`Evidence and all report sections are required. Missing: ${missing.join(", ")}.`); return; }
    onSubmit(report); setMessage("Incident report submitted for review.");
  };
  return <section className="incident-report-builder" aria-label="Structured incident report">
    <h3>Write the incident report</h3><p>Turn observations into an evidence-backed operational record.</p>
    <dl className="incident-report-builder__score"><div><dt>Root-cause score</dt><dd>{score.rootCause}%</dd></div><div><dt>Restoration score</dt><dd>{score.restoration}%</dd></div><div><dt>Report score</dt><dd>{score.report}%</dd></div></dl>
    {fields.map(({ key, label }) => <label key={key}>{label}<textarea value={report[key]} onChange={(event) => setReport((current) => ({ ...current, [key]: event.target.value }))} rows={3} /></label>)}
    <button type="button" onClick={submit}>Submit incident report</button>
    {message ? <p role={message.startsWith("Evidence") ? "alert" : "status"}>{message}</p> : null}
  </section>;
}
