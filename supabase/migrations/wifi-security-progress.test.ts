import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("wifi security progress migration", () => {
  const read = () => readFileSync(resolve("supabase/migrations/202610070001_add_wifi_security_progress.sql"), "utf8");
  it("registers one idempotent, ordered version-one manifest", () => {
    const sql = read();
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("'lesson_wifi_security', 1, 3");
    expect(sql.match(/'wifi_security_[^']+'/g)).toHaveLength(12);
    expect(sql).toContain("'interactive-wpa2-handshake-and-the-wpa3-fix'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
    expect(sql.match(/'path_wireless_networking'/g)?.length).toBeGreaterThanOrEqual(13);
  });
});
