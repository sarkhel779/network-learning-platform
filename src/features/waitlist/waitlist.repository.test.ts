import { beforeEach, describe, expect, it, vi } from "vitest";

import { getWaitlistStatus, joinWaitlist, leaveWaitlist } from "./waitlist.repository";

const { createServerSupabaseClient, maybeSingle, rpc } = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  maybeSingle: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient }));

const row = {
  user_id: "user-1",
  status: "joined",
  source_lesson_slug: "hosts-and-network-devices",
  consent_version: "founding-pro-v1",
  consented_at: "2026-09-11T10:00:00.000Z",
  unsubscribed_at: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  createServerSupabaseClient.mockResolvedValue({ from: vi.fn(() => ({ select })), rpc });
  maybeSingle.mockResolvedValue({ data: row, error: null });
  rpc.mockResolvedValue({ data: row, error: null });
});

describe("waitlist repository", () => {
  it("maps only the caller's status row", async () => {
    await expect(getWaitlistStatus("user-1")).resolves.toEqual({ ok: true, entry: {
      status: "joined", sourceLessonSlug: "hosts-and-network-devices",
      consentVersion: "founding-pro-v1", consentedAt: "2026-09-11T10:00:00.000Z",
      unsubscribedAt: null,
    } });
    maybeSingle.mockResolvedValue({ data: { ...row, user_id: "user-2" }, error: null });
    await expect(getWaitlistStatus("user-1")).resolves.toEqual({ ok: false, code: "unavailable" });
  });

  it("joins through the consent-owning RPC", async () => {
    await expect(joinWaitlist("user-1", { consent: true, sourceLessonSlug: "hosts-and-network-devices" })).resolves.toMatchObject({ ok: true });
    expect(rpc).toHaveBeenCalledWith("join_pro_waitlist", {
      p_consent: true,
      p_consent_version: "founding-pro-v1",
      p_source_lesson_slug: "hosts-and-network-devices",
    });
  });

  it("rejects invalid attribution before calling Supabase", async () => {
    await expect(joinWaitlist("user-1", { consent: true, sourceLessonSlug: "unknown" })).resolves.toEqual({ ok: false, code: "invalid_source" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("unsubscribes through the non-destructive RPC and hides provider failures", async () => {
    rpc.mockResolvedValueOnce({ data: { ...row, status: "unsubscribed", unsubscribed_at: "2026-09-11T11:00:00.000Z" }, error: null });
    await expect(leaveWaitlist("user-1")).resolves.toMatchObject({ ok: true, entry: { status: "unsubscribed" } });
    expect(rpc).toHaveBeenCalledWith("leave_pro_waitlist");
    rpc.mockResolvedValueOnce({ data: null, error: { message: "private provider failure" } });
    await expect(leaveWaitlist("user-1")).resolves.toEqual({ ok: false, code: "unavailable" });
  });
});
