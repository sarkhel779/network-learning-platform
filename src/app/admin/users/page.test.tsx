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
});
