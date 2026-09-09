import { beforeEach, describe, expect, it, vi } from "vitest";

import { getLessonProgress, listPathwayProgress, recordLearnerProgress } from "./progress.repository";

const rpc = vi.fn();
const maybeSingle = vi.fn();
const order = vi.fn();
const eq = vi.fn(() => ({ eq, maybeSingle, order }));
const select = vi.fn(() => ({ eq, maybeSingle, order }));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({ rpc, from: () => ({ select }) }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  eq.mockReturnValue({ eq, maybeSingle, order });
  select.mockReturnValue({ eq, maybeSingle, order });
});

describe("progress repository", () => {
  it("maps an owned current attempt", async () => {
    maybeSingle.mockResolvedValue({ data: {
      id: "attempt-1", pathway_id: "path_networking_foundations", lesson_id: "lesson_how_networks_communicate",
      content_version: 1, attempt_number: 1, status: "in_progress", completed_item_ids: ["one"],
      next_item_id: "two", last_item_id: "one", last_anchor: "intro", completion_percent: 50,
      incorrect_check_count: 1, updated_at: "2026-09-09T00:00:00Z",
    }, error: null });

    await expect(getLessonProgress("user-1", "path_networking_foundations", "lesson_how_networks_communicate"))
      .resolves.toMatchObject({ attemptId: "attempt-1", completionPercent: 50, incorrectCheckCount: 1 });
  });

  it("lists current pathway attempts", async () => {
    order.mockResolvedValue({ data: [], error: null });
    await expect(listPathwayProgress("user-1", "path_networking_foundations")).resolves.toEqual([]);
  });

  it("calls the narrow RPC only for a known manifest item", async () => {
    rpc.mockResolvedValue({ data: { id: "attempt-1", pathway_id: "path_networking_foundations", lesson_id: "lesson_how_networks_communicate", content_version: 1, attempt_number: 1, status: "in_progress", completed_item_ids: [], next_item_id: null, last_item_id: null, last_anchor: null, completion_percent: 20, incorrect_check_count: 0, updated_at: "2026-09-09T00:00:00Z" }, error: null });
    const result = await recordLearnerProgress({
      pathwayId: "path_networking_foundations", lessonId: "lesson_how_networks_communicate", contentVersion: 1,
      idempotencyKey: "11111111-1111-4111-8111-111111111111", eventType: "section_completed",
      itemId: "how_networks_communicate_section_communication_decisions", itemKind: "section",
      anchor: "communication-decisions", metadata: {},
    });
    expect(result.ok).toBe(true);
    expect(rpc).toHaveBeenCalledWith("record_learner_progress_event", expect.objectContaining({ p_item_id: "how_networks_communicate_section_communication_decisions" }));
  });
});
