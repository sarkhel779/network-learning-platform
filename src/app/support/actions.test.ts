import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getViewer: vi.fn(),
  createSupportTicket: vi.fn(),
  addSupportTicketMessage: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/session", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/features/support/support.repository", () => ({
  createSupportTicket: mocks.createSupportTicket,
  addSupportTicketMessage: mocks.addSupportTicketMessage,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { addSupportTicketMessageAction, createSupportTicketAction } from "./actions";

beforeEach(() => {
  mocks.getViewer.mockReset();
  mocks.createSupportTicket.mockReset();
  mocks.addSupportTicketMessage.mockReset();
  mocks.revalidatePath.mockReset();
  mocks.getViewer.mockResolvedValue({ id: "learner-1", displayName: "Ada", avatarUrl: null });
});

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("create support ticket action", () => {
  it("requires a signed-in viewer", async () => {
    mocks.getViewer.mockResolvedValue(null);
    const result = await createSupportTicketAction(form({ subject: "Login issue", body: "I cannot sign in." }));
    expect(result.ok).toBe(false);
    expect(mocks.createSupportTicket).not.toHaveBeenCalled();
  });

  it("rejects an empty subject without calling the database", async () => {
    const result = await createSupportTicketAction(form({ subject: "   ", body: "I cannot sign in." }));
    expect(result.ok).toBe(false);
    expect(mocks.createSupportTicket).not.toHaveBeenCalled();
  });

  it("creates the ticket and returns its id for redirection", async () => {
    mocks.createSupportTicket.mockResolvedValue({ id: 42 });
    const result = await createSupportTicketAction(form({ subject: "Login issue", body: "I cannot sign in." }));
    expect(result).toEqual({ ok: true, message: "Your ticket has been submitted.", ticketId: 42 });
    expect(mocks.createSupportTicket).toHaveBeenCalledWith("Login issue", "I cannot sign in.");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/support");
  });

  it("surfaces a database failure without a false success", async () => {
    mocks.createSupportTicket.mockRejectedValue(new Error("offline"));
    const result = await createSupportTicketAction(form({ subject: "Login issue", body: "I cannot sign in." }));
    expect(result.ok).toBe(false);
  });
});

describe("add support ticket message action", () => {
  it("requires a signed-in viewer", async () => {
    mocks.getViewer.mockResolvedValue(null);
    const result = await addSupportTicketMessageAction(form({ ticketId: "1", body: "Still broken." }));
    expect(result.ok).toBe(false);
    expect(mocks.addSupportTicketMessage).not.toHaveBeenCalled();
  });

  it("rejects a non-positive ticket id without calling the database", async () => {
    const result = await addSupportTicketMessageAction(form({ ticketId: "0", body: "Still broken." }));
    expect(result.ok).toBe(false);
    expect(mocks.addSupportTicketMessage).not.toHaveBeenCalled();
  });

  it("adds the message and revalidates the ticket page", async () => {
    mocks.addSupportTicketMessage.mockResolvedValue(undefined);
    const result = await addSupportTicketMessageAction(form({ ticketId: "1", body: "Still broken." }));
    expect(result.ok).toBe(true);
    expect(mocks.addSupportTicketMessage).toHaveBeenCalledWith(1, "Still broken.");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/support/1");
  });

  it("surfaces a database failure without a false success", async () => {
    mocks.addSupportTicketMessage.mockRejectedValue(new Error("ticket_not_found"));
    const result = await addSupportTicketMessageAction(form({ ticketId: "1", body: "Still broken." }));
    expect(result.ok).toBe(false);
  });
});
