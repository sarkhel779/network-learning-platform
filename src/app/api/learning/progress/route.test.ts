import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const { getUser, recordLearnerProgress } = vi.hoisted(() => ({
  getUser: vi.fn(),
  recordLearnerProgress: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: async () => ({ auth: { getUser } }) }));
vi.mock("@/features/progress/progress.repository", () => ({ recordLearnerProgress }));

const body = { pathwayId: "path_networking_foundations", lessonId: "lesson_how_networks_communicate", contentVersion: 1, idempotencyKey: "11111111-1111-4111-8111-111111111111", eventType: "section_completed", itemId: "how_networks_communicate_section_communication_decisions", itemKind: "section", anchor: "communication-decisions", metadata: {} };
const request = (value: unknown) => new Request("https://packetsecrets.test/api/learning/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(value) });

beforeEach(() => { vi.clearAllMocks(); getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }); recordLearnerProgress.mockResolvedValue({ ok: true, progress: {} }); });

describe("POST /api/learning/progress", () => {
  it("rejects anonymous requests", async () => { getUser.mockResolvedValue({ data: { user: null }, error: null }); expect((await POST(request(body))).status).toBe(401); });
  it("rejects browser-owned completion fields", async () => { expect((await POST(request({ ...body, status: "completed" }))).status).toBe(400); });
  it("returns no-store success", async () => { const response = await POST(request(body)); expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toContain("no-store"); });
  it("maps stale versions without leaking provider errors", async () => { recordLearnerProgress.mockResolvedValue({ ok: false, code: "stale_version" }); const response = await POST(request(body)); expect(response.status).toBe(409); expect(await response.text()).not.toContain("provider"); });
});
