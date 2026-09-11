import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdvancedValidationLab, troubleshootingValidationChecks } from "./advanced-validation-lab";
import { IncidentReportBuilder } from "./incident-report-builder";
import { createIncidentState } from "./troubleshooting-engine";
import { proBranchPortalIncident } from "./troubleshooting-scenarios";
import { TroubleshootingProExperience } from "./troubleshooting-pro-experience";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({ useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }) }));

afterEach(cleanup);

describe("Pro troubleshooting exercises", () => {
  it("coordinates the sparse incident, live report, and validation as one experience", async () => {
    const user = userEvent.setup();
    render(<TroubleshootingProExperience />);
    expect(screen.queryByRole("heading", { name: /hypothesis journal/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /open hypothesis worksheet/i }));
    expect(screen.getByRole("heading", { name: /hypothesis journal/i })).toBeVisible();
    expect(screen.getByText("Root-cause score").nextSibling).toHaveTextContent("0%");
  });
  it("requires every incident-report section and evidence", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<IncidentReportBuilder progressItemId="capstone_pro_report" state={createIncidentState(proBranchPortalIncident)} scenario={proBranchPortalIncident} onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText("Impact"), "Branch portal access failed for VLAN 20 users.");
    await user.click(screen.getByRole("button", { name: "Submit incident report" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/evidence.*required/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a complete structured report with independent score context", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<IncidentReportBuilder state={createIncidentState(proBranchPortalIncident)} scenario={proBranchPortalIncident} onSubmit={onSubmit} />);
    for (const [label, value] of [["Impact", "VLAN 20 users lost portal access."], ["Evidence", "SYN retransmissions and asymmetric route tables."], ["Root causes", "Return traffic bypassed stateful inspection."], ["Correction", "Restored symmetric routing."], ["Restoration", "DNS, TLS, and HTTP checks passed."], ["Prevention", "Monitor route symmetry and cache changes."]] as const) await user.type(screen.getByLabelText(label), value);
    await user.click(screen.getByRole("button", { name: "Submit incident report" }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(markTerminalStateReached).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(/report submitted/i);
  });

  it("checks advanced packet and RFC reasoning with immediate explanations", async () => {
    const user = userEvent.setup();
    render(<AdvancedValidationLab checks={troubleshootingValidationChecks} progressItemId="capstone_pro_validation" />);
    expect(screen.getByText(/SYN retransmission/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /RFC 9293/i })).toHaveAttribute("href", expect.stringContaining("rfc-editor.org"));
    expect(screen.getByRole("button", { name: /check advanced decision/i })).toBeDisabled();
    await user.click(screen.getByLabelText(/return path bypasses/i));
    await user.click(screen.getByRole("button", { name: /check advanced decision/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/stateful inspection/i);
    for (let index = 1; index < troubleshootingValidationChecks.length; index += 1) {
      await user.selectOptions(screen.getByLabelText("Check"), String(index));
      await user.click(screen.getAllByRole("radio")[0]);
      await user.click(screen.getByRole("button", { name: /check advanced decision/i }));
    }
    expect(markTerminalStateReached).toHaveBeenCalled();
  });
});
