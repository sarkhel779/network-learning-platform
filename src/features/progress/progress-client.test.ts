import { describe, expect, it, vi } from "vitest";

import { ProgressClientError, saveProgress } from "./progress-client";

const input = { pathwayId: "path_networking_foundations", lessonId: "lesson_demo", contentVersion: 1, idempotencyKey: "11111111-1111-4111-8111-111111111111", eventType: "section_completed" as const, itemId: "read_intro", itemKind: "section" as const, anchor: "intro", metadata: {} };

describe("saveProgress", () => {
  it("returns the authoritative summary", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ progress: { attemptId: "attempt-1" } }), { status: 200, headers: { "content-type": "application/json" } }));
    await expect(saveProgress(input, fetcher)).resolves.toMatchObject({ attemptId: "attempt-1" });
    expect(fetcher).toHaveBeenCalledWith("/api/learning/progress", expect.objectContaining({ method: "POST", cache: "no-store" }));
  });

  it("classifies retryable and rejected responses", async () => {
    await expect(saveProgress(input, async () => new Response("{}", { status: 503 }))).rejects.toMatchObject({ retryable: true });
    await expect(saveProgress(input, async () => new Response("{}", { status: 400 }))).rejects.toEqual(expect.any(ProgressClientError));
    await expect(saveProgress(input, async () => new Response("{}", { status: 400 }))).rejects.toMatchObject({ retryable: false });
  });
});
