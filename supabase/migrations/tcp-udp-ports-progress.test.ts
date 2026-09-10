import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("TCP UDP and ports progress migration", () => {
  it("registers one transactional and idempotent 18-item manifest", () => {
    const sql = readFileSync(resolve("supabase/migrations/202609100004_add_tcp_udp_ports_progress.sql"), "utf8");
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("'lesson_tcp_udp_and_ports', 1, 18");
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version, item_id) do update");
    const itemIds = [...sql.matchAll(/'((?:tcp_udp_and_ports)_[^']+)'/g)].map((match) => match[1]);
    expect(itemIds).toHaveLength(18);
    expect(new Set(itemIds).size).toBe(18);
    expect(sql).toContain("'interactive-tcp-connection'");
    expect(sql).toContain("'interactive-tcp-udp-port-delivery'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
  });
});
