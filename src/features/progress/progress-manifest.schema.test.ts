import { describe, expect, it } from "vitest";

import { parseLessonProgressManifest } from "./progress-manifest.schema";

const validManifest = {
  pathwayId: "path_networking_foundations",
  lessonId: "lesson_demo",
  contentVersion: 1,
  items: [
    {
      itemId: "demo_read_intro",
      kind: "section",
      label: "Introduction",
      anchor: "introduction",
      required: true,
    },
  ],
} as const;

describe("parseLessonProgressManifest", () => {
  it("accepts a versioned manifest with stable required items", () => {
    expect(parseLessonProgressManifest(validManifest)).toEqual(validManifest);
  });

  it("rejects duplicate item identifiers", () => {
    expect(() => parseLessonProgressManifest({
      ...validManifest,
      items: [
        validManifest.items[0],
        { ...validManifest.items[0], anchor: "second" },
      ],
    })).toThrow(/duplicate itemId/i);
  });

  it("rejects duplicate anchors", () => {
    expect(() => parseLessonProgressManifest({
      ...validManifest,
      items: [
        validManifest.items[0],
        { ...validManifest.items[0], itemId: "demo_read_second" },
      ],
    })).toThrow(/duplicate anchor/i);
  });

  it.each([
    [{ ...validManifest, contentVersion: 0 }, /contentVersion/i],
    [{ ...validManifest, items: [] }, /items/i],
    [{
      ...validManifest,
      items: [{ ...validManifest.items[0], kind: "video" }],
    }, /kind/i],
  ])("rejects an invalid manifest %#", (manifest, message) => {
    expect(() => parseLessonProgressManifest(manifest)).toThrow(message);
  });
});
