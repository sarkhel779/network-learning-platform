import { describe, expect, it } from "vitest";

import { buildMyLearningModel } from "./my-learning.server";
import type { LessonProgressSummary } from "./progress.types";
import { getPathway } from "@/features/catalog/catalog.repository";

const pathway = getPathway("networking-foundations");

describe("buildMyLearningModel", () => {
  it("selects the most recently updated in-progress lesson and ignores stale versions", () => {
    const manifested = pathway.modules.flatMap(({ lessons }) => lessons).filter(({ published }) => published);
    const current = (lessonId: string, updatedAt: string): LessonProgressSummary => ({ attemptId: lessonId, pathwayId: pathway.id, lessonId, contentVersion: 1, attemptNumber: 1, status: "in_progress", completedItemIds: [], nextItemId: null, lastItemId: null, lastAnchor: null, completionPercent: 25, incorrectCheckCount: 0, updatedAt });
    const progress = [current(manifested[0].id, "2026-09-08T00:00:00Z"), current(manifested[1].id, "2026-09-09T00:00:00Z"), { ...current(manifested[2].id, "2026-09-10T00:00:00Z"), contentVersion: 0 }];
    const model = buildMyLearningModel(pathway, progress);
    expect(model.continueLesson?.lessonId).toBe(manifested[1].id);
    expect(model.groups.not_started.some(({ lessonId }) => lessonId === manifested[2].id)).toBe(true);
  });
});
