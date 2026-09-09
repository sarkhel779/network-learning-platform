import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("routing tables progress migration", () => {
  const read = () => readFileSync(resolve("supabase/migrations/202609100002_add_routing_tables_progress.sql"), "utf8");
  it("registers one idempotent, ordered version-one manifest", () => {
    const sql = read();
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("'lesson_routing_tables_and_default_routes', 1, 18");
    expect(sql.match(/'routing_tables_and_default_routes_[^']+'/g)).toHaveLength(18);
    expect(sql).toContain("'interactive-route-selection'");
    expect(sql).toContain("'interactive-hop-by-hop-forwarding'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
  });
});
