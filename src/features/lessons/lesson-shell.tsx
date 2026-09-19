import Link from "next/link";
import type { ReactNode } from "react";

import type { LessonSummary, Pathway } from "@/features/catalog/catalog.types";
import { LearnerWorkspace } from "@/features/learner-workspace/learner-workspace";
import type { Viewer } from "@/features/learner-workspace/learner-workspace.types";
import type { LessonProgressManifest, LessonProgressSummary } from "@/features/progress/progress.types";
import { LessonProgressProvider } from "@/features/progress/lesson-progress-context";
import type { MyLearningModel } from "@/features/progress/my-learning";

import { CurriculumNavigation } from "./curriculum-navigation";
import { formatEstimatedTime } from "@/features/catalog/estimated-time";
import { LearningObjective } from "./learning-objective";
import { LessonSectionNavigation } from "./lesson-section-navigation";
import { RegistrationBoundary } from "./registration-boundary";

const essentialServiceGroups = [
  { label: "Web services", node: "Web", ids: ["web-services", "web-service-journey", "web-troubleshooting", "web-capture-analysis", "web-rfc-validation"] },
  { label: "Remote access", node: "Remote", ids: ["remote-access-services", "remote-access-journey", "remote-access-troubleshooting", "remote-access-capture-analysis", "remote-access-rfc-validation"] },
  { label: "Email services", node: "Email", ids: ["email-services", "email-journey", "email-troubleshooting", "email-capture-analysis", "email-rfc-validation"] },
  { label: "File transfer", node: "Files", ids: ["file-transfer-services", "file-transfer-journey", "file-transfer-troubleshooting", "file-transfer-capture-analysis", "file-transfer-rfc-validation"] },
  { label: "Time services", node: "Time", ids: ["time-services", "time-journey", "time-troubleshooting", "time-capture-analysis", "time-rfc-validation"] },
  { label: "Monitoring", node: "Monitor", ids: ["monitoring-services", "monitoring-journey", "monitoring-troubleshooting", "monitoring-capture-analysis", "monitoring-rfc-validation", "knowledge-check-summary"] },
] as const;

type LessonShellProps = {
  pathway: Pathway;
  lesson: LessonSummary;
  previous?: LessonSummary;
  next?: LessonSummary;
  viewer: Viewer | null;
  auditMode?: boolean;
  progressManifest?: LessonProgressManifest;
  initialProgress?: LessonProgressSummary | null;
  progressUnavailable?: boolean;
  myLearning?: MyLearningModel;
  children: ReactNode;
};

type LessonDirectionProps = {
  direction: "Previous" | "Next";
  lesson?: LessonSummary;
  pathwaySlug: string;
};

function LessonDirection({ direction, lesson, pathwaySlug }: LessonDirectionProps) {
  if (!lesson) {
    return <span>{direction}: {direction === "Previous" ? "Start of pathway" : "End of pathway"}</span>;
  }

  const label = `${direction}: ${lesson.title}`;

  if (!lesson.published) {
    return <span>{label} — Coming later</span>;
  }

  return <Link href={`/learn/${pathwaySlug}/${lesson.slug}`}>{label}</Link>;
}

export function LessonShell({
  pathway,
  lesson,
  previous,
  next,
  viewer,
  auditMode = false,
  progressManifest,
  initialProgress,
  progressUnavailable = false,
  myLearning,
  children,
}: LessonShellProps) {
  const lessonContent = viewer && progressManifest
    ? (
      <LessonProgressProvider
        viewerId={viewer.id}
        manifest={progressManifest}
        initialProgress={initialProgress ?? null}
      >
        {children}
      </LessonProgressProvider>
    )
    : children;

  return (
    <main className="lesson-page" id="main-content">
      <LearnerWorkspace
        pathway={pathway}
        currentLessonSlug={lesson.slug}
        viewer={viewer}
        myLearning={myLearning}
        progressUnavailable={progressUnavailable}
      />
      <article
        className="lesson-shell"
        data-progress-attempt={initialProgress?.attemptId}
        data-progress-manifest={progressManifest?.contentVersion}
        data-progress-unavailable={progressUnavailable || undefined}
      >
        <noscript>
          <details className="lesson-curriculum lesson-curriculum--fallback">
            <summary>Course contents</summary>
            <CurriculumNavigation pathway={pathway} currentLessonSlug={lesson.slug} />
          </details>
        </noscript>
        <header className="lesson-header">
          <p className="eyebrow">Lesson</p>
          <h1>{lesson.title}</h1>
          <p className="lesson-byline">
            {formatEstimatedTime(lesson.estimatedMinutes)} · {lesson.sections?.some(({ access }) => access === "public")
              ? "Public introduction · Free account to continue"
              : "Free account required"}
          </p>
        </header>

        {auditMode ? <div className="lesson-audit-notice" role="note">Local audit preview · Free Account and Pro lesson content are visible. Sign-in, progress, and billing are unchanged.</div> : null}

        <LearningObjective>{lesson.objective}</LearningObjective>

        <LessonSectionNavigation
          lockedReturnTo={`/learn/${pathway.slug}/${lesson.slug}`}
          mapGroups={lesson.slug === "http-https-tls-and-essential-network-services" ? essentialServiceGroups : undefined}
          panelId={lesson.slug === "http-https-tls-and-essential-network-services" ? "service-page-contents" : lesson.slug === "nat-pat-and-the-complete-internet-packet-journey" ? "nat-page-contents" : lesson.slug === "systematic-network-troubleshooting-capstone" ? "troubleshooting-page-contents" : lesson.slug === "dns-and-name-resolution" ? "dns-page-contents" : "lesson-page-contents"}
          presentation={lesson.slug === "dns-and-name-resolution" ? "dns-network-map" : lesson.slug === "nat-pat-and-the-complete-internet-packet-journey" ? "nat-network-map" : lesson.slug === "systematic-network-troubleshooting-capstone" ? "troubleshooting-network-map" : "network-map"}
          sections={lesson.sections}
          viewerAccess={auditMode ? "pro" : viewer ? "account" : "anonymous"}
        />

        <div className="lesson-content">{lessonContent}</div>

        {!viewer && !auditMode ? <RegistrationBoundary returnTo={`/learn/${pathway.slug}/${lesson.slug}`} /> : null}

        <nav aria-label="Lesson navigation" className="lesson-navigation">
          <LessonDirection
            direction="Previous"
            lesson={previous}
            pathwaySlug={pathway.slug}
          />
          <LessonDirection direction="Next" lesson={next} pathwaySlug={pathway.slug} />
        </nav>
      </article>
    </main>
  );
}

