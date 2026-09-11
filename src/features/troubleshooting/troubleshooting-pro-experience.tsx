"use client";

import { useState } from "react";

import { AdvancedValidationLab, troubleshootingValidationChecks } from "./advanced-validation-lab";
import { IncidentReportBuilder } from "./incident-report-builder";
import { createIncidentState, type IncidentState } from "./troubleshooting-engine";
import { proBranchPortalIncident } from "./troubleshooting-scenarios";
import { TroubleshootingWorkspace } from "./troubleshooting-workspace";

export function TroubleshootingProExperience() {
  const [state, setState] = useState<IncidentState>(() => createIncidentState(proBranchPortalIncident));
  return <section aria-label="Pro troubleshooting experience">
    <h2 id="pro-sparse-incident">Pro incident: sparse evidence and asymmetric routing</h2>
    <p>Correlate packet, route, firewall, DNS, and interface evidence without guided sequencing.</p>
    <TroubleshootingWorkspace scenario={proBranchPortalIncident} progressItemId="capstone_pro_evidence" guidance="sparse" onStateChange={setState} />
    <h2 id="pro-incident-report">Pro incident report</h2>
    <IncidentReportBuilder state={state} scenario={proBranchPortalIncident} progressItemId="capstone_pro_report" />
    <h2 id="pro-advanced-validation">Pro packet and RFC validation</h2>
    <AdvancedValidationLab checks={troubleshootingValidationChecks} progressItemId="capstone_pro_validation" />
  </section>;
}
