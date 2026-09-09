import { beforeEach, describe, expect, it } from "vitest";

import { createPendingProgressStore, type PendingProgressEvent } from "./pending-progress-store";

const event = (key: string, itemId = "read_intro"): PendingProgressEvent => ({
  pathwayId: "path_networking_foundations", lessonId: "lesson_demo", contentVersion: 1,
  idempotencyKey: key, eventType: "section_completed", itemId, itemKind: "section",
  anchor: "intro", metadata: {}, createdAt: "2026-09-09T00:00:00.000Z",
});

beforeEach(() => localStorage.clear());

describe("pending progress store", () => {
  it("hydrates events only from the current learner namespace", () => {
    const one = createPendingProgressStore(localStorage, "learner-1");
    one.enqueue(event("11111111-1111-4111-8111-111111111111"));
    expect(createPendingProgressStore(localStorage, "learner-1").list()).toHaveLength(1);
    expect(createPendingProgressStore(localStorage, "learner-2").list()).toEqual([]);
  });

  it("deduplicates stable keys, preserves order, and removes confirmed entries", () => {
    const store = createPendingProgressStore(localStorage, "learner-1");
    store.enqueue(event("11111111-1111-4111-8111-111111111111"));
    store.enqueue(event("11111111-1111-4111-8111-111111111111"));
    store.enqueue(event("22222222-2222-4222-8222-222222222222", "read_second"));
    expect(store.list().map(({ itemId }) => itemId)).toEqual(["read_intro", "read_second"]);
    store.remove("11111111-1111-4111-8111-111111111111");
    expect(store.list().map(({ itemId }) => itemId)).toEqual(["read_second"]);
  });

  it("caps retained entries", () => {
    const store = createPendingProgressStore(localStorage, "learner-1", 2);
    store.enqueue(event("11111111-1111-4111-8111-111111111111", "one"));
    store.enqueue(event("22222222-2222-4222-8222-222222222222", "two"));
    store.enqueue(event("33333333-3333-4333-8333-333333333333", "three"));
    expect(store.list().map(({ itemId }) => itemId)).toEqual(["two", "three"]);
  });
});
