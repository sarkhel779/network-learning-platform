import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const lesson = readFileSync(
  join(process.cwd(), "src/content/networking-foundations/hosts-and-network-devices.public.mdx"),
  "utf8",
);

describe("Hosts and Network Devices lesson content", () => {
  it("keeps the approved six-section navigation structure", () => {
    const headingIds = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);

    expect(headingIds).toEqual([
      "what-makes-a-device-a-host",
      "network-interfaces",
      "clients-and-servers",
      "one-host-more-than-one-role",
      "classify-host-roles",
      "knowledge-check",
    ]);
  });

  it("contains the host-role interaction and two beginner checks", () => {
    expect(lesson).toContain("<HostRoleClassifier />");
    expect(lesson.match(/<KnowledgeCheck/g)).toHaveLength(2);
  });

  it("avoids the nested paragraph markup that caused the hydration regression", () => {
    expect(lesson).not.toMatch(/<p(?:\s[^>]*)?>\s*<p(?:\s|>)/);
  });
});
