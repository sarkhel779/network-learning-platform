import type { Pathway } from "@/features/catalog/catalog.types";

import { lessonProgressManifests } from "./progress-manifests";
import { listPathwayProgress } from "./progress.repository";
import type { LessonProgressSummary } from "./progress.types";
import type { MyLearningItem, MyLearningModel } from "./my-learning";

export function buildMyLearningModel(pathway: Pathway, attempts: readonly LessonProgressSummary[]): MyLearningModel {
  const lessons = pathway.modules.flatMap(({ lessons: items }) => items).filter(({ published }) => published);
  const currentAttempts = attempts.filter((attempt) => {
    const manifest = lessonProgressManifests.find(({ lessonId, pathwayId }) => lessonId === attempt.lessonId && pathwayId === pathway.id);
    return manifest?.contentVersion === attempt.contentVersion;
  });
  const attemptsByLesson = new Map(currentAttempts.map((attempt) => [attempt.lessonId, attempt]));

  const items = lessons.flatMap((lesson): MyLearningItem[] => {
    const manifest = lessonProgressManifests.find(({ lessonId, pathwayId }) => lessonId === lesson.id && pathwayId === pathway.id);
    if (!manifest) return [];
    const attempt = attemptsByLesson.get(lesson.id);
    const next = manifest.items.find(({ itemId }) => itemId === attempt?.nextItemId) ?? manifest.items[0];
    const status = attempt?.status ?? "not_started";
    const anchor = status === "in_progress" ? next?.anchor : undefined;
    return [{
      lessonId: lesson.id,
      title: lesson.title,
      href: `/learn/${pathway.slug}/${lesson.slug}${anchor ? `#${anchor}` : ""}`,
      status,
      completionPercent: attempt?.completionPercent ?? 0,
      nextLabel: status === "completed" ? null : (next?.label ?? null),
      incorrectCheckCount: attempt?.incorrectCheckCount ?? 0,
      contentVersion: manifest.contentVersion,
      updatedAt: attempt?.updatedAt,
    }];
  });
  const inProgress = items.filter(({ status }) => status === "in_progress");
  const completed = items.filter(({ status }) => status === "completed");
  const continueLesson = [...inProgress].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))[0] ?? null;

  return {
    pathwayTitle: pathway.title,
    pathwayId: pathway.id,
    completionPercent: items.length ? Math.floor(completed.length * 100 / items.length) : 0,
    continueLesson,
    groups: {
      not_started: items.filter(({ status }) => status === "not_started"),
      in_progress: inProgress,
      completed,
    },
  };
}

export async function loadMyLearning(userId: string, pathway: Pathway) {
  try {
    const attempts = await listPathwayProgress(userId, pathway.id);
    return { attempts, model: buildMyLearningModel(pathway, attempts), unavailable: false as const };
  } catch {
    return { attempts: [] as LessonProgressSummary[], model: buildMyLearningModel(pathway, []), unavailable: true as const };
  }
}
