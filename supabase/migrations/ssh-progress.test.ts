import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ssh progress migration", () => {
  const read = () => readFileSync(resolve("supabase/migrations/202610040001_add_ssh_progress.sql"), "utf8");
  it("registers one idempotent, ordered version-one manifest", () => {
    const sql = read();
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("'lesson_ssh', 1, 3");
    expect(sql.match(/'ssh_[^']+'/g)).toHaveLength(12);
    expect(sql).toContain("'interactive-ssh-key-authentication'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
    expect(sql.match(/'path_security_protocols'/g)?.length).toBeGreaterThanOrEqual(13);
  });
});
