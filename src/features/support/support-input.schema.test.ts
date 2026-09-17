import { describe, expect, it } from "vitest";

import { parseSupportTicketCreate, parseSupportTicketMessage } from "./support-input.schema";

describe("support ticket creation input", () => {
  it("trims the subject and body", () => {
    expect(parseSupportTicketCreate({ subject: " Login issue ", body: " I cannot sign in. " })).toEqual({
      subject: "Login issue", body: "I cannot sign in.",
    });
  });

  it("rejects an empty subject or body", () => {
    expect(() => parseSupportTicketCreate({ subject: "   ", body: "body" })).toThrow();
    expect(() => parseSupportTicketCreate({ subject: "subject", body: "   " })).toThrow();
  });

  it("bounds field lengths", () => {
    expect(() => parseSupportTicketCreate({ subject: "a".repeat(151), body: "body" })).toThrow();
    expect(() => parseSupportTicketCreate({ subject: "subject", body: "a".repeat(4001) })).toThrow();
  });

  it("rejects unrecognized fields", () => {
    expect(() => parseSupportTicketCreate({ subject: "subject", body: "body", priority: "high" })).toThrow();
  });
});

describe("support ticket message input", () => {
  it("trims the body", () => {
    expect(parseSupportTicketMessage({ body: " Still broken. " })).toEqual({ body: "Still broken." });
  });

  it("rejects an empty body", () => {
    expect(() => parseSupportTicketMessage({ body: "   " })).toThrow();
  });
});
