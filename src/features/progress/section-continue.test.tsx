import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SectionContinue } from "./section-continue";

const { complete, retry } = vi.hoisted(() => ({ complete: vi.fn(), retry: vi.fn() }));
vi.mock("./lesson-progress-context", () => ({
  useOptionalLessonProgress: () => ({}),
  useLessonProgressItem: () => ({ state: "idle", complete, retry }),
  useLessonProgress: () => ({ manifest: { items: [
    { itemId: "read_intro", label: "Introduction", anchor: "intro" },
    { itemId: "read_second", label: "Second topic", anchor: "second" },
  ] } }),
}));

let observerCallback: IntersectionObserverCallback;
const observe = vi.fn();
const disconnect = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  complete.mockReset().mockResolvedValue(true);
  retry.mockReset();
  observe.mockReset();
  disconnect.mockReset();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { observerCallback = callback; }
    observe = observe;
    disconnect = disconnect;
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("SectionContinue", () => {
  it("saves progress once on reaching the end marker without showing a Continue button", async () => {
    render(<SectionContinue itemId="read_intro" anchor="intro" />);
    expect(screen.queryByRole("button", { name: /continue/i })).not.toBeInTheDocument();
    expect(observe).toHaveBeenCalledOnce();
    await act(async () => {
      observerCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      await vi.advanceTimersByTimeAsync(900);
    });
    expect(complete).not.toHaveBeenCalled();
    await act(async () => { await vi.advanceTimersByTimeAsync(200); });
    expect(complete).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalled();
  });
});
