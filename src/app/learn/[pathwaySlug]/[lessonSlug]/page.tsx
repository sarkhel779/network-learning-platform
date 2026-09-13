import type { Metadata } from "next";
import { headers } from "next/headers";
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
import { getLessonProgressManifest } from "@/features/progress/progress-manifests";
import { loadMyLearning } from "@/features/progress/my-learning.server";
import type { MyLearningModel } from "@/features/progress/my-learning";
import type { LessonProgressSummary } from "@/features/progress/progress.types";
import { buildLessonStructuredData, serializeJsonLd } from "@/features/seo/lesson-structured-data";
import { getViewer } from "@/lib/supabase/session";

import { isExpectedCatalogError } from "./catalog-error";

type LessonPageProps = {
  params: Promise<{ pathwaySlug: string; lessonSlug: string }>;
  searchParams?: Promise<{ audit?: string }>;
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

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const { pathwaySlug, lessonSlug } = await params;
  const lesson = findPublishedLesson(pathwaySlug, lessonSlug);
  const pathway = getPathway(pathwaySlug);
  const { previous, next } = getAdjacentLessons(pathwaySlug, lessonSlug);
  const viewer = await getViewer();
  const auditRequested = (await searchParams)?.audit === "1";
  const requestHost = auditRequested && process.env.NODE_ENV === "development"
    ? (await headers()).get("host")
    : null;
  const auditMode = requestHost !== null && /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(requestHost);
  const key: LessonContentKey = `${pathway.slug}/${lesson.slug}`;

  let PublicContent: LessonContentModule["default"] | undefined;
  let AccountContent: LessonContentModule["default"] | undefined;
  let ProContent: LessonContentModule["default"] | undefined;
  let initialProgress: LessonProgressSummary | null = null;
  let progressUnavailable = false;
  let myLearning: MyLearningModel | undefined;

  try {
    const content = await loadAuthorizedLessonContent(key, auditMode ? "pro" : viewer ? "account" : "anonymous");
    PublicContent = content.public?.default;
    AccountContent = content.account?.default;
    ProContent = content.pro?.default;
  } catch (error) {
    if (error instanceof Error && error.message === "LESSON_CONTENT_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const progressManifest = viewer
    ? getLessonProgressManifest(pathway.id, lesson.id)
    : undefined;
  if (viewer) {
    const learning = await loadMyLearning(viewer.id, pathway);
    myLearning = learning.model;
    initialProgress = learning.attempts.find(({ lessonId, contentVersion }) => lessonId === lesson.id && contentVersion === progressManifest?.contentVersion) ?? null;
    progressUnavailable = learning.unavailable;
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
        viewer={viewer}
        auditMode={auditMode}
        progressManifest={progressManifest}
        initialProgress={initialProgress}
        progressUnavailable={progressUnavailable}
        myLearning={myLearning}
      >
        {PublicContent ? <PublicContent /> : null}
        {AccountContent ? <AccountContent /> : null}
        {ProContent ? <ProContent /> : null}
      </LessonShell>
    </>
  );
}
