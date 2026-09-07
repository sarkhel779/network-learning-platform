import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const lesson = readFileSync(
  join(process.cwd(), "src/content/networking-foundations/osi-and-tcp-ip-models.account.mdx"),
  "utf8",
);

describe("OSI and TCP/IP Models lesson content", () => {
  it("keeps the approved nine-section navigation structure", () => {
    const headingIds = [...lesson.matchAll(/<h2 id=\"([^\"]+)\">/g)].map(
      (match) => match[1],
    );

    expect(headingIds).toEqual([
      "why-layers",
      "osi-model",
      "tcp-ip-model",
      "model-mapping",
      "encapsulation-lab",
      "device-layer-scope",
      "wireshark-layers",
      "troubleshooting-interview",
      "knowledge-summary",
    ]);
  });

  it("contains practical packet inspection, checks, and scenario practice", () => {
    const wiresharkCheck = lesson.match(/<WiresharkCheck\b[\s\S]*?\/>/)?.[0];

    expect(wiresharkCheck).toBeDefined();
    expect(lesson.match(/<KnowledgeCheck/g)).toHaveLength(2);
    expect(lesson.match(/<InterviewScenario/g)).toHaveLength(2);

    for (const filter of ["eth", "ip", "tcp", "udp", "dns", "http", "tls"]) {
      expect(wiresharkCheck).toContain(filter);
    }

    for (const field of [
      "eth.src",
      "eth.dst",
      "ip.src",
      "ip.dst",
      "tcp.srcport",
      "tcp.dstport",
    ]) {
      expect(wiresharkCheck).toContain(field);
    }
  });

  it("presents each interview answer as an ordered sequence of points", () => {
    const scenarios = [...lesson.matchAll(/<InterviewScenario\b[\s\S]*?<\/InterviewScenario>/g)].map(
      (match) => match[0],
    );

    expect(scenarios).toHaveLength(2);
    for (const scenario of scenarios) {
      expect(scenario).toMatch(/<ol>[\s\S]*?<\/ol>/);
      expect(scenario.match(/<li>/g)?.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("contrasts UDP datagrams with TCP segments in the encapsulation sequence", () => {
    expect(lesson).toContain("When UDP is used instead, its transport unit is a datagram rather than a TCP segment");
  });

  it("embeds the interactive experience without retaining the temporary placeholder", () => {
    expect(lesson.match(/<EncapsulationExperience\s*\/>/g)).toHaveLength(1);
    expect(lesson.match(/<DeviceLayerScope\s*\/>/g)).toHaveLength(1);
    expect(lesson).not.toContain("will be added in a later update");
  });

  it("avoids nested paragraph markup", () => {
    expect(lesson).not.toMatch(/<p(?:\s[^>]*)?>\s*<p(?:\s|>)/);
  });
});
