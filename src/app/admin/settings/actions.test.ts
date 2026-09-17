import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireStaff: vi.fn(),
  upsertFeatureFlag: vi.fn(),
  deleteFeatureFlag: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({
  upsertFeatureFlag: mocks.upsertFeatureFlag,
  deleteFeatureFlag: mocks.deleteFeatureFlag,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { deleteFeatureFlagAction, upsertFeatureFlagAction } from "./actions";

beforeEach(() => {
  mocks.requireStaff.mockReset();
  mocks.upsertFeatureFlag.mockReset();
  mocks.deleteFeatureFlag.mockReset();
  mocks.revalidatePath.mockReset();
  mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
});

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("upsert feature flag action", () => {
  it("rejects an invalid key without calling the database", async () => {
    const result = await upsertFeatureFlagAction(form({ key: "Not Valid!", enabled: "true", description: "" }));
    expect(result.ok).toBe(false);
    expect(mocks.upsertFeatureFlag).not.toHaveBeenCalled();
  });

  it("reauthorizes and saves the flag through the guarded RPC", async () => {
    mocks.upsertFeatureFlag.mockResolvedValue(undefined);
    const result = await upsertFeatureFlagAction(form({ key: "New_Lesson_UI", enabled: "true", description: " Testing " }));
    expect(result.ok).toBe(true);
    expect(mocks.requireStaff).toHaveBeenCalledWith("settings");
    expect(mocks.upsertFeatureFlag).toHaveBeenCalledWith("new_lesson_ui", true, "Testing");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/settings");
  });

  it("passes null for a blank description", async () => {
    mocks.upsertFeatureFlag.mockResolvedValue(undefined);
    await upsertFeatureFlagAction(form({ key: "new_flag", enabled: "false", description: "" }));
    expect(mocks.upsertFeatureFlag).toHaveBeenCalledWith("new_flag", false, null);
  });

  it("surfaces a database failure without a false success", async () => {
    mocks.upsertFeatureFlag.mockRejectedValue(new Error("offline"));
    const result = await upsertFeatureFlagAction(form({ key: "new_flag", enabled: "true", description: "" }));
    expect(result.ok).toBe(false);
  });
});

describe("delete feature flag action", () => {
  it("rejects an invalid key without calling the database", async () => {
    const result = await deleteFeatureFlagAction(form({ key: "Not Valid!" }));
    expect(result.ok).toBe(false);
    expect(mocks.deleteFeatureFlag).not.toHaveBeenCalled();
  });

  it("deletes through the guarded RPC", async () => {
    mocks.deleteFeatureFlag.mockResolvedValue(undefined);
    const result = await deleteFeatureFlagAction(form({ key: "new_flag" }));
    expect(result.ok).toBe(true);
    expect(mocks.requireStaff).toHaveBeenCalledWith("settings");
    expect(mocks.deleteFeatureFlag).toHaveBeenCalledWith("new_flag");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/settings");
  });

  it("surfaces a not-found failure without a false success", async () => {
    mocks.deleteFeatureFlag.mockRejectedValue(new Error("feature_flag_not_found"));
    const result = await deleteFeatureFlagAction(form({ key: "does_not_exist" }));
    expect(result.ok).toBe(false);
  });
});
