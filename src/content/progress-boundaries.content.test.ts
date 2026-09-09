import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { lessonProgressManifests } from "@/features/progress/progress-manifests";

const contentRoot = path.join(process.cwd(), "src", "content", "networking-foundations");
const sourceFiles = fs.readdirSync(contentRoot)
  .filter((name) => name.endsWith(".public.mdx") || name.endsWith(".account.mdx"))
  .map((name) => ({ name, source: fs.readFileSync(path.join(contentRoot, name), "utf8") }));
const sources = sourceFiles.map(({ source }) => source).join("\n");

describe("published lesson progress boundaries", () => {
  it("provides exactly one explicit Continue action for every required reading section", () => {
    const missing: string[] = [];
    const duplicated: string[] = [];

    for (const manifest of lessonProgressManifests) {
      for (const item of manifest.items.filter(({ kind, required }) => kind === "section" && required)) {
        const marker = `<SectionContinue itemId="${item.itemId}" anchor="${item.anchor}" />`;
        const count = sources.split(marker).length - 1;
        if (count === 0) missing.push(item.itemId);
        if (count > 1) duplicated.push(item.itemId);
      }
    }

    expect({ duplicated, missing }).toEqual({ duplicated: [], missing: [] });
  });

  it("does not attach Continue actions to interactive, knowledge-check, or Pro items", () => {
    for (const manifest of lessonProgressManifests) {
      for (const item of manifest.items.filter(({ kind }) => kind !== "section")) {
        expect(sources).not.toContain(`<SectionContinue itemId="${item.itemId}"`);
      }
    }
    for (const { name, source } of sourceFiles) {
      for (const block of source.matchAll(/<PremiumPreview[\s\S]*?<\/PremiumPreview>/g)) {
        expect(block[0], name).not.toContain("<SectionContinue");
      }
    }
  });
});
