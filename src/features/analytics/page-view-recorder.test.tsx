import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ pathname: "/pricing" }));
vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }));

import { PageViewRecorder } from "./page-view-recorder";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  mocks.pathname = "/pricing";
});

describe("PageViewRecorder", () => {
  it("sends a public navigation without a user identifier or query string", async () => {
    render(<PageViewRecorder />);
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const [, options] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(options?.body as string);
    expect(body.path).toBe("/pricing");
    expect(body.eventId).toMatch(/^[0-9a-f-]{36}$/);
    expect(Object.keys(body).sort()).toEqual(["eventId", "path"]);
    expect(options?.credentials).toBe("same-origin");
  });

  it("never records an admin path", async () => {
    mocks.pathname = "/admin/users";
    render(<PageViewRecorder />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("retries a transient server failure with the same event id", async () => {
    vi.useFakeTimers();
    try {
      vi.stubGlobal("fetch", vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 503 })
        .mockResolvedValueOnce({ ok: true, status: 204 }));
      render(<PageViewRecorder />);
      await act(async () => { await Promise.resolve(); });
      expect(fetch).toHaveBeenCalledTimes(1);
      await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
      expect(fetch).toHaveBeenCalledTimes(2);
      const first = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      const second = JSON.parse(vi.mocked(fetch).mock.calls[1][1]?.body as string);
      expect(second.eventId).toBe(first.eventId);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not retry a permanent bad-request response", async () => {
    vi.useFakeTimers();
    try {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 400 }));
      render(<PageViewRecorder />);
      await act(async () => { await Promise.resolve(); });
      await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
      expect(fetch).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
