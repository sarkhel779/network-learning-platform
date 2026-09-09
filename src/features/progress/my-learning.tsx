"use client";

import Link from "next/link";
import { useState } from "react";

import type { LessonProgressStatus } from "./progress.types";
import { restartProgress } from "./progress-client";

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

function LessonList({ title, items, pathwayId }: { title: string; items: readonly MyLearningItem[]; pathwayId: string }) {
  const [confirming, setConfirming] = useState<string>();
  const [saving, setSaving] = useState<string>();
  const [error, setError] = useState<string>();
  const restart = async (item: MyLearningItem) => {
    setSaving(item.lessonId); setError(undefined);
    try {
      await restartProgress({ pathwayId, lessonId: item.lessonId, contentVersion: item.contentVersion, idempotencyKey: crypto.randomUUID() });
      window.location.reload();
    } catch { setSaving(undefined); setError(item.lessonId); }
  };
  return <section className="my-learning__group"><h3>{title}</h3>{items.length ? <ul>{items.map((item) => <li key={item.lessonId}>
    <Link href={item.href}>{item.title}</Link>
    <span>{item.completionPercent}%</span>
    {item.nextLabel ? <small>Next: {item.nextLabel}</small> : null}
    {item.incorrectCheckCount ? <small>{item.incorrectCheckCount} {item.incorrectCheckCount === 1 ? "answer" : "answers"} to review</small> : null}
    {item.status !== "not_started" ? confirming === item.lessonId ? <span className="my-learning__restart"><span>Restart this lesson from the beginning?</span><button type="button" disabled={saving === item.lessonId} onClick={() => void restart(item)}>{saving === item.lessonId ? "Restarting…" : "Confirm restart"}</button><button type="button" onClick={() => setConfirming(undefined)}>Cancel</button>{error === item.lessonId ? <span role="alert">Restart failed. Try again.</span> : null}</span> : <button type="button" onClick={() => setConfirming(item.lessonId)}>Restart lesson</button> : null}
  </li>)}</ul> : <p>None</p>}</section>;
}

export function MyLearning({ model, unavailable = false }: { model: MyLearningModel; unavailable?: boolean }) {
  const total = model.groups.not_started.length + model.groups.in_progress.length + model.groups.completed.length;
  return <div className="my-learning">
    <header><h2>{model.pathwayTitle}</h2><p>{model.completionPercent}% complete</p><progress aria-label="Pathway completion" max={100} value={model.completionPercent} /></header>
    {unavailable ? <p role="status">Your latest progress could not be loaded. Your lesson remains available; try My learning again later.</p> : !total ? <p>No published lessons are available yet.</p> : <>
      {model.continueLesson ? <Link className="my-learning__continue" href={model.continueLesson.href}>Continue learning: {model.continueLesson.title}</Link> : null}
      <LessonList title="In progress" items={model.groups.in_progress} pathwayId={model.pathwayId} />
      <LessonList title="Not started" items={model.groups.not_started} pathwayId={model.pathwayId} />
      <LessonList title="Completed" items={model.groups.completed} pathwayId={model.pathwayId} />
    </>}
  </div>;
}
