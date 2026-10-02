import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("wireless site design and roaming progress migration", () => {
  const read = () => readFileSync(resolve("supabase/migrations/202610090001_add_wireless_site_design_and_roaming_progress.sql"), "utf8");
  it("registers one idempotent, ordered version-one manifest", () => {
    const sql = read();
    expect(sql).toMatch(/^begin;/);
    expect(sql.trimEnd()).toMatch(/commit;$/);
    expect(sql).toContain("on conflict (pathway_id, lesson_id, content_version) do update");
    expect(sql).toContain("'lesson_wireless_site_design_and_roaming', 1, 3");
    expect(sql.match(/'wireless_site_design_and_roaming_[^']+'/g)).toHaveLength(12);
    expect(sql).toContain("'interactive-the-sticky-client-and-the-roaming-trigger'");
    expect(sql.match(/'knowledge_check'/g)).toHaveLength(3);
    expect(sql.match(/'path_wireless_networking'/g)?.length).toBeGreaterThanOrEqual(13);
  });
});
