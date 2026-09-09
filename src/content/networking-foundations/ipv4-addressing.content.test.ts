import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/networking-foundations", name), "utf8");

describe("IPv4 addressing lesson content", () => {
  it("keeps foundational explanations and both interactives public", () => {
    const lesson = read("ipv4-addressing.public.mdx");
    for (const phrase of ["32 bits", "four octets", "network portion", "host portion", "private", "loopback", "link-local", "documentation"]) expect(lesson.toLowerCase()).toContain(phrase);
    expect(lesson).toContain("<Ipv4BinaryExplorer progressItemId=");
    expect(lesson).toContain("<Ipv4AddressBoundaryPlayer progressItemId=");
  });

  it("keeps practice, troubleshooting, three checks and Pro preview protected", () => {
    const lesson = read("ipv4-addressing.account.mdx");
    expect(lesson).toContain("IPV4_ACCOUNT_SENTINEL");
    expect(lesson).toContain("Windows ipconfig");
    expect(lesson).toContain("Linux ip address");
    expect(lesson).toContain("<InterviewScenario");
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
  });
});
