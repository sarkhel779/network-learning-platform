import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProgressCompletionBoundary } from "./progress-completion-boundary";

const { complete } = vi.hoisted(() => ({ complete: vi.fn() }));
vi.mock("./lesson-progress-context", () => ({
  useOptionalLessonProgressItem: () => ({ state: "idle", complete, retry: vi.fn() }),
}));

beforeEach(() => complete.mockReset().mockResolvedValue(true));

describe("useProgressCompletionBoundary", () => {
  it("records the first terminal signal exactly once", () => {
    const { result } = renderHook(() => useProgressCompletionBoundary("interactive_demo"));
    act(() => result.current.markTerminalStateReached());
    act(() => result.current.markTerminalStateReached());
    expect(complete).toHaveBeenCalledOnce();
    expect(complete).toHaveBeenCalledWith({ eventType: "interactive_completed" });
  });

  it("does nothing before a terminal signal", () => {
    renderHook(() => useProgressCompletionBoundary("interactive_demo"));
    expect(complete).not.toHaveBeenCalled();
  });

  it("allows one new terminal signal when the attempt key changes", () => {
    const { result, rerender } = renderHook(({ attemptKey }) => useProgressCompletionBoundary("interactive_demo", attemptKey), { initialProps: { attemptKey: "attempt-1" } });
    act(() => result.current.markTerminalStateReached());
    rerender({ attemptKey: "attempt-2" });
    act(() => result.current.markTerminalStateReached());
    expect(complete).toHaveBeenCalledTimes(2);
  });
});
