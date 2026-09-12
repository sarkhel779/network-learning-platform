import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createServerSupabaseClient: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.createServerSupabaseClient }));

import { POST } from "./route";

const makeRequest = (body: unknown) => new Request("https://packetsecrets.test/api/page-view", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
});

beforeEach(() => {
  mocks.rpc.mockReset();
  mocks.createServerSupabaseClient.mockClear();
  mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
});

describe("POST /api/page-view", () => {
  it("rejects malformed or private routes before touching Supabase", async () => {
    const response = await POST(makeRequest({ path: "/admin", eventId: "00000000-0000-4000-8000-000000000201" }));
    expect(response.status).toBe(400);
    expect(mocks.createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("records a public navigation with its retry-safe event id", async () => {
    mocks.rpc.mockResolvedValue({ error: null });
    const response = await POST(makeRequest({ path: "/pricing", eventId: "00000000-0000-4000-8000-000000000201" }));
    expect(response.status).toBe(204);
    expect(mocks.rpc).toHaveBeenCalledWith("record_page_view", {
      p_path: "/pricing", p_event_id: "00000000-0000-4000-8000-000000000201",
    });
  });

  it("excludes automated Playwright sessions from visitor totals", async () => {
    vi.stubEnv("PLAYWRIGHT_TEST_SESSION", "1");
    vi.stubEnv("PACKETSECRETS_TEST_ENV", "test");
    try {
      const response = await POST(makeRequest({ path: "/pricing", eventId: "00000000-0000-4000-8000-000000000201" }));
      expect(response.status).toBe(204);
      expect(mocks.createServerSupabaseClient).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
