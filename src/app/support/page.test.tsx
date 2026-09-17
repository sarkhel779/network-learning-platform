import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getViewer: vi.fn(), listMySupportTickets: vi.fn(), redirect: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/session", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/features/support/support.repository", () => ({ listMySupportTickets: mocks.listMySupportTickets }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect, useRouter: () => ({ push: vi.fn() }) }));

import SupportPage from "./page";

describe("support page", () => {
  it("sends anonymous visitors to sign-in and returns them to support", async () => {
    mocks.getViewer.mockResolvedValue(null);
    mocks.redirect.mockImplementation((destination: string) => { throw new Error(`REDIRECT:${destination}`); });
    await expect(SupportPage()).rejects.toThrow("REDIRECT:/sign-in?returnTo=%2Fsupport");
    expect(mocks.listMySupportTickets).not.toHaveBeenCalled();
  });

  it("lists the learner's own tickets and offers a new-ticket form", async () => {
    mocks.getViewer.mockResolvedValue({ id: "learner-1", displayName: "Ada", avatarUrl: null });
    mocks.listMySupportTickets.mockResolvedValue([
      { id: 1, subject: "Login issue", status: "open", createdAt: "2026-09-17T00:00:00Z", updatedAt: "2026-09-17T00:00:00Z" },
    ]);
    const html = renderToStaticMarkup(await SupportPage());
    expect(html).toContain("Login issue");
    expect(html).toContain("Open");
    expect(html).toContain("Start a new ticket");
  });

  it("does not claim an unavailable ticket list is empty", async () => {
    mocks.getViewer.mockResolvedValue({ id: "learner-1", displayName: "Ada", avatarUrl: null });
    mocks.listMySupportTickets.mockRejectedValueOnce(new Error("offline"));
    const html = renderToStaticMarkup(await SupportPage());
    expect(html).toContain("could not be loaded");
    expect(html).not.toContain("have not submitted");
  });
});
