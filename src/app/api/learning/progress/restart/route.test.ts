import { describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const { getUser, restartLearnerProgress } = vi.hoisted(() => ({
  getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })),
  restartLearnerProgress: vi.fn(async () => ({ ok: true, progress: {} })),
}));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: async () => ({ auth: { getUser } }) }));
vi.mock("@/features/progress/progress.repository", () => ({ restartLearnerProgress }));

describe("POST /api/learning/progress/restart", () => {
  it("accepts only identity and an idempotency key", async () => {
    const response = await POST(new Request("https://packetsecrets.test/api/learning/progress/restart", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pathwayId: "path_networking_foundations", lessonId: "lesson_how_networks_communicate", contentVersion: 1, idempotencyKey: "11111111-1111-4111-8111-111111111111" }) }));
    expect(response.status).toBe(200);
    expect(restartLearnerProgress).toHaveBeenCalledOnce();
  });
});
