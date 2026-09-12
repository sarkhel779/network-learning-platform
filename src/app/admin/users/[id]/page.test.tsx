import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), getLearnerDetail: vi.fn() }));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff, canStaff: () => true }));
vi.mock("@/features/admin/admin.repository", () => ({ getLearnerDetail: mocks.getLearnerDetail }));
vi.mock("@/features/admin/learner-editor", () => ({ LearnerEditor: () => <p>Profile editor</p> }));

import LearnerDetailPage from "./page";

describe("admin learner detail", () => {
  it("shows profile, waitlist state, and staff notes without offering billing actions", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "support_agent" });
    mocks.getLearnerDetail.mockResolvedValue({ id: "00000000-0000-4000-8000-000000000102", email: "ada@example.test", displayName: "Ada", learningLevel: "beginner", waitlistStatus: "joined", createdAt: "2026-09-12T00:00:00Z", notes: [{ id: 1, body: "Called support", authorId: "staff", createdAt: "2026-09-12T00:00:00Z" }] });
    const html = renderToStaticMarkup(await LearnerDetailPage({ params: Promise.resolve({ id: "00000000-0000-4000-8000-000000000102" }) }));
    expect(mocks.requireStaff).toHaveBeenCalledWith("users_read");
    expect(html).toContain("ada@example.test");
    expect(html).toContain("Called support");
    expect(html).toContain("Joined");
    expect(html).not.toContain("Refund payment");
  });
});
