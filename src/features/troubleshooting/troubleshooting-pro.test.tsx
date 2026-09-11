import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdvancedValidationLab, troubleshootingValidationChecks } from "./advanced-validation-lab";
import { IncidentReportBuilder } from "./incident-report-builder";
import { createIncidentState } from "./troubleshooting-engine";
import { proBranchPortalIncident } from "./troubleshooting-scenarios";

afterEach(cleanup);

describe("Pro troubleshooting exercises", () => {
  it("requires every incident-report section and evidence", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<IncidentReportBuilder state={createIncidentState(proBranchPortalIncident)} scenario={proBranchPortalIncident} onSubmit={onSubmit} />);
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
    expect(screen.getByRole("status")).toHaveTextContent(/report submitted/i);
  });

  it("checks advanced packet and RFC reasoning with immediate explanations", async () => {
    const user = userEvent.setup();
    render(<AdvancedValidationLab checks={troubleshootingValidationChecks} />);
    expect(screen.getByText(/SYN retransmission/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /RFC 9293/i })).toHaveAttribute("href", expect.stringContaining("rfc-editor.org"));
    expect(screen.getByRole("button", { name: /check advanced decision/i })).toBeDisabled();
    await user.click(screen.getByLabelText(/return path bypasses/i));
    await user.click(screen.getByRole("button", { name: /check advanced decision/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/stateful inspection/i);
  });
});
