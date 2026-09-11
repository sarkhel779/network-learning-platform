import { describe, expect, it } from "vitest";

import { guidedBranchPortalIncident, proBranchPortalIncident, troubleshootingScenarios } from "./troubleshooting-scenarios";

describe("troubleshooting capstone incidents", () => {
  it("reveals the guided VLAN, route, and DNS faults in order", () => {
    expect(guidedBranchPortalIncident.faults.map(({ id }) => id)).toEqual(["wrong-access-vlan", "wrong-specific-route", "stale-portal-dns"]);
    expect(guidedBranchPortalIncident.faults.map(({ unlocksFaultId }) => unlocksFaultId)).toEqual(["wrong-specific-route", "stale-portal-dns", undefined]);
  });

  it("reuses one enterprise topology while making the Pro incident less guided", () => {
    expect(proBranchPortalIncident.topology).toEqual(guidedBranchPortalIncident.topology);
    expect(proBranchPortalIncident.faults.map(({ id }) => id)).toEqual(["asymmetric-stateful-return", "stale-dns-cache"]);
    expect(proBranchPortalIncident.hypotheses.length).toBeGreaterThan(2);
  });

  it("covers CLI, table, log, capture, and observation evidence", () => {
    const evidenceKinds = new Set(troubleshootingScenarios.flatMap((scenario) => scenario.tests.map(({ evidence }) => evidence.kind)));
    expect(evidenceKinds).toEqual(new Set(["cli", "table", "log", "capture", "observation"]));
    expect(proBranchPortalIncident.tests.some(({ evidence }) => /SYN.*retransmission|retransmitted SYN/i.test(evidence.body))).toBe(true);
  });

  it("requires end-to-end restoration beyond a successful ping", () => {
    expect(guidedBranchPortalIncident.restorationChecks.map(({ id }) => id)).toEqual([
      "verify-addressing", "verify-arp", "verify-vlan", "verify-route", "verify-dns", "verify-tls", "verify-http",
    ]);
  });
});
