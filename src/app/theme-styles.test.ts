import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("system theme and table styles", () => {
  it("uses the approved navy and teal as the default site palette", () => {
    const root = css.match(/:root\s*\{([^}]+)\}/)?.[1] ?? "";
    expect(root).toMatch(/--background:\s*#0b111c\s*;/);
    expect(root).toMatch(/--foreground:\s*#f5f8fc\s*;/);
    expect(root).toMatch(/--accent:\s*#23d6a8\s*;/);
    expect(css).toMatch(/\.site-logo__packet\s*\{[^}]*color:\s*#fff/);
    expect(css).toMatch(/\.site-logo__secrets\s*\{[^}]*color:\s*#23d6a8/);
  });
  it("keeps inactive header navigation readable in light theme", () => {
    const style = document.createElement("style");
    style.textContent = css;
    const header = document.createElement("header");
    header.className = "site-header";
    const nav = document.createElement("nav");
    nav.className = "site-nav";
    const link = document.createElement("a");
    link.href = "/";
    link.textContent = "Home";
    nav.append(link);
    header.append(nav);
    document.head.append(style);
    document.body.append(header);
    document.documentElement.dataset.theme = "light";
    try {
      expect(getComputedStyle(nav).color).toBe("rgb(20, 43, 58)");
    } finally {
      delete document.documentElement.dataset.theme;
      header.remove();
      style.remove();
    }
  });
  it("keeps the landing glow static and unable to intercept clicks", () => {
    expect(css).toMatch(/\.home-refresh::before\s*\{[^}]*radial-gradient\([^}]*pointer-events:\s*none/);
    expect(css).not.toMatch(/@keyframes\s+home-ambient-shift/);
  });
  it("keeps the sign-in brand heading within its card", () => {
    expect(css).toMatch(/\.sign-in-card h1\s*\{[^}]*max-width:\s*none/);
  });
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

  it("draws a visible envelope inside the animated packet marker", () => {
    const envelope = css.match(/\.network-topology__packet-marker path\s*\{([^}]+)\}/)?.[1];
    expect(envelope).toMatch(/fill:\s*none\s*;/);
    expect(envelope).toMatch(/stroke:\s*var\(--background\)\s*;/);
  });

  it("uses a teal glow instead of a rectangular outline for focused topology devices", () => {
    expect(css).toMatch(/\.device-role-tour \.network-topology__device\[role="button"\]:focus\s*\{[^}]*outline:\s*none/);
    expect(css).toMatch(/\.device-role-tour \.network-topology__device\[role="button"\]:focus-visible\s*\{[^}]*outline:\s*none[^}]*filter:\s*drop-shadow/);
  });

  it("keeps the device thought cloud above the topology on narrow screens", () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*44rem\)[\s\S]*\.device-role-tour \.packet-flow-topology-stage\s*\{[^}]*padding-block-start:\s*(?!0)/);
    expect(css).toMatch(/@media\s*\(max-width:\s*44rem\)[\s\S]*\.device-role-tour__cloud\s*\{[^}]*position:\s*absolute/);
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

  it("keeps DHCP players, diagrams, and packet tables inside the lesson width", () => {
    expect(css).toMatch(/\.dhcp-player\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere/);
    expect(css).toMatch(/\.dhcp-topology\s*\{[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto/);
    expect(css).toMatch(/\.dhcp-topology svg\s*\{[^}]*min-width:\s*42rem[^}]*height:\s*auto/);
    expect(css).toMatch(/\.dhcp-packet-inspector\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/);
    expect(css).toMatch(/\.dhcp-inspector-region \.table-scroll\s*\{[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto/);
    expect(css).toMatch(/@media\s*\(max-width:\s*35rem\)[\s\S]*\.dhcp-player fieldset label\s*\{[^}]*width:\s*100%/);
    expect(css).toMatch(/\.dhcp-rfc-check\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/);
    expect(css).toMatch(/\.dhcp-rfc-check > button\s*\{[^}]*min-block-size:\s*44px/);
    expect(css).not.toMatch(/\.dhcp-player\s*\{[^}]*width:\s*\d{4}px/);
  });

  it("keeps DNS players, topology, controls, and evidence responsive", () => {
    expect(css).toMatch(/\.dns-player\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere/);
    expect(css).toMatch(/\.dns-role-list\s*\{[^}]*grid-template-columns:/);
    expect(css).toMatch(/\.dns-player \.transport-player-controls\s*\{[^}]*display:\s*flex[^}]*flex-wrap:\s*wrap[^}]*gap:/);
    expect(css).toMatch(/\.dns-message-inspector\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/);
    expect(css).toMatch(/\.dns-message-inspector \.packet-table-scroll\s*\{[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto/);
    expect(css).toMatch(/\.dns-troubleshooting-player button[^\{]*\{[^}]*min-block-size:\s*44px/);
    expect(css).toMatch(/@media\s*\(max-width:\s*35rem\)[\s\S]*\.dns-role-list\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.dns-player \*\s*\{[^}]*animation:\s*none\s*!important/);
  });

  it("keeps essential-service players and evidence inside mobile lesson width", () => {
    expect(css).toMatch(/\.service-player[^\{]*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/);
    expect(css).toMatch(/\.service-topology\s*\{[^}]*grid-template-columns:/);
    expect(css).toMatch(/\.service-table-scroll\s*\{[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto/);
    expect(css).toMatch(/\.service-troubleshooting-lab[^\{]*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/);
    expect(css).toMatch(/@media\s*\(max-width:\s*35rem\)[\s\S]*\.service-topology\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.service-player \*\s*\{[^}]*animation:\s*none\s*!important/);
  });

  it("keeps NAT packet, tuple, table, and controls responsive with reduced motion", () => {
    expect(css).toMatch(/\.nat-journey-player[^\{]*\{[^}]*min-width:\s*0/);
    expect(css).toMatch(/\.nat-evidence-grid\s*\{[^}]*grid-template-columns:/);
    expect(css).toMatch(/\.nat-table-scroll\s*\{[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto/);
    expect(css).toMatch(/@media\s*\(max-width:\s*45rem\)[\s\S]*\.nat-evidence-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.nat-journey-player \*\s*\{[^}]*animation:\s*none\s*!important/);
  });

  it("keeps troubleshooting topology and evidence usable on narrow screens", () => {
    expect(css).toMatch(/\.troubleshooting-topology[^{]*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/);
    expect(css).toMatch(/\.troubleshooting-topology__map\s*\{[^}]*overflow-x:\s*auto/);
    expect(css).toMatch(/\.evidence-board__scroll\s*\{[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto/);
    expect(css).toMatch(/@media\s*\(max-width:\s*45rem\)[\s\S]*\.troubleshooting-topology__map\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.troubleshooting-topology \*\s*\{[^}]*animation:\s*none\s*!important/);
  });

  it("keeps the waitlist responsive and its controls touch friendly", () => {
    expect(css).toMatch(/\.waitlist-card\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/);
    expect(css).toMatch(/\.waitlist-consent\s*\{[^}]*min-block-size:\s*44px/);
    expect(css).toMatch(/\.waitlist-primary-action[^{]*\{[^}]*min-block-size:\s*44px/);
    expect(css).toMatch(/@media\s*\(max-width:\s*35rem\)[\s\S]*\.waitlist-card__heading\s*\{[^}]*align-items:\s*flex-start/);
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

  it("keeps the host conversation player responsive and theme-safe", () => {
    expect(css).toMatch(/\.host-role-conversation\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%[^}]*overflow:\s*hidden/);
    expect(css).toMatch(/\.host-role-conversation__choices\s*\{[^}]*display:\s*flex[^}]*flex-wrap:\s*wrap/);
    expect(css).toMatch(/\.host-role-conversation__role-label\s*\{[^}]*color:\s*var\(--muted\)/);
    expect(css).toMatch(/\.host-role-conversation__role-label\[data-active-role\]\s*\{[^}]*color:\s*var\(--accent\)/);
    const cloud = css.match(/\.host-role-conversation__cloud\s*\{([^}]+)\}/)?.[1] ?? "";
    expect(cloud).toMatch(/inset-inline-start:\s*clamp\([^;]*var\(--host-role-anchor\)/);
    expect(cloud).toMatch(/inline-size:\s*min\(/);
    expect(css).toMatch(/\.host-role-conversation__cloud-shape (?:path|path,)[^\{]*\{[^}]*fill:\s*color-mix\([^}]*var\(--accent\)[^}]*stroke:\s*var\(--accent\)/);
    expect(css).toMatch(/@media\s*\(max-width:\s*44rem\)[\s\S]*\.host-role-conversation\s+\.packet-flow-topology-stage\s*\{[^}]*padding-block-start:\s*(?!0)/);
    expect(css).toMatch(/@media\s*\(max-width:\s*44rem\)[\s\S]*\.host-role-conversation__choices > \*\s*\{[^}]*flex:/);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.host-role-conversation__cloud\s*\{[^}]*animation:\s*none/);
  });
});
