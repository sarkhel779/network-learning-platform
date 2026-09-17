import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createServerSupabaseClient: vi.fn(), rpc: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.createServerSupabaseClient }));

import { addSupportTicketMessage, createSupportTicket, getMySupportTicket, listMySupportTickets } from "./support.repository";

beforeEach(() => {
  mocks.rpc.mockReset();
  mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
});

describe("support repository", () => {
  it("creates a ticket through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { id: 1 }, error: null });
    await expect(createSupportTicket("Login issue", "I cannot sign in.")).resolves.toEqual({ id: 1 });
    expect(mocks.rpc).toHaveBeenCalledWith("create_support_ticket", { p_subject: "Login issue", p_body: "I cannot sign in." });
  });

  it("surfaces a ticket creation failure", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "invalid_subject" } });
    await expect(createSupportTicket("", "body")).rejects.toThrow("Support ticket could not be created");
  });

  it("lists only the caller's own tickets through a guarded RPC", async () => {
    const tickets = [{ id: 1, subject: "Login issue", status: "open", createdAt: "2026-09-17T00:00:00Z", updatedAt: "2026-09-17T00:00:00Z" }];
    mocks.rpc.mockResolvedValue({ data: tickets, error: null });
    await expect(listMySupportTickets()).resolves.toEqual(tickets);
    expect(mocks.rpc).toHaveBeenCalledWith("list_my_support_tickets");
  });

  it("loads one owned ticket with its thread through a guarded RPC", async () => {
    const ticket = { id: 1, subject: "Login issue", status: "open", createdAt: "2026-09-17T00:00:00Z", updatedAt: "2026-09-17T00:00:00Z", messages: [] };
    mocks.rpc.mockResolvedValue({ data: ticket, error: null });
    await expect(getMySupportTicket(1)).resolves.toEqual(ticket);
    expect(mocks.rpc).toHaveBeenCalledWith("get_my_support_ticket", { p_ticket_id: 1 });
  });

  it("returns null for a ticket that is missing or not owned by the caller", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "ticket_not_found" } });
    await expect(getMySupportTicket(999)).resolves.toBeNull();
  });

  it("adds a message to an owned ticket through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { ticketId: 1 }, error: null });
    await expect(addSupportTicketMessage(1, "Still broken, please help.")).resolves.toBeUndefined();
    expect(mocks.rpc).toHaveBeenCalledWith("add_support_ticket_message", { p_ticket_id: 1, p_body: "Still broken, please help." });
  });

  it("surfaces a not-found failure distinctly when replying", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "ticket_not_found" } });
    await expect(addSupportTicketMessage(999, "Hello")).rejects.toThrow("ticket_not_found");
  });
});
