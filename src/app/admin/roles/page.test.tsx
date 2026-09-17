import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), listStaff: vi.fn() }));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({ listStaff: mocks.listStaff }));

import RolesPage from "./page";

describe("admin roles page", () => {
  it("shows the staff directory and an assignment form for an authorized viewer", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "00000000-0000-4000-8000-000000000301" }, role: "super_admin" });
    mocks.listStaff.mockResolvedValue([
      { userId: "00000000-0000-4000-8000-000000000301", email: "you@example.test", role: "super_admin", assignedBy: null, createdAt: "2026-09-17T00:00:00Z" },
      { userId: "00000000-0000-4000-8000-000000000302", email: "teammate@example.test", role: "support_agent", assignedBy: "00000000-0000-4000-8000-000000000301", createdAt: "2026-09-17T00:00:00Z" },
    ]);
    const html = renderToStaticMarkup(await RolesPage());
    expect(mocks.requireStaff).toHaveBeenCalledWith("roles");
    expect(html).toContain("Assign a role");
    expect(html).toContain("you@example.test");
    expect(html).toContain("teammate@example.test");
    expect(html).toContain("This is you");
    expect(html).toContain("Revoke access");
  });

  it("does not claim an unavailable directory is empty", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff-1" }, role: "super_admin" });
    mocks.listStaff.mockRejectedValueOnce(new Error("offline"));
    const html = renderToStaticMarkup(await RolesPage());
    expect(html).toContain("temporarily unavailable");
    expect(html).not.toContain("Assign a role");
  });
});
