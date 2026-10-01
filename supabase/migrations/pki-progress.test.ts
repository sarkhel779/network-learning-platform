import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("pki progress migration", () => {
  const read = () => readFileSync(resolve("supabase/migrations/202610050001_add_pki_progress.sql"), "utf8");
  it("registers one idempotent, ordered version-one manifest", () => {
    const sql = read();
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("'lesson_pki', 1, 3");
    expect(sql.match(/'pki_[^']+'/g)).toHaveLength(12);
    expect(sql).toContain("'interactive-certificate-chain-validation'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
    expect(sql.match(/'path_security_protocols'/g)?.length).toBeGreaterThanOrEqual(13);
  });
});
