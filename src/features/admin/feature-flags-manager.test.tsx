import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ upsertFeatureFlagAction: vi.fn(), deleteFeatureFlagAction: vi.fn() }));
vi.mock("@/app/admin/settings/actions", () => ({
  upsertFeatureFlagAction: mocks.upsertFeatureFlagAction,
  deleteFeatureFlagAction: mocks.deleteFeatureFlagAction,
}));

import { FeatureFlagsManager } from "./feature-flags-manager";
import type { FeatureFlag } from "./admin.types";

const flag: FeatureFlag = { key: "new_lesson_ui", enabled: true, description: "Testing", updatedAt: "2026-09-17T00:00:00Z" };

afterEach(cleanup);

beforeEach(() => {
  mocks.upsertFeatureFlagAction.mockReset();
  mocks.deleteFeatureFlagAction.mockReset();
});

describe("FeatureFlagsManager", () => {
  it("shows an empty state when there are no flags", () => {
    render(<FeatureFlagsManager flags={[]} />);
    expect(screen.getByText("No feature flags yet.")).toBeVisible();
  });

  it("creates a flag, defaulting an unchecked box to disabled", async () => {
    mocks.upsertFeatureFlagAction.mockResolvedValue({ ok: true, message: 'Feature flag "new_flag" saved.' });
    render(<FeatureFlagsManager flags={[]} />);
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "new_flag" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "A new flag" } });
    fireEvent.click(screen.getByRole("button", { name: "Create flag" }));
    expect(await screen.findByRole("status")).toHaveTextContent("saved");
    const formData = mocks.upsertFeatureFlagAction.mock.calls[0][0] as FormData;
    expect(formData.get("key")).toBe("new_flag");
    expect(formData.get("description")).toBe("A new flag");
    expect(formData.get("enabled")).toBe("false");
  });

  it("creates a flag as enabled when the checkbox is checked", async () => {
    mocks.upsertFeatureFlagAction.mockResolvedValue({ ok: true, message: "saved" });
    render(<FeatureFlagsManager flags={[]} />);
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "new_flag" } });
    fireEvent.click(screen.getByLabelText("Enabled"));
    fireEvent.click(screen.getByRole("button", { name: "Create flag" }));
    await screen.findByRole("status");
    const formData = mocks.upsertFeatureFlagAction.mock.calls[0][0] as FormData;
    expect(formData.get("enabled")).toBe("true");
  });

  it("lists an existing flag with a toggle and delete action", async () => {
    mocks.upsertFeatureFlagAction.mockResolvedValue({ ok: true, message: "saved" });
    render(<FeatureFlagsManager flags={[flag]} />);
    expect(screen.getByText("new_lesson_ui")).toBeVisible();
    expect(screen.getByText("Testing")).toBeVisible();
    expect(screen.getByRole("cell", { name: "Enabled" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Disable" }));
    await screen.findByRole("status");
    const formData = mocks.upsertFeatureFlagAction.mock.calls[0][0] as FormData;
    expect(formData.get("key")).toBe("new_lesson_ui");
    expect(formData.get("enabled")).toBe("false");
  });

  it("deletes a flag", async () => {
    mocks.deleteFeatureFlagAction.mockResolvedValue({ ok: true, message: 'Feature flag "new_lesson_ui" deleted.' });
    render(<FeatureFlagsManager flags={[flag]} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("status")).toHaveTextContent("deleted");
    const formData = mocks.deleteFeatureFlagAction.mock.calls[0][0] as FormData;
    expect(formData.get("key")).toBe("new_lesson_ui");
  });

  it("surfaces a failed save as an alert", async () => {
    mocks.upsertFeatureFlagAction.mockResolvedValue({ ok: false, message: "Feature flag could not be saved." });
    render(<FeatureFlagsManager flags={[]} />);
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "new_flag" } });
    fireEvent.click(screen.getByRole("button", { name: "Create flag" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be saved");
  });
});
