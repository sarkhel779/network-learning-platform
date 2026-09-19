import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LessonProgressManifest, LessonProgressSummary } from "./progress.types";
import { LessonProgressProvider, useLessonProgress, useLessonProgressItem, useOptionalLessonProgressItem } from "./lesson-progress-context";

const { saveProgress } = vi.hoisted(() => ({ saveProgress: vi.fn() }));
vi.mock("./progress-client", () => ({ saveProgress }));

const manifest: LessonProgressManifest = { pathwayId: "path_networking_foundations", lessonId: "lesson_demo", contentVersion: 1, items: [
  { itemId: "read_intro", kind: "knowledge_check", label: "Knowledge check 1", anchor: "intro", required: true },
  { itemId: "read_second", kind: "knowledge_check", label: "Knowledge check 2", anchor: "second", required: true },
] };
const summary: LessonProgressSummary = { attemptId: "attempt-1", pathwayId: manifest.pathwayId, lessonId: manifest.lessonId, contentVersion: 1, attemptNumber: 1, status: "in_progress", completedItemIds: ["read_intro"], nextItemId: "read_second", lastItemId: "read_intro", lastAnchor: "intro", completionPercent: 50, incorrectCheckCount: 0, updatedAt: "2026-09-09T00:00:00Z" };

function Probe() {
  const item = useLessonProgressItem("read_intro");
  const lesson = useLessonProgress();
  return <><button onClick={() => item.complete({ eventType: "knowledge_check_attempted", answerCorrect: true })}>Complete</button><button onClick={item.retry}>Retry</button><span>State {item.state}</span><span>Confirmed {lesson.authoritativeProgress?.completionPercent ?? 0}</span><span>Displayed {lesson.optimisticCompletionPercent}</span></>;
}

const quizManifest: LessonProgressManifest = { pathwayId: "path_networking_foundations", lessonId: "lesson_quiz", contentVersion: 1, items: [
  { itemId: "interactive_demo", kind: "interactive", label: "Demo", anchor: "demo", required: false },
  { itemId: "quiz_check_1", kind: "knowledge_check", label: "Knowledge check 1", anchor: "quiz-check-1", required: true },
] };

function QuizProbe() {
  const interactive = useOptionalLessonProgressItem("interactive_demo");
  const check = useOptionalLessonProgressItem("quiz_check_1");
  const lesson = useLessonProgress();
  return <><button onClick={() => interactive.complete({ eventType: "interactive_completed" })}>Complete interactive</button><button onClick={() => check.complete({ eventType: "knowledge_check_attempted", answerCorrect: false })}>Submit wrong answer</button><button onClick={() => check.complete({ eventType: "knowledge_check_attempted", answerCorrect: true })}>Submit correct answer</button><span>Displayed {lesson.optimisticCompletionPercent}</span></>;
}

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

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

  it("does not save interactive completion or optimistically count an incorrect quiz answer", async () => {
    saveProgress.mockRejectedValue(new Error("offline"));
    render(<LessonProgressProvider viewerId="learner-quiz" manifest={quizManifest} initialProgress={null}><QuizProbe /></LessonProgressProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Complete interactive" }));
    expect(saveProgress).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Submit wrong answer" }));
    await waitFor(() => expect(saveProgress).toHaveBeenCalledOnce());
    expect(screen.getByText("Displayed 0")).toBeVisible();
  });

  it("keeps a corrected answer while an earlier wrong answer is still pending", async () => {
    saveProgress.mockImplementation(() => new Promise(() => undefined));
    render(<LessonProgressProvider viewerId="learner-correction" manifest={quizManifest} initialProgress={null}><QuizProbe /></LessonProgressProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Submit wrong answer" }));
    await userEvent.click(screen.getByRole("button", { name: "Submit correct answer" }));
    expect(saveProgress).toHaveBeenCalledTimes(2);
    expect(saveProgress.mock.calls.map(([event]) => event.answerCorrect)).toEqual([false, true]);
  });

  it("discards legacy non-quiz events before flushing the offline queue", async () => {
    const common = { pathwayId: quizManifest.pathwayId, lessonId: quizManifest.lessonId, contentVersion: 1, anchor: "demo", metadata: {}, createdAt: "2026-09-20T00:00:00.000Z" };
    localStorage.setItem("packetsecrets:progress:learner-legacy", JSON.stringify([
      { ...common, idempotencyKey: "00000000-0000-4000-8000-000000000001", itemId: "interactive_demo", itemKind: "interactive", eventType: "interactive_completed" },
      { ...common, idempotencyKey: "00000000-0000-4000-8000-000000000002", itemId: "quiz_check_1", itemKind: "knowledge_check", eventType: "knowledge_check_attempted", anchor: "quiz-check-1", answerCorrect: true },
    ]));
    saveProgress.mockResolvedValue({ ...summary, lessonId: quizManifest.lessonId, completedItemIds: ["quiz_check_1"], completionPercent: 100, status: "completed" });
    render(<LessonProgressProvider viewerId="learner-legacy" manifest={quizManifest} initialProgress={null}><QuizProbe /></LessonProgressProvider>);
    await waitFor(() => expect(saveProgress).toHaveBeenCalledOnce());
    expect(saveProgress.mock.calls[0][0].itemId).toBe("quiz_check_1");
    expect(localStorage.getItem("packetsecrets:progress:learner-legacy")).not.toContain("interactive_demo");
  });

  it("automatically retries a failed quiz save without a retry button", async () => {
    vi.useFakeTimers();
    saveProgress.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ ...summary, lessonId: quizManifest.lessonId, completedItemIds: ["quiz_check_1"], completionPercent: 100, status: "completed" });
    render(<LessonProgressProvider viewerId="learner-auto-retry" manifest={quizManifest} initialProgress={null}><QuizProbe /></LessonProgressProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Submit correct answer" }));
    await act(async () => { await Promise.resolve(); });
    expect(saveProgress).toHaveBeenCalledOnce();
    await act(async () => { await vi.advanceTimersByTimeAsync(5_000); });
    expect(saveProgress).toHaveBeenCalledTimes(2);
    expect(saveProgress.mock.calls[1][0].idempotencyKey).toBe(saveProgress.mock.calls[0][0].idempotencyKey);
  });
});
