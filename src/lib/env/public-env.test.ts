import { describe, expect, it } from "vitest";

import { parsePublicEnv } from "./public-env";

describe("parsePublicEnv", () => {
  it("accepts an HTTPS Supabase URL and public key", () => {
    expect(parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
    })).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "public-anon-key",
    });
  });

  it("accepts only the disposable loopback HTTP URL", () => {
    expect(parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "local-anon-key",
    }).supabaseUrl).toBe("http://127.0.0.1:54321");
    expect(() => parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54322",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "key",
    })).toThrow(/Supabase configuration/);
  });

  it("rejects missing or non-HTTPS public configuration", () => {
    expect(() => parsePublicEnv({})).toThrow(/Supabase configuration/);
    expect(() => parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "http://example.test",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "key",
    })).toThrow(/Supabase configuration/);
  });
});
