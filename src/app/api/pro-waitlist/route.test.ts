import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, GET, POST } from "./route";

const mocks = vi.hoisted(() => ({
  getViewer: vi.fn(), getWaitlistStatus: vi.fn(), joinWaitlist: vi.fn(), leaveWaitlist: vi.fn(),
}));
vi.mock("@/lib/supabase/session", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/features/waitlist/waitlist.repository", () => ({
  getWaitlistStatus: mocks.getWaitlistStatus,
  joinWaitlist: mocks.joinWaitlist,
  leaveWaitlist: mocks.leaveWaitlist,
}));

const entry = { status: "joined", sourceLessonSlug: null, consentVersion: "founding-pro-v1", consentedAt: "2026-09-11T10:00:00.000Z", unsubscribedAt: null };
const request = (method: "POST" | "DELETE", body?: unknown) => new Request("https://packetsecrets.test/api/pro-waitlist", { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getViewer.mockResolvedValue({ id: "user-1" });
  mocks.getWaitlistStatus.mockResolvedValue({ ok: true, entry: null });
  mocks.joinWaitlist.mockResolvedValue({ ok: true, entry });
  mocks.leaveWaitlist.mockResolvedValue({ ok: true, entry: { ...entry, status: "unsubscribed", unsubscribedAt: "2026-09-11T11:00:00.000Z" } });
});

describe("/api/pro-waitlist", () => {
  it.each([
    ["GET", () => GET()],
    ["POST", () => POST(request("POST", { consent: true }))],
    ["DELETE", () => DELETE(request("DELETE"))],
  ])("rejects anonymous %s requests", async (_method, invoke) => {
    mocks.getViewer.mockResolvedValue(null);
    const response = await invoke();
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("returns the learner's current status", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ entry: null });
    expect(mocks.getWaitlistStatus).toHaveBeenCalledWith("user-1");
  });

  it.each([{}, { consent: false }, { consent: true, email: "learner@example.test" }])("rejects malformed joins %#", async (body) => {
    expect((await POST(request("POST", body))).status).toBe(400);
    expect(mocks.joinWaitlist).not.toHaveBeenCalled();
  });

  it("returns a server-confirmed idempotent join", async () => {
    const response = await POST(request("POST", { consent: true }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.json()).toEqual({ entry });
    expect(mocks.joinWaitlist).toHaveBeenCalledWith("user-1", { consent: true });
  });

  it("returns a server-confirmed unsubscribe", async () => {
    const response = await DELETE(request("DELETE"));
    expect(response.status).toBe(200);
    expect((await response.json()).entry.status).toBe("unsubscribed");
    expect(mocks.leaveWaitlist).toHaveBeenCalledWith("user-1");
  });

  it.each([
    ["GET", () => GET(), mocks.getWaitlistStatus],
    ["POST", () => POST(request("POST", { consent: true })), mocks.joinWaitlist],
    ["DELETE", () => DELETE(request("DELETE")), mocks.leaveWaitlist],
  ])("hides provider details when %s persistence fails", async (_method, invoke, repository) => {
    repository.mockResolvedValueOnce({ ok: false, code: "unavailable", message: "private Supabase failure" });
    const response = await invoke();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toMatch(/supabase|private/i);
  });
});
