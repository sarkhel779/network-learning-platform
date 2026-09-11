"use client";

import { useState } from "react";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";

export type AdvancedValidationCheck = { id: string; title: string; evidence: string; question: string; options: string[]; correctIndex: number; explanation: string; referenceLabel: string; referenceUrl: string };

export const troubleshootingValidationChecks: AdvancedValidationCheck[] = [
  { id: "asymmetric-state", title: "Wireshark: repeated SYN without a return", evidence: "The client capture shows SYN retransmission at 1, 3, and 7 seconds; the stateful firewall records zero return bytes.", question: "Which finding best explains this evidence?", options: ["The return path bypasses the stateful firewall", "The access switch has a duplex mismatch", "The server certificate has expired"], correctIndex: 0, explanation: "Stateful inspection requires the return packets to traverse the device holding the session state. Compare both route directions before changing policy.", referenceLabel: "RFC 9293", referenceUrl: "https://www.rfc-editor.org/rfc/rfc9293" },
  { id: "dns-cache", title: "DNS cache timing", evidence: "The authoritative answer changed, but the client retains the earlier address until its cached TTL expires.", question: "What is the least-destructive next action?", options: ["Validate remaining TTL, then flush the affected cache", "Restart every DNS server", "Disable recursive resolution"], correctIndex: 0, explanation: "DNS caches retain resource records according to TTL. Establish whether the discrepancy is expected caching before flushing only the affected layer.", referenceLabel: "RFC 1034", referenceUrl: "https://www.rfc-editor.org/rfc/rfc1034" },
  { id: "route-validation", title: "Forward and return route validation", evidence: "A more-specific route changes only the server-to-client direction.", question: "Which validation prevents a partial fix?", options: ["Verify both directions and the state table", "Verify only client ping", "Clear every routing protocol"], correctIndex: 0, explanation: "A successful one-way reachability test does not prove symmetric service delivery or valid stateful inspection.", referenceLabel: "RFC 1812", referenceUrl: "https://www.rfc-editor.org/rfc/rfc1812" },
];

export function AdvancedValidationLab({ checks, progressItemId }: { checks: AdvancedValidationCheck[]; progressItemId?: string }) {
  const [index, setIndex] = useState(0); const [choice, setChoice] = useState<number | null>(null); const [submitted, setSubmitted] = useState(false);
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const progress = useProgressCompletionBoundary(progressItemId);
  const check = checks[index];
  const submit = () => {
    setSubmitted(true);
    if (choice !== check.correctIndex) return;
    const next = passedIds.includes(check.id) ? passedIds : [...passedIds, check.id];
    setPassedIds(next);
    if (next.length === checks.length) progress.markTerminalStateReached();
  };
  return <section className="advanced-validation-lab" aria-label="Advanced troubleshooting validation">
    <h3>Validate packet evidence and standards</h3>
    <label>Check <select value={index} onChange={(event) => { setIndex(Number(event.target.value)); setChoice(null); setSubmitted(false); }}>{checks.map((item, itemIndex) => <option value={itemIndex} key={item.id}>{item.title}</option>)}</select></label>
    <p><strong>Evidence:</strong> {check.evidence}</p>
    <fieldset><legend>{check.question}</legend>{check.options.map((option, optionIndex) => <label key={option}><input checked={choice === optionIndex} name={`${check.id}-decision`} onChange={() => { setChoice(optionIndex); setSubmitted(false); }} type="radio" />{option}</label>)}</fieldset>
    <button disabled={choice === null} type="button" onClick={submit}>Check advanced decision</button>
    {submitted ? <p role="status">{choice === check.correctIndex ? "Correct. " : "Recheck the evidence. "}{check.explanation}</p> : null}
    <a href={check.referenceUrl} rel="noreferrer" target="_blank">{check.referenceLabel}</a>
  </section>;
}
