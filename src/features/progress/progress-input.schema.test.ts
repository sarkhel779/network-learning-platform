import { describe, expect, it } from "vitest";

import { parseProgressMutationInput } from "./progress-input.schema";

const valid = {
  pathwayId: "path_networking_foundations",
  lessonId: "lesson_how_networks_communicate",
  contentVersion: 1,
  idempotencyKey: "11111111-1111-4111-8111-111111111111",
  eventType: "knowledge_check_attempted",
  itemId: "how_networks_communicate_check_1",
  itemKind: "knowledge_check",
  anchor: "how-networks-communicate-check-1",
  answerCorrect: false,
  metadata: {},
};

describe("parseProgressMutationInput", () => {
  it("accepts an incorrect knowledge-check attempt", () => {
    expect(parseProgressMutationInput(valid)).toMatchObject(valid);
  });

  it.each([
    ["user-controlled status", { ...valid, status: "completed" }],
    ["user ID", { ...valid, userId: "22222222-2222-4222-8222-222222222222" }],
    ["percentage", { ...valid, completionPercent: 100 }],
    ["external URL metadata", { ...valid, metadata: { returnTo: "https://attacker.example" } }],
    ["oversized metadata", { ...valid, metadata: { note: "x".repeat(5000) } }],
    ["mismatched kind", { ...valid, eventType: "section_completed" }],
    ["invalid UUID", { ...valid, idempotencyKey: "not-a-uuid" }],
  ])("rejects %s", (_label, input) => {
    expect(() => parseProgressMutationInput(input)).toThrow();
  });
});
