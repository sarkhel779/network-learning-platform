import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getLessonProgressManifest } from "../../src/features/progress/progress-manifests";

describe("troubleshooting capstone progress migration", () => {
  it("mirrors the runtime manifest transactionally and idempotently", () => {
    const sql = readFileSync(resolve("supabase/migrations/202609110005_add_troubleshooting_capstone_progress.sql"), "utf8");
    const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_systematic_network_troubleshooting_capstone");
    expect(sql).toMatch(/^begin;[\s\S]*on conflict[\s\S]*commit;\s*$/i);
    expect(sql).toContain("'lesson_systematic_network_troubleshooting_capstone', 1, 12");
    const rows = [...sql.matchAll(/^  \('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, '([^']+)', (\d+), '([^']+)', '([^']+)', '([^']+)', (true|false)\)[,;]?$/gm)];
    expect(rows.map((row) => ({ itemId: row[1], ordinal: Number(row[2]), kind: row[3], label: row[4], anchor: row[5], required: row[6] === "true" })))
      .toEqual(manifest.items.map((item, index) => ({ itemId: item.itemId, ordinal: index + 1, kind: item.kind, label: item.label, anchor: item.anchor, required: item.required })));
    expect(rows).toHaveLength(15);
    expect(rows.filter((row) => row[6] === "true")).toHaveLength(12);
    expect(sql).toMatch(/sync_optional_lesson_progress_items[\s\S]*not i\.required[\s\S]*after update of completed_item_ids/i);
  });
});
