import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), listSupportTickets: vi.fn() }));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({ listSupportTickets: mocks.listSupportTickets }));

import SupportPage from "./page";

describe("admin support page", () => {
  it("shows the ticket queue without claiming an unavailable list is empty", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff-1" }, role: "support_agent" });
    mocks.listSupportTickets.mockRejectedValueOnce(new Error("offline"));
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({}) }));
    expect(mocks.requireStaff).toHaveBeenCalledWith("support");
    expect(html).toContain("temporarily unavailable");
    expect(html).not.toContain("No tickets found");
  });

  it("lists tickets with the learner's email and a status filter", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff-1" }, role: "support_agent" });
    mocks.listSupportTickets.mockResolvedValue({
      total: 1,
      rows: [{ id: 1, subject: "Login issue", status: "open", learnerId: "learner-1", learnerEmail: "ada@example.test", createdAt: "2026-09-17T00:00:00Z", updatedAt: "2026-09-17T00:00:00Z" }],
    });
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({ status: "open" }) }));
    expect(mocks.listSupportTickets).toHaveBeenCalledWith({ status: "open", offset: 0, limit: 20 });
    expect(html).toContain("Login issue");
    expect(html).toContain("ada@example.test");
  });

  it("ignores an unrecognized status filter", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff-1" }, role: "support_agent" });
    mocks.listSupportTickets.mockResolvedValue({ total: 0, rows: [] });
    await SupportPage({ searchParams: Promise.resolve({ status: "archived" }) });
    expect(mocks.listSupportTickets).toHaveBeenCalledWith({ status: undefined, offset: 0, limit: 20 });
  });
});
