import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("IPv6 progress migration", () => {
  const read = () => readFileSync(resolve("supabase/migrations/202609100001_add_ipv6_fundamentals_progress.sql"), "utf8");

  it("registers one idempotent, ordered version-one manifest", () => {
    const sql = read();
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("'lesson_ipv6_fundamentals', 1, 16");
    expect(sql.match(/'ipv6_fundamentals_[^']+'/g)).toHaveLength(16);
    expect(sql).toContain("'interactive-address-explorer'");
    expect(sql).toContain("'interactive-ndp-slaac'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
  });
});
