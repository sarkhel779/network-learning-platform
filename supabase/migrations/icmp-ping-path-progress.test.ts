import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ICMP ping and path progress migration", () => {
  const read = () => readFileSync(
    resolve("supabase/migrations/202609100003_add_icmp_ping_path_progress.sql"),
    "utf8",
  );

  it("registers one transactional and idempotent 18-item manifest", () => {
    const sql = read();
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("'lesson_icmp_ping_and_path_discovery', 1, 18");
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version, item_id) do update");

    const itemIds = [...sql.matchAll(/'((?:icmp_ping_and_path_discovery)_[^']+)'/g)]
      .map((match) => match[1]);
    expect(itemIds).toHaveLength(18);
    expect(new Set(itemIds).size).toBe(18);
    expect(sql).toContain("'interactive-ping-evidence'");
    expect(sql).toContain("'interactive-traceroute-discovery'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
  });
});
