import { render, waitFor } from "@testing-library/react";
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
  });

  it("never records an admin path", async () => {
    mocks.pathname = "/admin/users";
    render(<PageViewRecorder />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetch).not.toHaveBeenCalled();
  });
});
