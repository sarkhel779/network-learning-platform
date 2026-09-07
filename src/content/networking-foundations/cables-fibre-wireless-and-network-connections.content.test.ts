import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { accountConnectionScenarios } from "@/features/connection-media/connection-media.account.data";

const slug = "cables-fibre-wireless-and-network-connections";
const source = (access: string) => readFileSync(join(process.cwd(), "src/content/networking-foundations", `${slug}.${access}.mdx`), "utf8");
const publicSource = source("public");
const accountSource = source("account");
const headings = (value: string) => [...value.matchAll(/<h2\s+id="([^"]+)"[^>]*>/g)].map((match) => match[1]);

describe("connection media lesson content contract", () => {
  it("preserves the ordered public and authorized navigation destinations", () => {
    expect(headings(publicSource)).toEqual(["how-connections-carry-data", "connection-qualities", "copper-ethernet", "fibre-connections", "wireless-connections", "compare-media"]);
    expect(headings(accountSource)).toEqual(["design-a-connection", "diagnose-link-symptoms", "knowledge-check-summary", "pro-deep-dive"]);
    expect(accountSource).toMatch(/<h2 id="design-a-connection" tabIndex=\{-1\}/);
  });

  it("keeps the comparison public and directly imports the lab only in account content", () => {
    expect(publicSource.match(/<ConnectionMediaComparison\s*\/>/g)).toHaveLength(1);
    expect(publicSource).not.toMatch(/ConnectionMediaExperience|connection-media\.account|accountConnection|<KnowledgeCheck|<InterviewScenario|correctIndex|optical power-budget|Join the Pro Member Waitlist/i);
    expect(accountSource).toContain('import { ConnectionMediaExperience } from "@/features/connection-media/connection-media-experience";');
    expect(accountSource.match(/<ConnectionMediaExperience\s+scenarios=\{loadAccountConnectionScenarios\(\)\}\s*\/>/g)).toHaveLength(1);
    const registry = readFileSync(join(process.cwd(), "mdx-components.tsx"), "utf8");
    expect(registry).not.toMatch(/ConnectionMediaExperience|connection-media\.account/);
    const normalizedPublic = publicSource.replace(/\s+/g, " ");
    for (const scenario of accountConnectionScenarios) {
      expect(normalizedPublic).not.toContain(scenario.title);
      for (const evaluation of Object.values(scenario.evaluations)) {
        expect(normalizedPublic).not.toContain(evaluation.explanation.replace(/\s+/g, " "));
      }
    }
  });

  it("keeps exactly three assessments and the waitlist action in account content", () => {
    expect(accountSource.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(accountSource).toContain('<PremiumPreview ctaLabel="Join the Pro Member Waitlist" ctaHref="/contact">');
    expect(accountSource).not.toMatch(/\/pricing|checkout|buy now|unlock now/i);
    for (const match of accountSource.matchAll(/explanation="([^"]+)"/g)) {
      expect(publicSource.replace(/\s+/g, " ")).not.toContain(match[1]);
    }
  });
});
