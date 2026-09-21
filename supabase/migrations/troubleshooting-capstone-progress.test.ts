import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getLessonProgressManifest } from "../../src/features/progress/progress-manifests";

describe("troubleshooting capstone progress migration", () => {
  it("mirrors the runtime manifest transactionally and idempotently", () => {
    const sql = readFileSync(resolve("supabase/migrations/202609110005_add_troubleshooting_capstone_progress.sql"), "utf8");
    const upgrade = readFileSync(resolve("supabase/migrations/202609200001_quiz_only_completion.sql"), "utf8");
    const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_systematic_network_troubleshooting_capstone");
    expect(sql).toMatch(/^begin;[\s\S]*on conflict[\s\S]*commit;\s*$/i);
    expect(sql).toContain("'lesson_systematic_network_troubleshooting_capstone', 1, 12");
    const rows = [...sql.matchAll(/^  \('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, '([^']+)', (\d+), '([^']+)', '([^']+)', '([^']+)', (true|false)\)[,;]?$/gm)];
    expect(rows).toHaveLength(15);
    expect(manifest.items).toHaveLength(18);
    expect(manifest.items.filter(({ required }) => required).map(({ itemId }) => itemId)).toEqual([
      "capstone_check_1", "capstone_check_2", "capstone_check_3",
    ]);
    for (const item of manifest.items) expect(`${sql}\n${upgrade}`).toContain(`'${item.itemId}'`);
    expect(upgrade).toMatch(/drop trigger if exists sync_optional_lesson_progress_items/i);
    expect(upgrade).toMatch(/set required = \(kind = 'knowledge_check'\)/i);
  });
});
