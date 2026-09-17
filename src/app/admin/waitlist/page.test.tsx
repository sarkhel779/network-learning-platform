import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), listWaitlist: vi.fn() }));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({ listWaitlist: mocks.listWaitlist }));

import WaitlistPage from "./page";

describe("admin waitlist page", () => {
  it("shows joined waitlist members without claiming an unavailable list is empty", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff-1" }, role: "support_agent" });
    mocks.listWaitlist.mockRejectedValueOnce(new Error("offline"));
    const html = renderToStaticMarkup(await WaitlistPage({ searchParams: Promise.resolve({}) }));
    expect(mocks.requireStaff).toHaveBeenCalledWith("users_read");
    expect(html).toContain("temporarily unavailable");
    expect(html).not.toContain("No one has joined");
  });

  it("lists joined members with a link back to their profile", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff-1" }, role: "support_agent" });
    mocks.listWaitlist.mockResolvedValue({
      total: 1,
      rows: [{ userId: "00000000-0000-4000-8000-000000000102", email: "ada@example.test", displayName: "Ada", sourceLessonSlug: "how-networks-communicate", consentedAt: "2026-09-17T00:00:00Z", createdAt: "2026-09-17T00:00:00Z" }],
    });
    const html = renderToStaticMarkup(await WaitlistPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain("Ada");
    expect(html).toContain("ada@example.test");
    expect(html).toContain("how-networks-communicate");
    expect(html).toContain("/admin/users/00000000-0000-4000-8000-000000000102");
  });
});
