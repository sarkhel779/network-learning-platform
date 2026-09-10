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
    expect(lessonProgressManifests).toHaveLength(19);

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
    const migration = [
      "supabase/migrations/202609090002_create_learner_progress.sql",
      "supabase/migrations/202609090003_add_ipv4_addressing_progress.sql",
      "supabase/migrations/202609090004_add_subnetting_fundamentals_progress.sql",
      "supabase/migrations/202609100001_add_ipv6_fundamentals_progress.sql",
      "supabase/migrations/202609100002_add_routing_tables_progress.sql",
      "supabase/migrations/202609100003_add_icmp_ping_path_progress.sql",
      "supabase/migrations/202609100004_add_tcp_udp_ports_progress.sql",
    ].map((path) => readFileSync(resolve(path), "utf8")).join("\n");
    const itemIds = lessonProgressManifests.flatMap(({ items }) =>
      items.map(({ itemId }) => itemId));

    for (const itemId of itemIds) {
      expect(migration.split(`'${itemId}'`)).toHaveLength(2);
    }

    expect(migration.match(/^  \('path_networking_foundations', 'lesson_[^']+', 1, \d+\)[,;]?$/gm))
      .toHaveLength(lessonProgressManifests.length);
  });

  it("registers the routing lesson players and three checks as 18 required items", () => {
    const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_routing_tables_and_default_routes");
    expect(manifest.items).toHaveLength(18);
    expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ anchor }) => anchor)).toEqual(["interactive-route-selection", "interactive-hop-by-hop-forwarding"]);
    expect(manifest.items.filter(({ kind }) => kind === "knowledge_check")).toHaveLength(3);
  });

  it("registers the ICMP lesson in catalog order with two players and three checks", () => {
    const manifest = getLessonProgressManifest(
      "path_networking_foundations",
      "lesson_icmp_ping_and_path_discovery",
    );
    expect(manifest.items).toHaveLength(18);
    expect(new Set(manifest.items.map(({ itemId }) => itemId)).size).toBe(18);
    expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ anchor }) => anchor))
      .toEqual(["interactive-ping-evidence", "interactive-traceroute-discovery"]);
    expect(manifest.items.filter(({ kind }) => kind === "knowledge_check")).toHaveLength(3);
    expect(manifest.items.some(({ anchor }) => anchor === "pro-deep-dive")).toBe(false);

    const pathway = pathways.find(({ id }) => id === "path_networking_foundations");
    const lesson = pathway?.modules.flatMap(({ lessons }) => lessons)
      .find(({ id }) => id === "lesson_icmp_ping_and_path_discovery");
    const expectedCatalogAnchors = lesson?.sections
      ?.filter(({ access, id }) => access !== "pro" && id !== "knowledge-check-summary")
      .map(({ id }) => id);
    expect(manifest.items.slice(0, 15).map(({ anchor }) => anchor)).toEqual(expectedCatalogAnchors);
  });

  it("registers the transport lesson in catalog order with two players and three checks", () => {
    const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_tcp_udp_and_ports");
    expect(manifest.items).toHaveLength(18);
    expect(new Set(manifest.items.map(({ itemId }) => itemId)).size).toBe(18);
    expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ anchor }) => anchor))
      .toEqual(["interactive-tcp-connection", "interactive-tcp-udp-port-delivery"]);
    expect(manifest.items.filter(({ kind }) => kind === "knowledge_check").map(({ itemId }) => itemId))
      .toEqual(["tcp_udp_and_ports_check_1", "tcp_udp_and_ports_check_2", "tcp_udp_and_ports_check_3"]);
    expect(manifest.items.some(({ anchor }) => anchor === "pro-deep-dive")).toBe(false);
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
