import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const exchangeCodeForSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({
    auth: { exchangeCodeForSession },
  }),
}));

beforeEach(() => {
  exchangeCodeForSession.mockReset();
  exchangeCodeForSession.mockResolvedValue({ error: null });
});

describe("GET /auth/callback", () => {
  it("exchanges a valid code and redirects to the allowed lesson", async () => {
    const response = await GET(
      new Request(
        "https://packetsecrets.test/auth/callback?code=abc&next=%2Fpaths%2Fnetworking-foundations",
      ),
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.headers.get("location")).toBe(
      "https://packetsecrets.test/paths/networking-foundations",
    );
  });

  it("falls back to home for an unsafe next destination", async () => {
    const response = await GET(
      new Request(
        "https://packetsecrets.test/auth/callback?code=abc&next=https%3A%2F%2Fattacker.example",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://packetsecrets.test/",
    );
  });

  it("redirects safely when the code is missing", async () => {
    const response = await GET(
      new Request("https://packetsecrets.test/auth/callback"),
    );

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "https://packetsecrets.test/sign-in?error=authentication",
    );
  });

  it("does not expose provider details when exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({
      error: new Error("sensitive provider detail"),
    });

    const response = await GET(
      new Request("https://packetsecrets.test/auth/callback?code=bad"),
    );

    expect(response.headers.get("location")).toBe(
      "https://packetsecrets.test/sign-in?error=authentication",
    );
    expect(await response.text()).not.toContain("sensitive provider detail");
  });
});
