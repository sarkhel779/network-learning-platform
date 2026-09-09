import { describe, expect, it } from "vitest";

import { toViewer } from "./session";

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
