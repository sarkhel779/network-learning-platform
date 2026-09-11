import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { guidedBranchPortalIncident, proBranchPortalIncident } from "./troubleshooting-scenarios";
import { TroubleshootingTopology } from "./troubleshooting-topology";
import { EvidenceBoard } from "./evidence-board";
import { IncidentTimeline } from "./incident-timeline";

describe("troubleshooting evidence views", () => {
  it("renders an accessible topology and marks the active path", () => {
    render(<TroubleshootingTopology topology={guidedBranchPortalIncident.topology} activePath={["branch-client", "access-switch"]} />);
    expect(screen.getByRole("img", { name: /branch troubleshooting topology/i })).toBeVisible();
    expect(screen.getByText("Branch client")).toHaveAttribute("data-active", "true");
    expect(screen.getByText("Gi1/0/18")).toBeVisible();
  });

  it("runs tests and presents packet captures as tables", () => {
    const onRunTest = vi.fn();
    const capture = proBranchPortalIncident.tests.find(({ id }) => id === "capture-flow")!;
    render(<EvidenceBoard tests={[capture]} selectedEvidence={capture.evidence} onRunTest={onRunTest} />);
    fireEvent.click(screen.getByRole("button", { name: /inspect the firewall capture/i }));
    expect(onRunTest).toHaveBeenCalledWith("capture-flow");
    expect(screen.getByRole("table", { name: /packet capture evidence/i })).toBeVisible();
  });

  it("announces an ordered incident timeline", () => {
    render(<IncidentTimeline entries={[{ kind: "test", label: "Test VLAN hypothesis", elapsedMinutes: 2, result: "correct" }]} />);
    expect(screen.getByRole("list", { name: /incident timeline/i })).toHaveTextContent(/hypothesis/i);
    expect(screen.getByText(/2 minutes/i)).toBeVisible();
  });
});
