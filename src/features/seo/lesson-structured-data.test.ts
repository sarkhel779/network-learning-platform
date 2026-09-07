import { describe, expect, it } from "vitest";

import { getLesson, getPathway } from "@/features/catalog/catalog.repository";

import { buildLessonStructuredData, serializeJsonLd } from "./lesson-structured-data";

const pathway = getPathway("networking-foundations");
const lesson = getLesson(pathway.slug, "how-networks-communicate");

describe("lesson structured data", () => {
  it("describes the canonical public learning resource using catalog audience and SEO", () => {
    const data = buildLessonStructuredData(pathway, lesson);
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "LearningResource",
      url: "https://packetsecrets.com/learn/networking-foundations/how-networks-communicate",
      name: "What Is a Computer Network?",
      description: "Learn the decisions that move data between hosts and trace a packet across a network.",
      provider: { "@type": "Organization", name: "Packetsecrets", url: "https://packetsecrets.com" },
      educationalLevel: pathway.audience,
      audience: { "@type": "EducationalAudience", audienceType: pathway.audience },
      isAccessibleForFree: true,
    });
    expect(data.hasPart.map((part) => part.isAccessibleForFree)).toEqual([true, true, false, false, false, false]);
  });

  it("allow-lists gated labels and access descriptions, excluding extra body data", () => {
    const untrustedExtraFields = {
      ...lesson,
      body: "ACCOUNT_ONLY_SENTINEL",
      sections: lesson.sections?.map((section) => ({
        ...section, body: "ACCOUNT_ONLY_SENTINEL", answers: ["PRO_ONLY_SENTINEL"],
        commands: "show protected-command", scenario: { protected: true },
      })),
    };
    const data = buildLessonStructuredData(pathway, untrustedExtraFields);
    expect(data.hasPart.slice(2)).toEqual([
      { "@type": "WebPageElement", name: "Basic Wireshark check", isAccessibleForFree: false, description: "Requires a free Packetsecrets account." },
      { "@type": "WebPageElement", name: "Knowledge check", isAccessibleForFree: false, description: "Requires a free Packetsecrets account." },
      { "@type": "WebPageElement", name: "Interview scenario", isAccessibleForFree: false, description: "Requires a free Packetsecrets account." },
      { "@type": "WebPageElement", name: "Pro Deep Dive", isAccessibleForFree: false, description: "Requires Packetsecrets Pro access." },
    ]);
    const serialized = JSON.stringify(data);
    expect(serialized).not.toMatch(/ACCOUNT_ONLY_SENTINEL|PRO_ONLY_SENTINEL|protected-command/);
    expect(serialized).not.toContain('"protected":true');
    function assertSafeKeys(value: unknown): void {
      if (value === null || typeof value !== "object") return;
      for (const [key, child] of Object.entries(value)) {
        expect(["body", "answers", "commands", "scenario", "offers", "price"]).not.toContain(key);
        assertSafeKeys(child);
      }
    }
    assertSafeKeys(data);
  });

  it("escapes script-like catalog text while preserving JSON round trips", () => {
    const malicious = "</script><script>alert('catalog')</script>";
    const data = buildLessonStructuredData(pathway, { ...lesson, title: malicious });
    const serialized = serializeJsonLd(data);
    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c/script>");
    expect(JSON.parse(serialized).name).toBe(malicious);
  });
});
