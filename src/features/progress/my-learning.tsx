"use client";

import Link from "next/link";

import type { LessonProgressStatus } from "./progress.types";

export type MyLearningItem = Readonly<{
  lessonId: string;
  title: string;
  href: string;
  status: LessonProgressStatus;
  completionPercent: number;
  nextLabel: string | null;
  incorrectCheckCount: number;
  contentVersion: number;
  updatedAt?: string;
}>;

export type MyLearningModel = Readonly<{
  pathwayTitle: string;
  pathwayId: string;
  completionPercent: number;
  continueLesson: MyLearningItem | null;
  groups: Readonly<Record<LessonProgressStatus, readonly MyLearningItem[]>>;
}>;

function LessonList({ title, items }: { title: string; items: readonly MyLearningItem[] }) {
  return <section className="my-learning__group"><h3>{title}</h3>{items.length ? <ul>{items.map((item) => <li key={item.lessonId}>
    <Link href={item.href}>{item.title}</Link>
    <span>{item.completionPercent}%</span>
    {item.nextLabel ? <small>Next: {item.nextLabel}</small> : null}
    {item.incorrectCheckCount ? <small>{item.incorrectCheckCount} {item.incorrectCheckCount === 1 ? "answer" : "answers"} to review</small> : null}
  </li>)}</ul> : <p>None</p>}</section>;
}

export function MyLearning({ model, unavailable = false }: { model: MyLearningModel; unavailable?: boolean }) {
  const total = model.groups.not_started.length + model.groups.in_progress.length + model.groups.completed.length;
  return <div className="my-learning">
    <header><h2>{model.pathwayTitle}</h2><p>{model.completionPercent}% complete</p><progress aria-label="Pathway completion" max={100} value={model.completionPercent} /></header>
    {unavailable ? <p role="status">Your latest progress could not be loaded. Your lesson remains available; try My learning again later.</p> : !total ? <p>No published lessons are available yet.</p> : <>
      {model.continueLesson ? <Link className="my-learning__continue" href={model.continueLesson.href}>Continue learning: {model.continueLesson.title}</Link> : null}
      <LessonList title="In progress" items={model.groups.in_progress} />
      <LessonList title="Not started" items={model.groups.not_started} />
      <LessonList title="Completed" items={model.groups.completed} />
    </>}
  </div>;
}
