import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ addSupportTicketMessageAction: vi.fn() }));
vi.mock("@/app/support/actions", () => ({ addSupportTicketMessageAction: mocks.addSupportTicketMessageAction }));

import { SupportReplyForm } from "./support-reply-form";

afterEach(cleanup);

beforeEach(() => {
  mocks.addSupportTicketMessageAction.mockReset();
});

describe("SupportReplyForm", () => {
  it("submits the ticket id and reply body", async () => {
    mocks.addSupportTicketMessageAction.mockResolvedValue({ ok: true, message: "Reply sent." });
    render(<SupportReplyForm ticketId={7} />);
    fireEvent.change(screen.getByLabelText("Reply"), { target: { value: "Still broken, please help." } });
    fireEvent.click(screen.getByRole("button", { name: "Send reply" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Reply sent.");
    const formData = mocks.addSupportTicketMessageAction.mock.calls[0][0] as FormData;
    expect(formData.get("ticketId")).toBe("7");
    expect(formData.get("body")).toBe("Still broken, please help.");
  });

  it("surfaces a failed reply as an alert", async () => {
    mocks.addSupportTicketMessageAction.mockResolvedValue({ ok: false, message: "Your reply could not be sent." });
    render(<SupportReplyForm ticketId={7} />);
    fireEvent.change(screen.getByLabelText("Reply"), { target: { value: "Still broken." } });
    fireEvent.click(screen.getByRole("button", { name: "Send reply" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be sent");
  });
});
