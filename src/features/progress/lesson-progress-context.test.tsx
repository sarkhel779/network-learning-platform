import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LessonProgressManifest, LessonProgressSummary } from "./progress.types";
import { LessonProgressProvider, useLessonProgress, useLessonProgressItem } from "./lesson-progress-context";

const { saveProgress } = vi.hoisted(() => ({ saveProgress: vi.fn() }));
vi.mock("./progress-client", () => ({ saveProgress }));

const manifest: LessonProgressManifest = { pathwayId: "path_networking_foundations", lessonId: "lesson_demo", contentVersion: 1, items: [
  { itemId: "read_intro", kind: "section", label: "Introduction", anchor: "intro", required: true },
  { itemId: "read_second", kind: "section", label: "Second", anchor: "second", required: true },
] };
const summary: LessonProgressSummary = { attemptId: "attempt-1", pathwayId: manifest.pathwayId, lessonId: manifest.lessonId, contentVersion: 1, attemptNumber: 1, status: "in_progress", completedItemIds: ["read_intro"], nextItemId: "read_second", lastItemId: "read_intro", lastAnchor: "intro", completionPercent: 50, incorrectCheckCount: 0, updatedAt: "2026-09-09T00:00:00Z" };

function Probe() {
  const item = useLessonProgressItem("read_intro");
  const lesson = useLessonProgress();
  return <><button onClick={() => item.complete()}>Complete</button><button onClick={item.retry}>Retry</button><span>State {item.state}</span><span>Confirmed {lesson.authoritativeProgress?.completionPercent ?? 0}</span><span>Displayed {lesson.optimisticCompletionPercent}</span></>;
}

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });
afterEach(cleanup);

describe("LessonProgressProvider", () => {
  it("moves idle through saving to server-confirmed saved", async () => {
    saveProgress.mockResolvedValue(summary);
    render(<LessonProgressProvider viewerId="learner-1" manifest={manifest} initialProgress={null}><Probe /></LessonProgressProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Complete" }));
    await waitFor(() => expect(screen.getByText("State saved")).toBeVisible());
    expect(screen.getByText("Confirmed 50")).toBeVisible();
    expect(saveProgress).toHaveBeenCalledOnce();
  });

  it("keeps optimistic progress pending and retries with the same key", async () => {
    saveProgress.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(summary);
    render(<LessonProgressProvider viewerId="learner-1" manifest={manifest} initialProgress={null}><Probe /></LessonProgressProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Complete" }));
    await waitFor(() => expect(screen.getByText("State error")).toBeVisible());
    expect(screen.getByText("Displayed 50")).toBeVisible();
    const firstKey = saveProgress.mock.calls[0][0].idempotencyKey;
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.getByText("State saved")).toBeVisible());
    expect(saveProgress.mock.calls[1][0].idempotencyKey).toBe(firstKey);
  });

  it("coalesces duplicate completion calls", async () => {
    saveProgress.mockResolvedValue(summary);
    render(<LessonProgressProvider viewerId="learner-1" manifest={manifest} initialProgress={null}><Probe /></LessonProgressProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Complete" }));
    await userEvent.click(screen.getByRole("button", { name: "Complete" }));
    await waitFor(() => expect(screen.getByText("State saved")).toBeVisible());
    expect(saveProgress).toHaveBeenCalledOnce();
  });
});
