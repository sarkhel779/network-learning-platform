import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), listFeatureFlags: vi.fn() }));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({ listFeatureFlags: mocks.listFeatureFlags }));

import SettingsPage from "./page";

describe("admin settings page", () => {
  it("shows the feature flags manager for an authorized viewer", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
    mocks.listFeatureFlags.mockResolvedValue([
      { key: "new_lesson_ui", enabled: true, description: "Testing", updatedAt: "2026-09-17T00:00:00Z" },
    ]);
    const html = renderToStaticMarkup(await SettingsPage());
    expect(mocks.requireStaff).toHaveBeenCalledWith("settings");
    expect(html).toContain("Settings");
    expect(html).toContain("new_lesson_ui");
    expect(html).not.toContain("not connected yet");
  });

  it("does not claim an unavailable flag list is empty", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
    mocks.listFeatureFlags.mockRejectedValueOnce(new Error("offline"));
    const html = renderToStaticMarkup(await SettingsPage());
    expect(html).toContain("temporarily unavailable");
    expect(html).not.toContain("No feature flags yet");
  });
});
