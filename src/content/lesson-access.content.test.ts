import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const contentRoot = join(process.cwd(), "src/content");
const publicFiles = readdirSync(contentRoot, { recursive: true })
  .map(String).filter((file) => file.endsWith(".public.mdx"));

describe("public lesson source boundaries", () => {
  it.each(publicFiles)("excludes account practice and answers from %s", (file) => {
    const source = readFileSync(join(contentRoot, file), "utf8");
    expect(source).not.toMatch(/<(?:KnowledgeCheck|InterviewScenario|WiresharkCheck)\b/);
    expect(source).not.toMatch(/\bcorrectIndex\s*=/);
  });

  it("keeps both Hosts knowledge checks and all five interview answers in the account block", () => {
    const source = readFileSync(join(contentRoot, "networking-foundations/hosts-and-network-devices.account.mdx"), "utf8");
    expect(source.match(/<KnowledgeCheck\b/g)).toHaveLength(2);
    expect(source.match(/<InterviewScenario\b/g)).toHaveLength(5);
    expect(source).toContain("Which local device should receive the first Ethernet frame?");
    expect(source).toContain("A user can reach local devices, but remote destinations fail");
    expect(source).toContain("Several wired hosts lose connectivity");
    expect(source).toContain("A wireless laptop is disconnected from its access point");
  });
});
