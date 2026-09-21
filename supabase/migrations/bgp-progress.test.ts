import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("BGP progress migration", () => {
  const read = () => readFileSync(resolve("supabase/migrations/202609190005_add_bgp_progress.sql"), "utf8");
  it("registers one idempotent, ordered version-one manifest", () => {
    const sql = read();
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("'lesson_bgp', 1, 3");
    expect(sql.match(/'bgp_[^']+'/g)).toHaveLength(12);
    expect(sql).toContain("'interactive-bgp-session-establishment'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
  });
});
