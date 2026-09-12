import { describe, expect, it } from "vitest";

import { parseLearnerEdit } from "./admin-input.schema";

describe("learner edit input", () => {
  it("trims permitted profile fields and optional notes", () => {
    expect(parseLearnerEdit({ displayName: " Ada ", learningLevel: "beginner", note: " Called support " })).toEqual({
      displayName: "Ada", learningLevel: "beginner", note: "Called support",
    });
  });

  it("rejects plan, waitlist, and unrecognized fields", () => {
    expect(() => parseLearnerEdit({ displayName: "Ada", learningLevel: null, plan: "pro" })).toThrow();
    expect(() => parseLearnerEdit({ displayName: "Ada", learningLevel: null, waitlistStatus: "joined" })).toThrow();
  });

  it("bounds field lengths", () => {
    expect(() => parseLearnerEdit({ displayName: "a".repeat(81), learningLevel: null })).toThrow();
    expect(() => parseLearnerEdit({ displayName: null, learningLevel: null, note: "x".repeat(1001) })).toThrow();
  });
});
