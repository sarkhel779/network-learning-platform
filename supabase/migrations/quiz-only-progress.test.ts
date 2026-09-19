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
  });
});
