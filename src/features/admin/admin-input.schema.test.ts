import { describe, expect, it } from "vitest";

import {
  parseBillingGrant,
  parseBillingRevoke,
  parseLearnerEdit,
  parseLessonMove,
  parseLessonPublication,
  parseStaffAssignment,
  parseSupportTicketReply,
  parseSupportTicketStatusChange,
} from "./admin-input.schema";

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

describe("support ticket reply input", () => {
  it("coerces the ticket id and trims the reply body", () => {
    expect(parseSupportTicketReply({ ticketId: "42", body: " We are looking into this. " })).toEqual({
      ticketId: 42, body: "We are looking into this.",
    });
  });

  it("rejects a non-positive ticket id or an empty body", () => {
    expect(() => parseSupportTicketReply({ ticketId: "0", body: "Hello" })).toThrow();
    expect(() => parseSupportTicketReply({ ticketId: "1", body: "   " })).toThrow();
  });
});

describe("support ticket status input", () => {
  it("accepts a recognized status", () => {
    expect(parseSupportTicketStatusChange({ ticketId: "7", status: "resolved" })).toEqual({ ticketId: 7, status: "resolved" });
  });

  it("rejects an unrecognized status", () => {
    expect(() => parseSupportTicketStatusChange({ ticketId: "7", status: "archived" })).toThrow();
  });
});

describe("billing grant input", () => {
  it("trims and lowercases the email, keeping the plan id as-is", () => {
    expect(parseBillingGrant({ email: " Ada@Example.com ", planId: "pro_monthly" })).toEqual({
      email: "ada@example.com", planId: "pro_monthly",
    });
  });

  it("rejects a malformed email or an invalid plan id", () => {
    expect(() => parseBillingGrant({ email: "not-an-email", planId: "pro_monthly" })).toThrow();
    expect(() => parseBillingGrant({ email: "ada@example.com", planId: "Pro Monthly" })).toThrow();
  });

  it("rejects unrecognized fields", () => {
    expect(() => parseBillingGrant({ email: "ada@example.com", planId: "pro_monthly", note: "hi" })).toThrow();
  });
});

describe("billing revoke input", () => {
  it("coerces the subscription id", () => {
    expect(parseBillingRevoke({ subscriptionId: "42" })).toEqual({ subscriptionId: 42 });
  });

  it("rejects a non-positive subscription id", () => {
    expect(() => parseBillingRevoke({ subscriptionId: "0" })).toThrow();
  });
});
