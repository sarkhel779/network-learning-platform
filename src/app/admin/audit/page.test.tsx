import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), listAudit: vi.fn() }));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({ listAudit: mocks.listAudit }));

import AuditPage from "./page";

describe("admin audit page", () => {
  it("renders a read-only log after checking audit permission", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "support_agent" });
    mocks.listAudit.mockResolvedValue({ total: 1, rows: [{ id: 8, action: "learner_profile_updated", actorId: "staff", targetId: "learner", createdAt: "2026-09-12T00:00:00Z", beforeValue: null, afterValue: { displayName: "Ada" } }] });
    const html = renderToStaticMarkup(await AuditPage({ searchParams: Promise.resolve({}) }));
    expect(mocks.requireStaff).toHaveBeenCalledWith("audit");
    expect(html).toContain("learner_profile_updated");
    expect(html).not.toContain("Delete event");
  });
});
