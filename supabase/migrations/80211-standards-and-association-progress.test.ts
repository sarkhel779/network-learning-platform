import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("802.11 standards and association progress migration", () => {
  const read = () => readFileSync(resolve("supabase/migrations/202610080001_add_80211_standards_and_association_progress.sql"), "utf8");
  it("registers one idempotent, ordered version-one manifest", () => {
    const sql = read();
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("'lesson_80211_standards_and_association', 1, 3");
    expect(sql.match(/'80211_standards_and_association_[^']+'/g)).toHaveLength(12);
    expect(sql).toContain("'interactive-the-association-state-machine'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
    expect(sql.match(/'path_wireless_networking'/g)?.length).toBeGreaterThanOrEqual(13);
  });
});
