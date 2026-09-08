import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { loadAccountSwitchingScenarios } from "./switching.account-loader";

describe("account switching loader", () => {
  it("returns six validated scenarios for authorized server content", () => {
    expect(loadAccountSwitchingScenarios()?.map(({ id }) => id)).toEqual([
      "first-frame-unknown-destination",
      "reply-after-learning",
      "known-unicast",
      "same-segment-filtering",
      "broadcast-frame",
      "aged-out-destination",
    ]);
  });
});
