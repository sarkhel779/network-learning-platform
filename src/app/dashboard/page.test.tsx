import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getViewer: vi.fn(),
  loadMyLearning: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/session", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/features/progress/my-learning.server", () => ({ loadMyLearning: mocks.loadMyLearning }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect, useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.redirect.mockImplementation((destination: string) => { throw new Error(`REDIRECT:${destination}`); });
  mocks.getViewer.mockResolvedValue({ id: "learner-1", displayName: "Pranita", avatarUrl: null });
  mocks.loadMyLearning.mockResolvedValue({
    model: { pathwayTitle: "Networking Foundations", pathwayId: "networking-foundations", completionPercent: 25, continueLesson: null, groups: { in_progress: [], not_started: [], completed: [] } },
    unavailable: false,
  });
});

describe("dashboard page", () => {
  it("sends anonymous visitors to sign-in and returns them to the dashboard", async () => {
    mocks.getViewer.mockResolvedValue(null);
    const { default: DashboardPage } = await import("./page");
    await expect(DashboardPage()).rejects.toThrow("REDIRECT:/sign-in?returnTo=%2Fdashboard");
    expect(mocks.loadMyLearning).not.toHaveBeenCalled();
  });

  it("shows the learner's account and server-loaded progress", async () => {
    const { default: DashboardPage } = await import("./page");
    const { container } = render(await DashboardPage());
    expect(container.querySelector("main.informational-page.dashboard-page")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "My dashboard" })).toBeVisible();
    expect(screen.getByText("Pranita")).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "Pathway completion" })).toHaveValue(25);
    expect(screen.getByRole("button", { name: "Sign out" })).toBeVisible();
    expect(mocks.loadMyLearning).toHaveBeenCalledWith("learner-1", expect.objectContaining({ slug: "networking-foundations" }));
  });

  it("reports a progress-loading failure without hiding the account", async () => {
    mocks.loadMyLearning.mockResolvedValueOnce({
      model: { pathwayTitle: "Networking Foundations", pathwayId: "networking-foundations", completionPercent: 0, continueLesson: null, groups: { in_progress: [], not_started: [], completed: [] } },
      unavailable: true,
    });
    const { default: DashboardPage } = await import("./page");
    render(await DashboardPage());
    expect(screen.getByRole("status")).toHaveTextContent("progress could not be loaded");
    expect(screen.getByRole("button", { name: "Sign out" })).toBeVisible();
  });
});
