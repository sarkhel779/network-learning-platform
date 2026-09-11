import { describe, expect, it } from "vitest";

import { parseWaitlistJoinInput } from "./waitlist-input.schema";

describe("parseWaitlistJoinInput", () => {
  it("accepts explicit consent with optional published attribution", () => {
    expect(parseWaitlistJoinInput({ consent: true })).toEqual({ consent: true });
    expect(parseWaitlistJoinInput({
      consent: true,
      sourceLessonSlug: "hosts-and-network-devices",
    })).toEqual({ consent: true, sourceLessonSlug: "hosts-and-network-devices" });
  });

  it.each([
    {},
    { consent: false },
    { consent: true, email: "learner@example.test" },
    { consent: true, sourceLessonSlug: "" },
    { consent: true, sourceLessonSlug: "not-a-lesson" },
    "invalid",
  ])("rejects unsafe or malformed input %#", (input) => {
    expect(() => parseWaitlistJoinInput(input)).toThrow();
  });
});
