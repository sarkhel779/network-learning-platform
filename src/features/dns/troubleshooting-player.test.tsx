import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DnsTroubleshootingPlayer } from "./troubleshooting-player";

const markTerminalStateReached = vi.fn();
vi.mock("@/features/progress/progress-completion-boundary", () => ({
  useProgressCompletionBoundary: () => ({ markTerminalStateReached, state: "idle", retry: vi.fn() }),
}));

beforeEach(() => markTerminalStateReached.mockClear());
afterEach(cleanup);

describe("DnsTroubleshootingPlayer", () => {
  it("shows only public practice to a visitor and waits for submission", () => {
    render(<DnsTroubleshootingPlayer access="public" />);
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.queryByText(/incorrect|correct/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /check diagnosis/i })).toBeDisabled();
    expect(screen.queryByLabelText(/choose a dns incident/i)).not.toBeInTheDocument();
  });

  it("records an incorrect account answer as an attempt and explains it immediately", async () => {
    const user = userEvent.setup();
    render(<DnsTroubleshootingPlayer access="account" progressItemId="dns_name_resolution_interactive_troubleshooting" />);
    await user.selectOptions(screen.getByLabelText(/choose a dns incident/i), "resolver-timeout");
    await user.click(screen.getByLabelText("NXDOMAIN response"));
    await user.click(screen.getByRole("button", { name: /check diagnosis/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/incorrect/i);
    expect(screen.getByRole("status")).toHaveTextContent(/no DNS response/i);
    expect(screen.getByRole("status")).toHaveTextContent(/next step/i);
    expect(markTerminalStateReached).toHaveBeenCalledOnce();
  });

  it("clears a previous choice and result when the incident changes", async () => {
    const user = userEvent.setup();
    render(<DnsTroubleshootingPlayer access="account" />);
    await user.click(screen.getAllByRole("radio")[0]);
    await user.click(screen.getByRole("button", { name: /check diagnosis/i }));
    expect(screen.getByRole("status")).toBeVisible();
    await user.selectOptions(screen.getByLabelText(/choose a dns incident/i), "valid-ttl");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /check diagnosis/i })).toBeDisabled();
  });

  it("announces every repeated submission without duplicating visible feedback", async () => {
    const user = userEvent.setup();
    render(<DnsTroubleshootingPlayer access="public" />);
    await user.click(screen.getByRole("radio", { name: /name exists/i }));
    const submit = screen.getByRole("button", { name: /check diagnosis/i });
    await user.click(submit);
    const first = screen.getByRole("status").getAttribute("data-announcement-id");
    await user.click(submit);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status").getAttribute("data-announcement-id")).not.toBe(first);
  });
});
