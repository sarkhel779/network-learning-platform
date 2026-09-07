import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getAdjacentLessons,
  getLesson,
  getPathway,
  listPathways,
  listPublishedLessons,
} from "@/features/catalog/catalog.repository";
import type { LessonSummary } from "@/features/catalog/catalog.types";
import { loadAuthorizedLessonContent } from "@/features/lessons/lesson-content.repository";
import type { LessonContentKey, LessonContentModule } from "@/features/lessons/lesson-content.types";
import { LessonShell } from "@/features/lessons/lesson-shell";
import { buildLessonStructuredData, serializeJsonLd } from "@/features/seo/lesson-structured-data";

import { isExpectedCatalogError } from "./catalog-error";

type LessonPageProps = {
  params: Promise<{ pathwaySlug: string; lessonSlug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return listPathways().flatMap(({ slug: pathwaySlug }) =>
    listPublishedLessons(pathwaySlug).map(({ slug: lessonSlug }) => ({
      pathwaySlug,
      lessonSlug,
    })),
  );
}

function findPublishedLesson(pathwaySlug: string, lessonSlug: string): LessonSummary {
  let lesson: LessonSummary;

  try {
    lesson = getLesson(pathwaySlug, lessonSlug);
  } catch (error) {
    if (isExpectedCatalogError(error)) {
      notFound();
    }
    throw error;
  }

  if (!lesson.published) {
    notFound();
  }

  return lesson;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { pathwaySlug, lessonSlug } = await params;
  const lesson = findPublishedLesson(pathwaySlug, lessonSlug);
  const canonical = `/learn/${pathwaySlug}/${lesson.slug}`;

  return {
    title: lesson.seo.title,
    description: lesson.seo.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: lesson.seo.title,
      description: lesson.seo.description,
    },
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { pathwaySlug, lessonSlug } = await params;
  const lesson = findPublishedLesson(pathwaySlug, lessonSlug);
  const pathway = getPathway(pathwaySlug);
  const { previous, next } = getAdjacentLessons(pathwaySlug, lessonSlug);
  const key: LessonContentKey = `${pathway.slug}/${lesson.slug}`;

  let LessonContent: LessonContentModule["default"];

  try {
    const content = await loadAuthorizedLessonContent(key, "anonymous");
    LessonContent = content.public.default;
  } catch (error) {
    if (error instanceof Error && error.message === "LESSON_CONTENT_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildLessonStructuredData(pathway, lesson)) }}
      />
      <LessonShell
        pathway={pathway}
        lesson={lesson}
        previous={previous}
        next={next}
      >
        <LessonContent />
      </LessonShell>
    </>
  );
}
