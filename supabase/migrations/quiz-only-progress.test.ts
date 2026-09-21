import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve("supabase/migrations/202609200001_quiz_only_completion.sql");

describe("quiz-only completion migration", () => {
  it("installs the quiz-only progress rules and capstone checks", () => {
    expect(existsSync(migrationPath)).toBe(true);
    const migration = readFileSync(migrationPath, "utf8");
    expect(migration).toMatch(/kind = 'knowledge_check'/);
    expect(migration).toMatch(/answer_correct is true/);
    expect(migration).toContain("'capstone_check_1'");
    expect(migration).toContain("'capstone_check_2'");
    expect(migration).toContain("'capstone_check_3'");
    expect(migration).toContain('"completionRule": "legacy-all-items-v1"');
    expect(migration).toContain('"completionRule": "quiz-only-v1"');
    expect(migration).toContain("v_has_quiz_attempt boolean");
    const recalculation = migration.slice(migration.indexOf("do $$"));
    expect(recalculation).not.toMatch(/updated_at\s*=\s*now\(\)/);
  });

  it("repairs a missing capstone manifest before inserting its quiz items", () => {
    const migration = readFileSync(migrationPath, "utf8");
    const manifestInsert = migration.indexOf("insert into public.lesson_progress_manifests");
    const firstQuizItem = migration.indexOf("'capstone_check_1'");

    expect(manifestInsert).toBeGreaterThanOrEqual(0);
    expect(manifestInsert).toBeLessThan(firstQuizItem);
    expect(migration.slice(manifestInsert, firstQuizItem)).toContain("'lesson_systematic_network_troubleshooting_capstone'");
  });
});
