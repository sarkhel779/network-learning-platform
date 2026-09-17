import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), listLearners: vi.fn() }));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({ listLearners: mocks.listLearners }));

import UsersPage from "./page";

describe("admin users page", () => {
  it("shows a searchable directory without claiming an unavailable list is empty", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff-1" }, role: "support_agent" });
    mocks.listLearners.mockRejectedValueOnce(new Error("offline"));
    const html = renderToStaticMarkup(await UsersPage({ searchParams: Promise.resolve({ q: "Ada" }) }));
    expect(mocks.requireStaff).toHaveBeenCalledWith("users_read");
    expect(html).toContain("Search learners");
    expect(html).toContain("temporarily unavailable");
    expect(html).not.toContain("No learners found");
  });

  it("lists learners without a waitlist column", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff-1" }, role: "support_agent" });
    mocks.listLearners.mockResolvedValue({
      total: 1,
      rows: [{ id: "00000000-0000-4000-8000-000000000102", email: "ada@example.test", displayName: "Ada", learningLevel: "beginner", createdAt: "2026-09-17T00:00:00Z", waitlistStatus: "joined" }],
    });
    const html = renderToStaticMarkup(await UsersPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain("Ada");
    expect(html).not.toContain("Waitlist");
    expect(html).not.toContain("Not joined");
    expect(html).not.toContain("Unsubscribed");
  });
});
