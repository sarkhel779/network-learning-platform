import { describe, expect, it } from "vitest";

import { parseLearnerEdit, parseLessonMove, parseLessonPublication, parseStaffAssignment } from "./admin-input.schema";

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

describe("staff assignment input", () => {
  it("trims and lowercases the email, keeping a recognized role", () => {
    expect(parseStaffAssignment({ email: " Ada@Example.com ", role: "content_editor" })).toEqual({
      email: "ada@example.com", role: "content_editor",
    });
  });

  it("rejects an unrecognized role or malformed email", () => {
    expect(() => parseStaffAssignment({ email: "ada@example.com", role: "owner" })).toThrow();
    expect(() => parseStaffAssignment({ email: "not-an-email", role: "finance" })).toThrow();
  });

  it("rejects unrecognized fields", () => {
    expect(() => parseStaffAssignment({ email: "ada@example.com", role: "finance", note: "hi" })).toThrow();
  });
});

describe("lesson publication input", () => {
  it("coerces the published flag to a boolean", () => {
    expect(parseLessonPublication({ lessonId: "lesson_how_networks_communicate", published: "false" })).toEqual({
      lessonId: "lesson_how_networks_communicate", published: false,
    });
  });

  it("rejects a lesson id outside the catalogue's naming convention", () => {
    expect(() => parseLessonPublication({ lessonId: "how-networks-communicate", published: "true" })).toThrow();
    expect(() => parseLessonPublication({ lessonId: "module_network_and_device_essentials", published: "true" })).toThrow();
  });
});

describe("lesson move input", () => {
  it("accepts a valid module, lesson, and direction", () => {
    expect(parseLessonMove({
      moduleId: "module_network_and_device_essentials",
      lessonId: "lesson_how_networks_communicate",
      direction: "up",
    })).toEqual({
      moduleId: "module_network_and_device_essentials",
      lessonId: "lesson_how_networks_communicate",
      direction: "up",
    });
  });

  it("rejects an unrecognized direction or malformed ids", () => {
    expect(() => parseLessonMove({ moduleId: "module_a", lessonId: "lesson_a", direction: "sideways" })).toThrow();
    expect(() => parseLessonMove({ moduleId: "lesson_a", lessonId: "lesson_a", direction: "up" })).toThrow();
  });
});
