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

  it("redefines the TCP manifest without removing learner events and registers UDP", () => {
    const sql = readFileSync(resolve("supabase/migrations/202609120001_split_tcp_udp_progress.sql"), "utf8");
    expect(sql).toContain("'lesson_tcp_udp_and_ports', 1, 20");
    expect(sql).toContain("'lesson_udp_datagrams_and_ports', 1, 14");
    expect(sql).toContain("tcp_udp_and_ports_interactive_interactive_tcp_connection");
    expect(sql).toContain("udp_datagrams_and_ports_interactive_interactive_udp_port_delivery");
    expect(sql).toContain("'tcp_reliable_transport_check_1'");
    expect(sql).toContain("'tcp_reliable_transport_check_2'");
    expect(sql).toContain("'tcp_reliable_transport_check_3'");
    expect(sql).not.toMatch(/'tcp_udp_and_ports_check_[123]', \d+, 'knowledge_check'/);
    expect(sql).not.toMatch(/delete from public\.learner_progress_events/i);
    expect(sql).toContain("update public.learner_lesson_attempts");
  });
  it("adds the separate fast retransmit checkpoint without discarding prior TCP attempts", () => {
    const sql = readFileSync(resolve("supabase/migrations/202609120002_add_tcp_fast_retransmit_progress.sql"), "utf8");
    expect(sql).toContain("set required_item_count = 21");
    expect(sql).toContain("tcp_udp_and_ports_interactive_interactive_fast_retransmit");
    expect(sql).toContain("update public.learner_lesson_attempts");
    expect(sql).toMatch(/when cardinality\(r\.completed_ids\) = 0 then 'not_started'/);
    expect(sql).not.toMatch(/delete from public\.learner_progress_events/i);
  });
});
