import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn() }));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));

import CoursesPage from "./courses/page";
import BillingPage from "./billing/page";
import SupportPage from "./support/page";
import RolesPage from "./roles/page";
import SettingsPage from "./settings/page";

describe("admin integration pages", () => {
  it.each([
    ["Courses and labs", "courses", CoursesPage],
    ["Billing", "billing", BillingPage],
    ["Support", "support", SupportPage],
    ["Roles", "roles", RolesPage],
    ["Settings", "settings", SettingsPage],
  ] as const)("gates %s and does not pretend it is connected", async (title, permission, Page) => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
    const html = renderToStaticMarkup(await Page());
    expect(mocks.requireStaff).toHaveBeenCalledWith(permission);
    expect(html).toContain(title);
    expect(html).toContain("not connected yet");
    expect(html).not.toContain("₹4.2L");
  });
});
