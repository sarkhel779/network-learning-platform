import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { guidedBranchPortalIncident } from "./troubleshooting-scenarios";
import { TroubleshootingWorkspace } from "./troubleshooting-workspace";

const markTerminalStateReached = vi.fn();
const restartLesson = vi.fn(async () => undefined);
vi.mock("@/features/progress/progress-completion-boundary", () => ({ useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }) }));
vi.mock("@/features/progress/lesson-progress-context", () => ({ useOptionalLessonProgress: () => ({ learnerAttemptKey: "learner:lesson:attempt-1", restartLesson }) }));

beforeEach(() => { markTerminalStateReached.mockClear(); restartLesson.mockClear(); localStorage.clear(); });
afterEach(cleanup);

describe("TroubleshootingWorkspace", () => {
  it("restarts only the incident without resetting lesson quiz completion", async () => {
    const user = userEvent.setup();
    render(<TroubleshootingWorkspace scenario={guidedBranchPortalIncident} progressItemId="capstone" guidance="guided" />);
    await user.click(screen.getByRole("button", { name: /restart incident/i }));
    expect(restartLesson).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(/incident restarted/i);
  });
  it("explains premature remediation and records incorrect tests", async () => {
    const user = userEvent.setup();
    render(<TroubleshootingWorkspace scenario={guidedBranchPortalIncident} progressItemId="capstone" guidance="guided" />);
    expect(screen.queryByRole("button", { name: /look up the portal route/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verify portal response/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /remove the stale \/32 route/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /confirm incident scope/i }));
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
    await user.click(screen.getByRole("button", { name: /confirm incident scope/i }));
    for (const step of [
      [/access port is in the wrong VLAN/i, /switchport VLAN differs/i, /inspect client switchport/i, /move Gi1\/0\/18 to VLAN 20/i],
      [/more-specific route overrides/i, /route lookup selects/i, /look up the portal route/i, /remove the stale \/32 route/i],
      [/resolver has stale portal data/i, /DNS returns the old server/i, /resolve the portal name/i, /update and flush the portal record/i],
    ] as const) {
      await user.click(screen.getByLabelText(step[0]));
      await user.click(screen.getByLabelText(step[1]));
      await user.click(screen.getByLabelText(/calibrated/i));
      await user.click(screen.getByRole("button", { name: step[2] }));
      await user.click(screen.getByRole("button", { name: /evidence supports hypothesis/i }));
      await user.click(screen.getByRole("button", { name: step[3] }));
    }
    await user.click(screen.getByRole("button", { name: /close incident/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/restoration/i);
    expect(markTerminalStateReached).toHaveBeenCalledTimes(3);

    for (const check of guidedBranchPortalIncident.restorationChecks) await user.click(screen.getByRole("button", { name: new RegExp(`run verification: ${check.label}`, "i") }));
    expect(screen.getByRole("status")).toHaveTextContent(/HTTP\/2 200 OK/i);
    await user.click(screen.getByRole("button", { name: /close incident/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/incident resolved/i);
    expect(markTerminalStateReached).toHaveBeenCalledTimes(5);
  });
});
