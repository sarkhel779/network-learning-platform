"use client";

import { useRef, useState } from "react";

import type { Pathway } from "@/features/catalog/catalog.types";
import { WorkspaceDrawer } from "@/features/learner-workspace/workspace-drawer";

import { CurriculumNavigation } from "./curriculum-navigation";

type CourseContentsDrawerProps = Readonly<{
  pathway: Pathway;
  currentLessonSlug: string;
}>;

export function CourseContentsDrawer({ pathway, currentLessonSlug }: CourseContentsDrawerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  return (
    <>
      <button
        aria-expanded={open}
        className="course-contents-trigger"
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        Course contents
      </button>
      <WorkspaceDrawer
        open={open}
        title="Course contents"
        triggerRef={triggerRef}
        onClose={close}
      >
        <CurriculumNavigation
          pathway={pathway}
          currentLessonSlug={currentLessonSlug}
          onLessonSelect={close}
        />
      </WorkspaceDrawer>
    </>
  );
}
