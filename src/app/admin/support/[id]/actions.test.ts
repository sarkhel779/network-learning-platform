import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireStaff: vi.fn(),
  replySupportTicket: vi.fn(),
  setSupportTicketStatus: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({
  replySupportTicket: mocks.replySupportTicket,
  setSupportTicketStatus: mocks.setSupportTicketStatus,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { replySupportTicketAction, setSupportTicketStatusAction } from "./actions";

beforeEach(() => {
  mocks.requireStaff.mockReset();
  mocks.replySupportTicket.mockReset();
  mocks.setSupportTicketStatus.mockReset();
  mocks.revalidatePath.mockReset();
  mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "support_agent" });
});

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("reply support ticket action", () => {
  it("rejects an empty reply without calling the database", async () => {
    const result = await replySupportTicketAction(form({ ticketId: "1", body: "   " }));
    expect(result.ok).toBe(false);
    expect(mocks.replySupportTicket).not.toHaveBeenCalled();
  });

  it("reauthorizes, sends the reply, and revalidates both the ticket and the queue", async () => {
    mocks.replySupportTicket.mockResolvedValue(undefined);
    const result = await replySupportTicketAction(form({ ticketId: "1", body: "We are looking into this." }));
    expect(result.ok).toBe(true);
    expect(mocks.requireStaff).toHaveBeenCalledWith("support");
    expect(mocks.replySupportTicket).toHaveBeenCalledWith(1, "We are looking into this.");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/support/1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/support");
  });

  it("surfaces a database failure without a false success", async () => {
    mocks.replySupportTicket.mockRejectedValue(new Error("ticket_not_found"));
    const result = await replySupportTicketAction(form({ ticketId: "1", body: "Hello" }));
    expect(result.ok).toBe(false);
  });
});

describe("set support ticket status action", () => {
  it("rejects an unrecognized status without calling the database", async () => {
    const result = await setSupportTicketStatusAction(form({ ticketId: "1", status: "archived" }));
    expect(result.ok).toBe(false);
    expect(mocks.setSupportTicketStatus).not.toHaveBeenCalled();
  });

  it("reauthorizes, updates the status, and revalidates both the ticket and the queue", async () => {
    mocks.setSupportTicketStatus.mockResolvedValue(undefined);
    const result = await setSupportTicketStatusAction(form({ ticketId: "1", status: "resolved" }));
    expect(result.ok).toBe(true);
    expect(mocks.requireStaff).toHaveBeenCalledWith("support");
    expect(mocks.setSupportTicketStatus).toHaveBeenCalledWith(1, "resolved");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/support/1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/support");
  });

  it("surfaces a database failure without a false success", async () => {
    mocks.setSupportTicketStatus.mockRejectedValue(new Error("ticket_not_found"));
    const result = await setSupportTicketStatusAction(form({ ticketId: "1", status: "resolved" }));
    expect(result.ok).toBe(false);
  });
});
