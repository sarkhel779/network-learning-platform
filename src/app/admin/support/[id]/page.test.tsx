import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), getSupportTicket: vi.fn() }));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({ getSupportTicket: mocks.getSupportTicket }));
vi.mock("@/features/admin/support-ticket-panel", () => ({ SupportTicketPanel: () => <p>Reply panel</p> }));

import SupportTicketDetailPage from "./page";

beforeEach(() => {
  mocks.requireStaff.mockReset();
  mocks.getSupportTicket.mockReset();
});

describe("admin support ticket detail", () => {
  it("gates access before loading a ticket", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "support_agent" });
    mocks.getSupportTicket.mockResolvedValue(null);
    await expect(SupportTicketDetailPage({ params: Promise.resolve({ id: "1" }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(mocks.requireStaff).toHaveBeenCalledWith("support");
  });

  it("404s for a non-numeric id", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "support_agent" });
    await expect(SupportTicketDetailPage({ params: Promise.resolve({ id: "not-a-number" }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(mocks.getSupportTicket).not.toHaveBeenCalled();
  });

  it("shows the ticket, learner email, and full thread", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "support_agent" });
    mocks.getSupportTicket.mockResolvedValue({
      id: 1, subject: "Login issue", status: "open", learnerId: "learner-1", learnerEmail: "ada@example.test",
      createdAt: "2026-09-17T00:00:00Z", updatedAt: "2026-09-17T00:00:00Z",
      messages: [{ id: 1, isStaff: false, body: "I cannot sign in.", createdAt: "2026-09-17T00:00:00Z" }],
    });
    render(await SupportTicketDetailPage({ params: Promise.resolve({ id: "1" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "Login issue" })).toBeVisible();
    expect(screen.getByText("ada@example.test")).toBeVisible();
    expect(screen.getByText("I cannot sign in.")).toBeVisible();
    expect(screen.getByText("Reply panel")).toBeVisible();
  });

  it("does not 404 when the repository is unavailable", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "support_agent" });
    mocks.getSupportTicket.mockRejectedValue(new Error("offline"));
    render(await SupportTicketDetailPage({ params: Promise.resolve({ id: "1" }) }));
    expect(screen.getByRole("status")).toHaveTextContent("could not be loaded");
  });
});
