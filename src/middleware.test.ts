import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn((_url: string, _key: string, options: {
    cookies: { setAll: (cookies: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => void };
  }) => ({
    auth: {
      getUser: async () => {
        options.cookies.setAll([{ name: "sb-session", value: "refreshed", options: { httpOnly: true } }]);
        return getUser();
      },
    },
  })),
}));

import { config, middleware } from "./middleware";

describe("session refresh middleware", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";
    getUser.mockReset().mockResolvedValue({ data: { user: null }, error: null });
  });

  it("bypasses Supabase only for the exact Playwright test session", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("PLAYWRIGHT_TEST_SESSION", "1");
    vi.stubEnv("PACKETSECRETS_TEST_ENV", "test");

    const response = await middleware(new NextRequest("https://packetsecrets.test/learn/networking-foundations/vlans", {
      headers: { "x-packetsecrets-test-viewer": "learner-1" },
    }));

    expect(response.status).toBe(200);
    expect(getUser).not.toHaveBeenCalled();
  });

  it("does not bypass Supabase outside the exact test guard", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("PLAYWRIGHT_TEST_SESSION", "1");

    await middleware(new NextRequest("https://packetsecrets.test/learn/networking-foundations/vlans"));

    expect(getUser).toHaveBeenCalledOnce();
  });

  it("keeps public routes available when Supabase is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    const response = await middleware(new NextRequest(
      "https://packetsecrets.test/learn/networking-foundations/icmp-ping-and-path-discovery",
    ));

    expect(response.status).toBe(200);
    expect(getUser).not.toHaveBeenCalled();
  });

  it("validates the user and copies refreshed cookies onto the response", async () => {
    const response = await middleware(new NextRequest("https://packetsecrets.test/learn/networking-foundations/vlans"));

    expect(getUser).toHaveBeenCalledOnce();
    expect(response.cookies.get("sb-session")?.value).toBe("refreshed");
  });

  it("excludes framework assets and common static images", () => {
    expect(config.matcher).toEqual([
      "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ]);
  });
});
