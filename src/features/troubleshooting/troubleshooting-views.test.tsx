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
    expect(screen.getAllByText("Branch client")[0]).toHaveAttribute("data-active", "true");
    const connections = screen.getByRole("list", { name: /topology connections/i });
    expect(connections).toHaveTextContent("Gi1/0/18");
    expect(connections).toHaveTextContent(/Edge firewall outside to Portal server eth0/i);
    expect([...connections.children].map((item) => item.textContent)).not.toContain("DNS resolver eth0 to Portal server eth0");
    const visualLink = screen.getByTestId("topology-link-firewall-portal");
    expect(visualLink).toHaveAttribute("data-from", "edge-firewall");
    expect(visualLink).toHaveAttribute("data-to", "portal-server");
    expect(visualLink).toHaveTextContent(/outside.*eth0/i);
  });

  it("runs tests and presents packet captures as tables", () => {
    const onRunTest = vi.fn();
    const capture = proBranchPortalIncident.tests.find(({ id }) => id === "capture-flow")!;
    render(<EvidenceBoard tests={[capture]} selectedEvidence={capture.evidence} onRunTest={onRunTest} />);
    fireEvent.click(screen.getByRole("button", { name: /inspect the firewall capture/i }));
    expect(onRunTest).toHaveBeenCalledWith("capture-flow");
    expect(screen.getByRole("table", { name: /packet capture evidence/i })).toBeVisible();
  });

  it("renders table evidence as an accessible structured table", () => {
    const table = guidedBranchPortalIncident.tests.find(({ id }) => id === "inspect-route")!;
    render(<EvidenceBoard tests={[table]} selectedEvidence={table.evidence} onRunTest={vi.fn()} />);
    expect(screen.getByRole("table", { name: /route selection evidence/i })).toHaveTextContent(/203\.0\.113\.80\/32/);
  });

  it("announces an ordered incident timeline", () => {
    render(<IncidentTimeline entries={[{ kind: "test", label: "Test VLAN hypothesis", elapsedMinutes: 2, result: "correct" }]} />);
    expect(screen.getByRole("list", { name: /incident timeline/i })).toHaveTextContent(/hypothesis/i);
    expect(screen.getByText(/2 minutes/i)).toBeVisible();
  });
});
