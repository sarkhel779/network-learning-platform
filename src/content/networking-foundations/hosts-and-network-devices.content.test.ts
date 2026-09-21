import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const lesson = readFileSync(
  join(process.cwd(), "src/content/networking-foundations/hosts-and-network-devices.public.mdx"),
  "utf8",
);

describe("Hosts and Network Devices lesson content", () => {
  it("keeps the approved seven-section navigation structure", () => {
    const headingIds = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);

    expect(headingIds).toEqual([
      "what-makes-a-device-a-host",
      "network-interfaces",
      "clients-and-servers",
      "follow-host-conversations",
      "one-host-more-than-one-role",
      "classify-host-roles",
      "knowledge-check",
    ]);
  });

  it("contains the host-role interaction and two beginner checks", () => {
    expect(lesson).toContain("<HostRoleConversationPlayer />");
    expect(lesson).toContain("<HostRoleClassifier />");
    expect(lesson.match(/<KnowledgeCheck/g)).toHaveLength(2);
  });

  it("keeps advanced operations and troubleshooting out of the beginner lesson", () => {
    expect(lesson).not.toMatch(/ipconfig|Wireshark|ARP cache|route print|\bNAT\b|firewall policy|subnet decision|transport port/i);
  });

  it("avoids the nested paragraph markup that caused the hydration regression", () => {
    expect(lesson).not.toMatch(/<p(?:\s[^>]*)?>\s*<p(?:\s|>)/);
  });
});
