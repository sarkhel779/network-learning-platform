import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  rpc: vi.fn(),
  cookieStore: { get: vi.fn(), set: vi.fn() },
}));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.createServerSupabaseClient }));
vi.mock("next/headers", () => ({ cookies: () => Promise.resolve(mocks.cookieStore) }));

import { POST } from "./route";

const makeRequest = (body: unknown) => new Request("https://packetsecrets.test/api/page-view", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
});

beforeEach(() => {
  vi.stubEnv("PAGE_VIEW_INGEST_TOKEN", "ci-only-ingest-token-with-32-chars-minimum");
  mocks.rpc.mockReset();
  mocks.createServerSupabaseClient.mockClear();
  mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
  mocks.cookieStore.get.mockReset().mockReturnValue(undefined);
  mocks.cookieStore.set.mockReset();
});

describe("POST /api/page-view", () => {
  it("rejects malformed or private routes before touching Supabase", async () => {
    const response = await POST(makeRequest({ path: "/admin", eventId: "00000000-0000-4000-8000-000000000201" }));
    expect(response.status).toBe(400);
    expect(mocks.createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("records a public navigation with its retry-safe event id and a fresh anonymous visitor cookie", async () => {
    mocks.rpc.mockResolvedValue({ data: "recorded", error: null });
    const response = await POST(makeRequest({ path: "/pricing", eventId: "00000000-0000-4000-8000-000000000201" }));
    expect(response.status).toBe(204);
    expect(mocks.rpc).toHaveBeenCalledWith("record_page_view", {
      p_path: "/pricing", p_event_id: "00000000-0000-4000-8000-000000000201",
      p_ingest_token: "ci-only-ingest-token-with-32-chars-minimum",
      p_visitor_id: expect.stringMatching(/^[0-9a-f-]{36}$/i),
    });
    expect(mocks.cookieStore.set).toHaveBeenCalledWith("ps_vid", expect.stringMatching(/^[0-9a-f-]{36}$/i), expect.objectContaining({ httpOnly: true, sameSite: "lax" }));
  });

  it("reuses an existing visitor cookie instead of minting a new one", async () => {
    mocks.rpc.mockResolvedValue({ data: "recorded", error: null });
    mocks.cookieStore.get.mockReturnValue({ name: "ps_vid", value: "00000000-0000-4000-8000-000000000901" });
    const response = await POST(makeRequest({ path: "/pricing", eventId: "00000000-0000-4000-8000-000000000201" }));
    expect(response.status).toBe(204);
    expect(mocks.rpc).toHaveBeenCalledWith("record_page_view", expect.objectContaining({
      p_visitor_id: "00000000-0000-4000-8000-000000000901",
    }));
    expect(mocks.cookieStore.set).not.toHaveBeenCalled();
  });

  it("ignores a malformed visitor cookie and mints a fresh one", async () => {
    mocks.rpc.mockResolvedValue({ data: "recorded", error: null });
    mocks.cookieStore.get.mockReturnValue({ name: "ps_vid", value: "not-a-uuid" });
    await POST(makeRequest({ path: "/pricing", eventId: "00000000-0000-4000-8000-000000000201" }));
    expect(mocks.rpc).toHaveBeenCalledWith("record_page_view", expect.objectContaining({
      p_visitor_id: expect.stringMatching(/^[0-9a-f-]{36}$/i),
    }));
    expect(mocks.cookieStore.set).toHaveBeenCalled();
  });

  it("fails closed when the server-only ingest token is missing", async () => {
    vi.stubEnv("PAGE_VIEW_INGEST_TOKEN", "");
    const response = await POST(makeRequest({ path: "/pricing", eventId: "00000000-0000-4000-8000-000000000201" }));
    expect(response.status).toBe(503);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("returns 429 when the persistent window is full", async () => {
    mocks.rpc.mockResolvedValue({ data: "rate_limited", error: null });
    const response = await POST(makeRequest({ path: "/pricing", eventId: "00000000-0000-4000-8000-000000000201" }));
    expect(response.status).toBe(429);
  });

  it("does not acknowledge an unexpected ingestion result", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    const response = await POST(makeRequest({ path: "/pricing", eventId: "00000000-0000-4000-8000-000000000201" }));
    expect(response.status).toBe(503);
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
