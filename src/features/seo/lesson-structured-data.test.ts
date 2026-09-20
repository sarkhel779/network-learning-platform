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
      name: "Introduction to Computer Networks and Network Devices",
      description: "Learn what computer networks are, why they exist, and the broad roles of common network devices.",
      provider: { "@type": "Organization", name: "Packetsecrets", url: "https://packetsecrets.com" },
      educationalLevel: pathway.audience,
      audience: { "@type": "EducationalAudience", audienceType: pathway.audience },
      isAccessibleForFree: true,
    });
    expect(data.hasPart.map((part) => part.isAccessibleForFree)).toEqual([true, true, true, true, true, true]);
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
      { "@type": "WebPageElement", name: "LANs, WANs and the Internet", isAccessibleForFree: true, description: "Public lesson content; no account required." },
      { "@type": "WebPageElement", name: "End and intermediary devices", isAccessibleForFree: true, description: "Public lesson content; no account required." },
      { "@type": "WebPageElement", name: "Identify device roles", isAccessibleForFree: true, description: "Public lesson content; no account required." },
      { "@type": "WebPageElement", name: "Knowledge check", isAccessibleForFree: true, description: "Public lesson content; no account required." },
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
