import { describe, expect, it } from "vitest";

import { resolveTestViewer, toViewer } from "./session";

describe("toViewer", () => {
  it("returns only workspace-safe identity fields", () => {
    expect(
      toViewer({
        id: "user-1",
        email: "private@example.com",
        user_metadata: {
          full_name: "Pranita",
          avatar_url: "https://example.test/a.png",
          role: "admin",
        },
      }),
    ).toEqual({
      id: "user-1",
      displayName: "Pranita",
      avatarUrl: "https://example.test/a.png",
    });
  });

  it("returns null for no authenticated user", () => {
    expect(toViewer(null)).toBeNull();
  });

  it("ignores malformed profile metadata", () => {
    expect(
      toViewer({
        id: "user-2",
        user_metadata: { full_name: 42, avatar_url: false },
      }),
    ).toEqual({ id: "user-2", displayName: null, avatarUrl: null });
  });
});

describe("resolveTestViewer", () => {
  it("returns null when the server test adapter is not explicitly enabled", () => {
    expect(resolveTestViewer("learner-1", {})).toBeNull();
    expect(resolveTestViewer("learner-1", { NODE_ENV: "development", PLAYWRIGHT_TEST_SESSION: "1" })).toBeNull();
    expect(resolveTestViewer("learner-1", { NODE_ENV: "staging", PLAYWRIGHT_TEST_SESSION: "1" })).toBeNull();
    expect(resolveTestViewer("learner-1", { NODE_ENV: "production", PLAYWRIGHT_TEST_SESSION: "1" })).toBeNull();
  });

  it("returns a minimal viewer only for the explicitly enabled test harness", () => {
    expect(resolveTestViewer("learner-1", { NODE_ENV: "test", PLAYWRIGHT_TEST_SESSION: "1" })).toEqual({
      id: "learner-1",
      displayName: "Playwright learner",
      avatarUrl: null,
    });
  });
});
