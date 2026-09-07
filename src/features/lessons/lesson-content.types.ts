import type { ComponentType } from "react";

export type LessonContentKey = `${string}/${string}`;

export type LessonContentModule = Readonly<{
  default: ComponentType;
}>;

export type LessonContentImport = () => Promise<LessonContentModule>;

export type ViewerAccess = "anonymous" | "account" | "pro";

export type LessonBlockLoaders = Readonly<{
  public: LessonContentImport;
  account?: LessonContentImport;
  pro?: LessonContentImport;
}>;

export type AuthorizedLessonContent = Readonly<{
  public: LessonContentModule;
  account: LessonContentModule | undefined;
  pro: LessonContentModule | undefined;
}>;

export interface LessonContentRegistry {
  readonly [key: LessonContentKey]: LessonBlockLoaders | undefined;
}
