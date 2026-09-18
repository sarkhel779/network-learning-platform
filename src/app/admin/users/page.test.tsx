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

  it("lists learners without a per-row waitlist column", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff-1" }, role: "support_agent" });
    mocks.listLearners.mockResolvedValue({
      total: 1,
      rows: [{ id: "00000000-0000-4000-8000-000000000102", email: "ada@example.test", displayName: "Ada", learningLevel: "beginner", createdAt: "2026-09-17T00:00:00Z", waitlistStatus: "joined" }],
    });
    const html = renderToStaticMarkup(await UsersPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain("Ada");
    expect(html).not.toContain("<th scope=\"col\">Waitlist</th>");
    expect(html).not.toContain("Not joined");
  });

  it("renders waitlist status and joined date range filters beside the search button", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff-1" }, role: "support_agent" });
    mocks.listLearners.mockResolvedValue({ total: 0, rows: [] });
    const html = renderToStaticMarkup(await UsersPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain("admin-search__filters");
    expect(html).toContain("Never joined");
    expect(html).toContain("Joined from");
    expect(html).toContain("Joined to");
  });

  it("passes valid filter query params through to the directory query", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff-1" }, role: "support_agent" });
    mocks.listLearners.mockResolvedValue({ total: 0, rows: [] });
    await UsersPage({ searchParams: Promise.resolve({ waitlist: "joined", from: "2026-09-01", to: "2026-09-07" }) });
    expect(mocks.listLearners).toHaveBeenCalledWith({
      query: "", offset: 0, limit: 20, waitlistStatus: "joined", joinedFrom: "2026-09-01T00:00:00.000Z", joinedTo: "2026-09-08T00:00:00.000Z",
    });
  });

  it("ignores an invalid waitlist status or malformed date instead of passing it through", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff-1" }, role: "support_agent" });
    mocks.listLearners.mockResolvedValue({ total: 0, rows: [] });
    await UsersPage({ searchParams: Promise.resolve({ waitlist: "forged", from: "not-a-date" }) });
    expect(mocks.listLearners).toHaveBeenCalledWith({
      query: "", offset: 0, limit: 20, waitlistStatus: undefined, joinedFrom: undefined, joinedTo: undefined,
    });
  });
});
