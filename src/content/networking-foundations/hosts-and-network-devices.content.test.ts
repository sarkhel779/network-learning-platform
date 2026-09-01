import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const lessonPath = join(
  process.cwd(),
  "src/content/networking-foundations/hosts-and-network-devices.mdx",
);
const lesson = readFileSync(lessonPath, "utf8");

describe("Hosts and Network Devices lesson content", () => {
  it("keeps the approved eight-section navigation structure", () => {
    const headingIds = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);

    expect(headingIds).toEqual([
      "what-is-a-host",
      "connecting-devices",
      "explore-topology",
      "compare-journeys",
      "windows-checks",
      "wireshark-checks",
      "test-understanding",
      "summary",
    ]);
  });

  it("contains the interactive lab, practical checks, and scenario practice", () => {
    expect(lesson).toContain("<HostsAndDevicesExperience />");
    expect(lesson.match(/<KnowledgeCheck/g)).toHaveLength(2);
    expect(lesson.match(/<InterviewScenario/g)?.length).toBeGreaterThanOrEqual(5);

    for (const command of ["ipconfig /all", "arp -a", "route print"]) {
      expect(lesson).toContain(command);
    }

    for (const filter of [
      "arp",
      "icmp",
      "ip.addr == 203.0.113.50",
      "eth.addr == 02:00:00:00:10:01",
      "tcp",
    ]) {
      expect(lesson).toContain(filter);
    }
  });

  it("avoids the nested paragraph markup that caused the hydration regression", () => {
    expect(lesson).not.toMatch(/<p(?:\s[^>]*)?>\s*<p(?:\s|>)/);
  });
});
