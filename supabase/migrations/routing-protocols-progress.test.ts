import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("routing protocols progress migration", () => {
  const read = () => readFileSync(resolve("supabase/migrations/202609190001_add_routing_protocols_progress.sql"), "utf8");
  it("registers one idempotent, ordered version-one manifest", () => {
    const sql = read();
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("'lesson_routing_protocols', 1, 15");
    expect(sql.match(/'routing_protocols_[^']+'/g)).toHaveLength(15);
    expect(sql).toContain("'interactive-protocol-selection'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
  });
});
