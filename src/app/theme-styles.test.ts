import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("system theme and table styles", () => {
  it("sets native control colors to dark inside the system dark preference rule", () => {
    const media = css.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([^}]+)\}/);
    expect(media?.[1]).toMatch(/color-scheme:\s*dark\s*;/);
  });

  it("keeps wide lesson tables inside a horizontally scrollable region", () => {
    const region = css.match(/\.lesson-table\s*\{([^}]+)\}/)?.[1];
    expect(region).toMatch(/overflow-x:\s*auto\s*;/);
    expect(region).toMatch(/max-width:\s*100%\s*;/);
  });
});
