import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn() }));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));

import AdminLayout from "./layout";

describe("admin layout", () => {
  it("checks staff authorization before rendering child content", async () => {
    mocks.requireStaff.mockResolvedValueOnce({ viewer: { id: "staff-1" }, role: "super_admin" });
    const html = renderToStaticMarkup(await AdminLayout({ children: <p>Private dashboard</p> }));
    expect(mocks.requireStaff).toHaveBeenCalledWith("overview");
    expect(html).toContain("Private dashboard");
  });
});
