export type ProgressItemKind = "section" | "interactive" | "knowledge_check";

export type ProgressEventType =
  | "section_completed"
  | "interactive_completed"
  | "knowledge_check_attempted"
  | "position_updated"
  | "lesson_completed"
  | "lesson_restarted";

export type ProgressManifestItem = Readonly<{
  itemId: string;
  kind: ProgressItemKind;
  label: string;
  anchor: string;
  required: true;
}>;

export type LessonProgressManifest = Readonly<{
  pathwayId: string;
  lessonId: string;
  contentVersion: number;
  items: readonly ProgressManifestItem[];
}>;

export type LessonProgressStatus = "not_started" | "in_progress" | "completed";

export type LessonProgressSummary = Readonly<{
  attemptId: string;
  pathwayId: string;
  lessonId: string;
  contentVersion: number;
  attemptNumber: number;
  status: LessonProgressStatus;
  completedItemIds: readonly string[];
  nextItemId: string | null;
  lastItemId: string | null;
  lastAnchor: string | null;
  completionPercent: number;
  incorrectCheckCount: number;
  updatedAt: string;
}>;
