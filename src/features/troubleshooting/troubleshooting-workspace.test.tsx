import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { guidedBranchPortalIncident } from "./troubleshooting-scenarios";
import { TroubleshootingWorkspace } from "./troubleshooting-workspace";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({ useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }) }));

beforeEach(() => markTerminalStateReached.mockClear());
afterEach(cleanup);

describe("TroubleshootingWorkspace", () => {
  it("explains premature remediation and records incorrect tests", async () => {
    const user = userEvent.setup();
    render(<TroubleshootingWorkspace scenario={guidedBranchPortalIncident} progressItemId="capstone" guidance="guided" />);
    await user.click(screen.getByRole("button", { name: /move Gi1\/0\/18 to VLAN 20/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/evidence/i);

    await user.click(screen.getByLabelText(/more-specific route overrides/i));
    await user.click(screen.getByLabelText(/route lookup selects the retired WAN next hop/i));
    await user.click(screen.getByLabelText(/overconfident/i));
    await user.click(screen.getByRole("button", { name: /inspect client switchport/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/does not support/i);
    expect(screen.getByRole("list", { name: /incident timeline/i })).toHaveTextContent(/incorrect/i);
    expect(markTerminalStateReached).not.toHaveBeenCalled();
  });

  it("unlocks sequential faults and completes only after restoration", async () => {
    const user = userEvent.setup();
    render(<TroubleshootingWorkspace scenario={guidedBranchPortalIncident} progressItemId="capstone" guidance="guided" />);
    for (const step of [
      [/access port is in the wrong VLAN/i, /switchport VLAN differs/i, /inspect client switchport/i, /move Gi1\/0\/18 to VLAN 20/i],
      [/more-specific route overrides/i, /route lookup selects/i, /look up the portal route/i, /remove the stale \/32 route/i],
      [/resolver has stale portal data/i, /DNS returns the old server/i, /resolve the portal name/i, /update and flush the portal record/i],
    ] as const) {
      await user.click(screen.getByLabelText(step[0]));
      await user.click(screen.getByLabelText(step[1]));
      await user.click(screen.getByLabelText(/calibrated/i));
      await user.click(screen.getByRole("button", { name: step[2] }));
      await user.click(screen.getByRole("button", { name: step[3] }));
    }
    await user.click(screen.getByRole("button", { name: /close incident/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/restoration/i);
    expect(markTerminalStateReached).not.toHaveBeenCalled();

    for (const check of guidedBranchPortalIncident.restorationChecks) await user.click(screen.getByLabelText(check.label));
    await user.click(screen.getByRole("button", { name: /close incident/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/incident resolved/i);
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
  });
});
