import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("wireless fundamentals progress migration", () => {
  const read = () => readFileSync(resolve("supabase/migrations/202610060001_add_wireless_fundamentals_progress.sql"), "utf8");
  it("registers one idempotent, ordered version-one manifest", () => {
    const sql = read();
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("'lesson_wireless_fundamentals', 1, 3");
    expect(sql.match(/'wireless_fundamentals_[^']+'/g)).toHaveLength(12);
    expect(sql).toContain("'interactive-csma-ca-and-the-hidden-node-problem'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
    expect(sql.match(/'path_wireless_networking'/g)?.length).toBeGreaterThanOrEqual(13);
  });
});
