import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { pathways } from "@/features/catalog/catalog.data";

import {
  getLessonProgressManifest,
  lessonProgressManifests,
} from "./progress-manifests";

const publishedLessons = pathways.flatMap((pathway) =>
  pathway.modules.flatMap((module) =>
    module.lessons
      .filter((lesson) => lesson.published)
      .map((lesson) => ({ pathway, lesson })),
  ),
);

describe("lessonProgressManifests", () => {
  it("defines exactly one manifest for every published lesson", () => {
    expect(lessonProgressManifests).toHaveLength(13);

    expect(lessonProgressManifests.map(({ lessonId }) => lessonId).sort()).toEqual(
      publishedLessons.map(({ lesson }) => lesson.id).sort(),
    );
  });

  it("uses catalog anchors for section requirements and excludes Pro sections", () => {
    for (const { pathway, lesson } of publishedLessons) {
      const manifest = getLessonProgressManifest(pathway.id, lesson.id);
      const catalogSections = lesson.sections ?? [];

      for (const item of manifest.items.filter(({ kind }) => kind === "section")) {
        const section = catalogSections.find(({ id }) => id === item.anchor);
        expect(section, `${lesson.id}:${item.itemId}`).toBeDefined();
        expect(section?.access, `${lesson.id}:${item.itemId}`).not.toBe("pro");
      }
    }
  });

  it("returns a manifest only for the matching pathway and lesson", () => {
    expect(getLessonProgressManifest(
      "path_networking_foundations",
      "lesson_arp_and_local_delivery",
    ).lessonId).toBe("lesson_arp_and_local_delivery");

    expect(() => getLessonProgressManifest(
      "path_networking_foundations",
      "lesson_missing",
    )).toThrow(/progress manifest not found/i);
  });

  it("keeps every stable item ID mirrored in the Supabase migration", () => {
    const migration = readFileSync(
      resolve("supabase/migrations/202609090002_create_learner_progress.sql"),
      "utf8",
    );
    const itemIds = lessonProgressManifests.flatMap(({ items }) =>
      items.map(({ itemId }) => itemId));

    for (const itemId of itemIds) {
      expect(migration.split(`'${itemId}'`)).toHaveLength(2);
    }

    expect(migration.match(/^  \('path_networking_foundations', 'lesson_[^']+', 1, \d+\)[,;]?$/gm))
      .toHaveLength(lessonProgressManifests.length);
  });

  it("parenthesizes the CASE expression used by the progress event guard", () => {
    const migration = readFileSync(
      resolve("supabase/migrations/202609090002_create_learner_progress.sql"),
      "utf8",
    );

    expect(migration).toContain("if p_event_type <> (case v_item.kind");
    expect(migration).toContain("else 'knowledge_check_attempted' end) then");
  });

  it("assigns every knowledge check its manifest ID in account content", () => {
    const seen = new Set<string>();
    for (const { pathway, lesson } of publishedLessons) {
      const source = readFileSync(resolve(
        `src/content/${pathway.slug}/${lesson.slug}.account.mdx`,
      ), "utf8");
      const contentIds = [...source.matchAll(/<KnowledgeCheck\s+progressItemId="([^"]+)"/g)]
        .map((match) => match[1]);
      const manifestIds = getLessonProgressManifest(pathway.id, lesson.id).items
        .filter(({ kind }) => kind === "knowledge_check")
        .map(({ itemId }) => itemId);
      expect(contentIds, lesson.id).toEqual(manifestIds);
      for (const itemId of contentIds) {
        expect(seen.has(itemId), itemId).toBe(false);
        seen.add(itemId);
      }
    }
  });
});
