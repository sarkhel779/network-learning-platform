import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("routing fundamentals progress migration", () => {
  const read = () => readFileSync(resolve("supabase/migrations/202609190001_add_routing_fundamentals_progress.sql"), "utf8");
  it("registers one idempotent, ordered version-one manifest", () => {
    const sql = read();
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("'lesson_routing_fundamentals', 1, 12");
    expect(sql.match(/'routing_fundamentals_[^']+'/g)).toHaveLength(12);
    expect(sql).toContain("'interactive-route-selection'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
    expect(sql.match(/'path_routing_protocols'/g)?.length).toBeGreaterThanOrEqual(13);
  });
});
