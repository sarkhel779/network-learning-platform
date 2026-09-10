import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { troubleshootingCases } from "./troubleshooting-cases";
import { ServiceTroubleshootingLab } from "./service-troubleshooting-lab";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({ useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }) }));

beforeEach(() => markTerminalStateReached.mockClear());
afterEach(cleanup);

describe("ServiceTroubleshootingLab", () => {
  it("provides two validated cases for each service", () => {
    for (const cases of Object.values(troubleshootingCases)) expect(cases).toHaveLength(2);
  });

  it("immediately explains a wrong answer and still records the attempt", async () => {
    const user = userEvent.setup();
    render(<ServiceTroubleshootingLab progressItemId="essential_services_troubleshooting_email" service="email" />);
    await user.click(screen.getByLabelText("Restart the IMAP mailbox"));
    await user.click(screen.getByRole("button", { name: "Check diagnosis" }));
    expect(screen.getByRole("status")).toHaveTextContent(/not the best diagnosis/i);
    expect(screen.getByText(/simplified explanation/i)).toBeVisible();
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
  });

  it("keeps confidence separate and retries the exercise without erasing completion", async () => {
    const user = userEvent.setup();
    render(<ServiceTroubleshootingLab progressItemId="essential_services_troubleshooting_web" service="web" />);
    await user.click(screen.getByLabelText("Confident"));
    await user.click(screen.getAllByRole("radio", { name: /Check the redirect target/ })[0]);
    await user.click(screen.getByRole("button", { name: "Check diagnosis" }));
    expect(screen.getByText(/Confidence: confident/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Try this case again" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
  });
});
