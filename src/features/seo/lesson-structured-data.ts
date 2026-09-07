import { lessonSectionSchema } from "@/features/catalog/catalog.schema";
import type { ContentAccess, LessonSummary, Pathway } from "@/features/catalog/catalog.types";

const accessDescriptions: Record<ContentAccess, string> = {
  public: "Public lesson content; no account required.",
  account: "Requires a free Packetsecrets account.",
  pro: "Requires Packetsecrets Pro access.",
};

export function buildLessonStructuredData(pathway: Pathway, lesson: LessonSummary) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    url: `https://packetsecrets.com/learn/${pathway.slug}/${lesson.slug}`,
    name: lesson.title,
    description: lesson.seo.description,
    provider: { "@type": "Organization", name: "Packetsecrets", url: "https://packetsecrets.com" },
    educationalLevel: pathway.audience,
    audience: { "@type": "EducationalAudience", audienceType: pathway.audience },
    isAccessibleForFree: true,
    hasPart: (lesson.sections ?? []).map((section) => {
      const { label, access } = lessonSectionSchema.parse(section);
      return {
        "@type": "WebPageElement",
        name: label,
        isAccessibleForFree: access === "public",
        description: accessDescriptions[access],
      };
    }),
  };
}

export function serializeJsonLd(data: ReturnType<typeof buildLessonStructuredData>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
