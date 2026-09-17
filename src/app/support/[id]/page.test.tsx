import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getViewer: vi.fn(), getMySupportTicket: vi.fn(), redirect: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/session", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/features/support/support.repository", () => ({ getMySupportTicket: mocks.getMySupportTicket }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  redirect: mocks.redirect,
}));

import SupportTicketPage from "./page";

describe("support ticket detail page", () => {
  it("sends anonymous visitors to sign-in and returns them to this ticket", async () => {
    mocks.getViewer.mockResolvedValue(null);
    mocks.redirect.mockImplementation((destination: string) => { throw new Error(`REDIRECT:${destination}`); });
    await expect(SupportTicketPage({ params: Promise.resolve({ id: "1" }) })).rejects.toThrow("REDIRECT:/sign-in?returnTo=%2Fsupport");
    expect(mocks.getMySupportTicket).not.toHaveBeenCalled();
  });

  it("404s for a non-numeric id", async () => {
    mocks.getViewer.mockResolvedValue({ id: "learner-1", displayName: "Ada", avatarUrl: null });
    await expect(SupportTicketPage({ params: Promise.resolve({ id: "not-a-number" }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("404s for a ticket that does not exist or is not owned by the viewer", async () => {
    mocks.getViewer.mockResolvedValue({ id: "learner-1", displayName: "Ada", avatarUrl: null });
    mocks.getMySupportTicket.mockResolvedValue(null);
    await expect(SupportTicketPage({ params: Promise.resolve({ id: "999" }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("shows the ticket subject, status, and full thread", async () => {
    mocks.getViewer.mockResolvedValue({ id: "learner-1", displayName: "Ada", avatarUrl: null });
    mocks.getMySupportTicket.mockResolvedValue({
      id: 1, subject: "Login issue", status: "in_progress",
      createdAt: "2026-09-17T00:00:00Z", updatedAt: "2026-09-17T00:00:00Z",
      messages: [
        { id: 1, isStaff: false, body: "I cannot sign in.", createdAt: "2026-09-17T00:00:00Z" },
        { id: 2, isStaff: true, body: "We are looking into this.", createdAt: "2026-09-17T00:05:00Z" },
      ],
    });
    render(await SupportTicketPage({ params: Promise.resolve({ id: "1" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "Login issue" })).toBeVisible();
    expect(screen.getByText("In progress")).toBeVisible();
    expect(screen.getByText("I cannot sign in.")).toBeVisible();
    expect(screen.getByText("We are looking into this.")).toBeVisible();
    expect(screen.getByLabelText("Reply")).toBeVisible();
  });

  it("does not 404 when the repository is unavailable", async () => {
    mocks.getViewer.mockResolvedValue({ id: "learner-1", displayName: "Ada", avatarUrl: null });
    mocks.getMySupportTicket.mockRejectedValue(new Error("offline"));
    render(await SupportTicketPage({ params: Promise.resolve({ id: "1" }) }));
    expect(screen.getByRole("status")).toHaveTextContent("could not be loaded");
  });
});
