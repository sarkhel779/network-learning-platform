"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import type { Pathway } from "@/features/catalog/catalog.types";

import { CurriculumNavigation } from "./curriculum-navigation";

type CourseContentsDrawerProps = Readonly<{
  pathway: Pathway;
  currentLessonSlug: string;
}>;

const focusableSelector = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function CourseContentsDrawer({ pathway, currentLessonSlug }: CourseContentsDrawerProps) {
  const [open, setOpen] = useState(false);
  const headingId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    queueMicrotask(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const firstControl = drawer?.querySelector<HTMLElement>(focusableSelector);
    firstControl?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !drawer) return;

      const controls = Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector));
      const first = controls[0];
      const last = controls.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close, open]);

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
      {open ? (
        <div className="course-contents-overlay">
          <button
            aria-label="Dismiss course contents"
            className="course-contents-backdrop"
            onClick={close}
            type="button"
          />
          <div
            aria-labelledby={headingId}
            aria-modal="true"
            className="course-contents-drawer"
            ref={drawerRef}
            role="dialog"
          >
            <div className="course-contents-drawer__header">
              <h2 id={headingId}>Course contents</h2>
              <button onClick={close} type="button">Close course contents</button>
            </div>
            <CurriculumNavigation
              pathway={pathway}
              currentLessonSlug={currentLessonSlug}
              onLessonSelect={close}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
