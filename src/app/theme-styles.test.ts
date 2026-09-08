import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("system theme and table styles", () => {
  it("keeps connection panels and technical requirements inside their mobile containers", () => {
    const style = document.createElement("style");
    style.textContent = css;
    const comparison = document.createElement("div");
    comparison.className = "connection-media-comparison__panels";
    const card = document.createElement("article");
    card.className = "connection-media-card";
    const requirements = document.createElement("dl");
    requirements.className = "connection-requirements";
    comparison.append(card, requirements);
    document.head.append(style);
    document.body.append(comparison);
    try {
      expect(getComputedStyle(comparison).display).toBe("grid");
      expect(getComputedStyle(comparison).gridTemplateColumns).toBe("minmax(0, 1fr)");
      expect(getComputedStyle(card).minWidth).toBe("0");
      expect(getComputedStyle(card).overflowWrap).toBe("anywhere");
      expect(getComputedStyle(requirements).gridTemplateColumns).toBe("minmax(0, 1fr)");
    } finally {
      comparison.remove();
      style.remove();
    }
  });
  it("sets native control colors to dark inside the system dark preference rule", () => {
    const media = css.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([^}]+)\}/);
    expect(media?.[1]).toMatch(/color-scheme:\s*dark\s*;/);
  });

  it("keeps wide lesson tables inside a horizontally scrollable region", () => {
    const region = css.match(/\.lesson-table\s*\{([^}]+)\}/)?.[1];
    expect(region).toMatch(/overflow-x:\s*auto\s*;/);
    expect(region).toMatch(/max-width:\s*100%\s*;/);
  });

  it("uses pure black text in the animated packet marker", () => {
    const markerText = css.match(/\.network-topology__packet-marker text\s*\{([^}]+)\}/)?.[1];
    expect(markerText).toMatch(/fill:\s*#000\s*;/);
    expect(markerText).toMatch(/stroke:\s*none\s*;/);
  });
});
