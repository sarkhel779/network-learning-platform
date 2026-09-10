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

  it("defines a desktop workspace rail and mobile bottom sheet", () => {
    expect(css).toMatch(/\.learner-workspace\s*\{[^}]*position:\s*fixed/);
    expect(css).toMatch(/\.learner-workspace-mobile-trigger\s*\{[^}]*display:\s*flex/);
    expect(css).toMatch(/@media\s*\(min-width:\s*48rem\)[\s\S]*\.learner-workspace-mobile-trigger\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(/@media\s*\(max-width:\s*47\.999rem\)[\s\S]*\.workspace-overlay--bottom\s+\.workspace-drawer[^\{]*\{[^}]*inset-block-end:\s*0/);
    expect(css).toMatch(/\.workspace-overlay--side\s+\.workspace-drawer[^\{]*\{[^}]*inset-block-end:\s*0/);
    const lessonShell = css.match(/\.lesson-shell\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(lessonShell).not.toMatch(/(?:^|;)\s*width:/);
    expect(lessonShell).not.toMatch(/transform:/);
  });

  it("keeps transport players responsive, touch-friendly, and locally scrollable", () => {
    expect(css).toMatch(/\.transport-player\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/);
    expect(css).toMatch(/\.transport-player fieldset label[^\{]*\{[^}]*min-block-size:\s*44px/);
    expect(css).toMatch(/\.transport-evidence-scroll\s*\{[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto/);
    expect(css).toMatch(/@media\s*\(max-width:\s*35rem\)[\s\S]*\.transport-topology\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.transport-player \*\s*\{[^}]*animation:\s*none\s*!important/);
  });

  it("renders shared player controls with the established outlined appearance", () => {
    const style = document.createElement("style");
    style.textContent = css;
    const controls = document.createElement("div");
    controls.className = "player-controls";
    const button = document.createElement("button");
    button.textContent = "Next";
    controls.append(button);
    document.head.append(style);
    document.body.append(controls);
    document.documentElement.style.setProperty("--accent", "#2563eb");
    document.documentElement.style.setProperty("--background", "transparent");
    try {
      const rendered = getComputedStyle(button);
      expect(rendered.borderStyle).toBe("solid");
      expect(rendered.backgroundColor).toBe("rgba(0, 0, 0, 0)");
      expect(rendered.fontWeight).toBe("700");
    } finally {
      document.documentElement.style.removeProperty("--accent");
      document.documentElement.style.removeProperty("--background");
      controls.remove();
      style.remove();
    }
  });

  it("keeps topology status and playback controls vertically separated", () => {
    const style = document.createElement("style");
    style.textContent = css;
    const status = document.createElement("p");
    status.className = "network-topology__active-text";
    const controls = document.createElement("div");
    controls.className = "player-controls";
    document.head.append(style);
    document.body.append(status, controls);
    try {
      expect(getComputedStyle(status).lineHeight).toBe("1.5rem");
      expect(getComputedStyle(controls).marginTop).toBe("1rem");
    } finally {
      status.remove();
      controls.remove();
      style.remove();
    }
  });
});
