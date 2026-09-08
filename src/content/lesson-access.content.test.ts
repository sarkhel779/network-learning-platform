import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const contentRoot = join(process.cwd(), "src/content");
const publicFiles = readdirSync(contentRoot, { recursive: true })
  .map((file) => String(file).replaceAll("\\", "/")).filter((file) => file.endsWith(".public.mdx"));

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

describe("public lesson source boundaries", () => {
  it("keeps every OSI foundation and interactive experience in the account block", () => {
    expect(publicFiles).not.toContain("networking-foundations/osi-and-tcp-ip-models.public.mdx");
    const source = readFileSync(join(contentRoot, "networking-foundations/osi-and-tcp-ip-models.account.mdx"), "utf8");
    expect(source).toContain("Layered models help teams describe one browser-to-server exchange");
    for (const id of ["why-layers", "osi-model", "tcp-ip-model", "model-mapping", "encapsulation-lab"]) {
      expect(source).toContain(`id="${id}"`);
    }
    expect(source).toContain("<LayerModelComparison />");
    expect(source).toContain("<EncapsulationExperience />");
  });

  it.each(publicFiles)("excludes account practice and answers from %s", (file) => {
    const source = readFileSync(join(contentRoot, file), "utf8");
    expect(source).not.toMatch(/<(?:KnowledgeCheck|InterviewScenario|WiresharkCheck)\b/);
    expect(source).not.toMatch(/\bcorrectIndex\s*=/);
  });

  it("keeps connection-media scenarios, answers, and advanced preview copy out of the public module", () => {
    const publicSource = readFileSync(
      join(contentRoot, "networking-foundations/cables-fibre-wireless-and-network-connections.public.mdx"),
      "utf8",
    );
    const accountSource = readFileSync(
      join(contentRoot, "networking-foundations/cables-fibre-wireless-and-network-connections.account.mdx"),
      "utf8",
    );
    const publicHeadingIds = [...publicSource.matchAll(/<h2 id="([^"]+)">/g)].map(
      (match) => match[1],
    );
    const accountHeadingIds = [...accountSource.matchAll(/<h2 id="([^"]+)"[^>]*>/g)].map(
      (match) => match[1],
    );
    const protectedStrings = [
      "CONNECTION_MEDIA_ACCOUNT_SENTINEL",
      "The recommended connection for a nearby desktop is copper Ethernet.",
      "Optical power-budget planning compares transmitter output, loss, and receiver sensitivity.",
      "Campus buildings need a connection chosen for distance and environmental exposure.",
    ];
    const normalizedPublicSource = normalizeWhitespace(publicSource);
    const normalizedAccountSource = normalizeWhitespace(accountSource);

    expect(publicHeadingIds).toEqual([
      "how-connections-carry-data",
      "connection-qualities",
      "copper-ethernet",
      "fibre-connections",
      "wireless-connections",
      "compare-media",
    ]);
    expect(accountHeadingIds).toEqual([
      "design-a-connection",
      "diagnose-link-symptoms",
      "knowledge-check-summary",
      "pro-deep-dive",
    ]);
    for (const value of protectedStrings) {
      const normalizedValue = normalizeWhitespace(value);
      expect(normalizedAccountSource).toContain(normalizedValue);
      expect(normalizedPublicSource).not.toContain(normalizedValue);
    }
    expect(publicSource).not.toContain("Join the Pro Member Waitlist");
  });

  it("keeps switching scenarios, answers, and Pro details out of the public module", () => {
    const publicSource = readFileSync(
      join(contentRoot, "networking-foundations/hubs-bridges-and-switches.public.mdx"),
      "utf8",
    );
    const accountSource = readFileSync(
      join(contentRoot, "networking-foundations/hubs-bridges-and-switches.account.mdx"),
      "utf8",
    );
    const publicHeadingIds = [...publicSource.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    const accountHeadingIds = [...accountSource.matchAll(/<h2 id="([^"]+)"[^>]*>/g)].map((match) => match[1]);
    const protectedStrings = [
      "same-segment-filtering",
      "Host moved from port 2 to port 4",
      "VLAN-aware forwarding",
    ];

    expect(publicHeadingIds).toEqual([
      "one-local-ethernet-conversation",
      "what-a-hub-does",
      "why-bridges-changed-ethernet",
      "how-a-switch-learns",
      "how-a-switch-forwards",
      "compare-hub-bridge-switch",
    ]);
    expect(accountHeadingIds).toEqual([
      "forward-the-frame",
      "diagnose-local-switching-symptoms",
      "knowledge-check-summary",
      "pro-deep-dive",
    ]);
    for (const value of protectedStrings) {
      expect(normalizeWhitespace(accountSource)).toContain(normalizeWhitespace(value));
      expect(normalizeWhitespace(publicSource)).not.toContain(normalizeWhitespace(value));
    }
    expect(publicSource).not.toContain("Join the Pro Member Waitlist");

    const clientLabSource = readFileSync(
      join(contentRoot, "../features/switching/frame-forwarding-lab.tsx"),
      "utf8",
    );
    expect(clientLabSource).not.toContain("same-segment-filtering");
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
