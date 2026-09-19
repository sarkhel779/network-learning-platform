import { describe, expect, it } from "vitest";
import { isProgressTestAdapterEnabled, recordTestProgress } from "./progress-test-adapter";

describe("progress test adapter guard", () => {
  it.each([undefined, "staging", "production"])("rejects NODE_ENV=%s", (NODE_ENV) => {
    expect(isProgressTestAdapterEnabled({ NODE_ENV, PLAYWRIGHT_TEST_SESSION: "1", PACKETSECRETS_TEST_ENV: "test" })).toBe(false);
  });
  it("requires both exact test guards", () => {
    expect(isProgressTestAdapterEnabled({ NODE_ENV: "test", PLAYWRIGHT_TEST_SESSION: "1", PACKETSECRETS_TEST_ENV: "test" })).toBe(true);
    expect(isProgressTestAdapterEnabled({ NODE_ENV: "development", PLAYWRIGHT_TEST_SESSION: "1", PACKETSECRETS_TEST_ENV: "test" })).toBe(true);
    expect(isProgressTestAdapterEnabled({ NODE_ENV: "test", PLAYWRIGHT_TEST_SESSION: "true", PACKETSECRETS_TEST_ENV: "test" })).toBe(false);
    expect(isProgressTestAdapterEnabled({ NODE_ENV: "development", PLAYWRIGHT_TEST_SESSION: "1" })).toBe(false);
  });
});

describe("quiz-only completion", () => {
  const base = {
    pathwayId: "path_networking_foundations",
    lessonId: "lesson_how_networks_communicate",
    contentVersion: 1,
    metadata: {},
    createdAt: "2026-09-20T00:00:00.000Z",
  } as const;

  it("does not advance for sections, interactives, or incorrect quiz answers", () => {
    const userId = "quiz-only-no-advance";
    const section = recordTestProgress(userId, {
      ...base, idempotencyKey: crypto.randomUUID(), eventType: "section_completed", itemId: "how_networks_communicate_section_what_a_network_is", itemKind: "section", anchor: "what-a-network-is",
    });
    const interactive = recordTestProgress(userId, {
      ...base, idempotencyKey: crypto.randomUUID(), eventType: "interactive_completed", itemId: "how_networks_communicate_interactive_packet_journey", itemKind: "interactive", anchor: "packet-journey",
    });
    const incorrect = recordTestProgress(userId, {
      ...base, idempotencyKey: crypto.randomUUID(), eventType: "knowledge_check_attempted", itemId: "how_networks_communicate_check_1", itemKind: "knowledge_check", anchor: "how-networks-communicate-check-1", answerCorrect: false,
    });

    expect(section?.completionPercent).toBe(0);
    expect(interactive?.completionPercent).toBe(0);
    expect(incorrect).toMatchObject({ completionPercent: 0, status: "in_progress", incorrectCheckCount: 1 });
  });

  it("completes the lesson when its required quiz answer is correct", () => {
    const result = recordTestProgress("quiz-only-correct", {
      ...base, idempotencyKey: crypto.randomUUID(), eventType: "knowledge_check_attempted", itemId: "how_networks_communicate_check_1", itemKind: "knowledge_check", anchor: "how-networks-communicate-check-1", answerCorrect: true,
    });

    expect(result).toMatchObject({ completionPercent: 100, status: "completed", completedItemIds: ["how_networks_communicate_check_1"] });
  });
});
