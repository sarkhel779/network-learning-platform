import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createSupportTicketAction: vi.fn(), push: vi.fn() }));
vi.mock("@/app/support/actions", () => ({ createSupportTicketAction: mocks.createSupportTicketAction }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));

import { SupportTicketForm } from "./support-ticket-form";

afterEach(cleanup);

beforeEach(() => {
  mocks.createSupportTicketAction.mockReset();
  mocks.push.mockReset();
});

describe("SupportTicketForm", () => {
  it("submits the subject and body and navigates to the new ticket on success", async () => {
    mocks.createSupportTicketAction.mockResolvedValue({ ok: true, message: "Your ticket has been submitted.", ticketId: 42 });
    render(<SupportTicketForm />);
    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Login issue" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "I cannot sign in." } });
    fireEvent.click(screen.getByRole("button", { name: "Submit ticket" }));
    await vi.waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/support/42"));
    const formData = mocks.createSupportTicketAction.mock.calls[0][0] as FormData;
    expect(formData.get("subject")).toBe("Login issue");
    expect(formData.get("body")).toBe("I cannot sign in.");
  });

  it("surfaces a failed submission as an alert instead of navigating", async () => {
    mocks.createSupportTicketAction.mockResolvedValue({ ok: false, message: "Your ticket could not be submitted. Please try again." });
    render(<SupportTicketForm />);
    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Login issue" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "I cannot sign in." } });
    fireEvent.click(screen.getByRole("button", { name: "Submit ticket" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be submitted");
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
