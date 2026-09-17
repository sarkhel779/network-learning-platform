import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ replySupportTicketAction: vi.fn(), setSupportTicketStatusAction: vi.fn() }));
vi.mock("@/app/admin/support/[id]/actions", () => ({
  replySupportTicketAction: mocks.replySupportTicketAction,
  setSupportTicketStatusAction: mocks.setSupportTicketStatusAction,
}));

import { SupportTicketPanel } from "./support-ticket-panel";

afterEach(cleanup);

beforeEach(() => {
  mocks.replySupportTicketAction.mockReset();
  mocks.setSupportTicketStatusAction.mockReset();
});

describe("SupportTicketPanel", () => {
  it("submits a reply for the given ticket", async () => {
    mocks.replySupportTicketAction.mockResolvedValue({ ok: true, message: "Reply sent." });
    render(<SupportTicketPanel ticketId={1} status="open" />);
    fireEvent.change(screen.getByLabelText("Message to learner"), { target: { value: "We are looking into this." } });
    fireEvent.click(screen.getByRole("button", { name: "Send reply" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Reply sent.");
    const formData = mocks.replySupportTicketAction.mock.calls[0][0] as FormData;
    expect(formData.get("ticketId")).toBe("1");
    expect(formData.get("body")).toBe("We are looking into this.");
  });

  it("disables the current status and lets staff move to another one", async () => {
    mocks.setSupportTicketStatusAction.mockResolvedValue({ ok: true, message: "Status updated." });
    render(<SupportTicketPanel ticketId={1} status="open" />);
    expect(screen.getByRole("button", { name: "Open" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Resolved" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Status updated.");
    const formData = mocks.setSupportTicketStatusAction.mock.calls[0][0] as FormData;
    expect(formData.get("ticketId")).toBe("1");
    expect(formData.get("status")).toBe("resolved");
  });

  it("surfaces a failed reply as an alert", async () => {
    mocks.replySupportTicketAction.mockResolvedValue({ ok: false, message: "Reply could not be sent." });
    render(<SupportTicketPanel ticketId={1} status="open" />);
    fireEvent.change(screen.getByLabelText("Message to learner"), { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: "Send reply" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be sent");
  });
});
