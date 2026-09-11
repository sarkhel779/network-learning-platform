import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getLessonProgressManifest } from "../../src/features/progress/progress-manifests";

describe("NAT and PAT progress migration", () => {
  it("mirrors the runtime manifest in one transactional idempotent migration", () => {
    const sql = readFileSync(resolve("supabase/migrations/202609110004_add_nat_pat_progress.sql"), "utf8");
    const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_nat_pat_and_the_complete_internet_packet_journey");
    expect(sql.trimStart()).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 15");
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version, item_id) do update");
    const rows = [...sql.matchAll(/^  \('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, '([^']+)', (\d+), '([^']+)', '([^']+)', '([^']+)', true\)[,;]?$/gm)];
    expect(rows).toHaveLength(15);
    expect(rows.map((row) => ({ itemId: row[1], ordinal: Number(row[2]), kind: row[3], label: row[4], anchor: row[5] })))
      .toEqual(manifest.items.map((item, index) => ({ itemId: item.itemId, ordinal: index + 1, kind: item.kind, label: item.label, anchor: item.anchor })));
  });
});
