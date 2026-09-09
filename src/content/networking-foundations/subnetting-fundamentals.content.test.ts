import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/networking-foundations", name), "utf8");

describe("Subnetting Fundamentals content", () => {
  it("keeps the complete core method and two players public", () => {
    const lesson = read("subnetting-fundamentals.public.mdx");
    for (const phrase of ["block size", "network address", "broadcast address", "usable", "/31", "/32", "default gateway"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
    expect(lesson).toContain("<SubnetBoundaryPlayer");
    expect(lesson).toContain("<SubnetScenarioPlayer");
  });

  it("keeps evidence, troubleshooting, three checks and Pro preview protected", () => {
    const lesson = read("subnetting-fundamentals.account.mdx");
    expect(lesson).toContain("SUBNETTING_ACCOUNT_SENTINEL");
    expect(lesson).toContain("Windows");
    expect(lesson).toContain("Linux");
    expect(lesson).toContain("overlap");
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("VLSM");
    expect(lesson).toContain("summarization");
    expect(lesson).toContain("<PremiumPreview");
  });
});
