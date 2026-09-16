"use client";

import { type MouseEvent, useMemo, useRef, useState } from "react";

import type { Pathway } from "@/features/catalog/catalog.types";
import { CurriculumNavigation } from "@/features/lessons/curriculum-navigation";
import { MyLearning, type MyLearningModel } from "@/features/progress/my-learning";
import type { LessonProgressStatus } from "@/features/progress/progress.types";

import type { Viewer, WorkspaceToolId } from "./learner-workspace.types";
import { WorkspaceDrawer } from "./workspace-drawer";
import { getVisibleWorkspaceTools } from "./workspace-tools";

type LearnerWorkspaceProps = Readonly<{
  pathway: Pathway;
  currentLessonSlug: string;
  viewer: Viewer | null;
  myLearning?: MyLearningModel;
  progressUnavailable?: boolean;
}>;

function ToolIcon({ id }: { id: WorkspaceToolId }) {
  if (id === "learning") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="m6.5 10.2 2.4 2.4 4.6-4.9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
      <path d="M4 5.5h12M4 10h12M4 14.5h7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function LearnerWorkspace({ pathway, currentLessonSlug, viewer, myLearning, progressUnavailable }: LearnerWorkspaceProps) {
  const [activeToolId, setActiveToolId] = useState<WorkspaceToolId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeTriggerRef = useRef<HTMLButtonElement>(null);
  const tools = getVisibleWorkspaceTools(viewer);
  const activeTool = tools.find(({ id }) => id === activeToolId) ?? null;

  const progressByLessonId = useMemo(() => {
    if (!myLearning || progressUnavailable) return undefined;
    const entries: [string, LessonProgressStatus][] = [];
    for (const status of ["not_started", "in_progress", "completed"] as const) {
      for (const item of myLearning.groups[status]) entries.push([item.lessonId, status]);
    }
    return Object.fromEntries(entries);
  }, [myLearning, progressUnavailable]);

  function selectTool(
    event: MouseEvent<HTMLButtonElement>,
    toolId: WorkspaceToolId,
    preserveTrigger = false,
  ) {
    if (!preserveTrigger) activeTriggerRef.current = event.currentTarget;
    setMobileMenuOpen(false);
    setActiveToolId((current) => current === toolId ? null : toolId);
  }

  function openMobileMenu(event: MouseEvent<HTMLButtonElement>) {
    activeTriggerRef.current = event.currentTarget;
    setActiveToolId(null);
    setMobileMenuOpen(true);
  }

  return (
    <>
      <div aria-label="Learner workspace" className="learner-workspace" role="toolbar">
        {tools.map((tool, index) => (
          <button
            aria-expanded={activeToolId === tool.id}
            className="learner-workspace__tool"
            data-group-start={index > 0 && tools[index - 1].group !== tool.group ? "true" : undefined}
            key={tool.id}
            onClick={(event) => selectTool(event, tool.id)}
            type="button"
          >
            <span className="learner-workspace__tool-icon"><ToolIcon id={tool.id} /></span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      <button
        aria-expanded={mobileMenuOpen || activeTool !== null}
        className="learner-workspace-mobile-trigger"
        onClick={openMobileMenu}
        type="button"
      >
        Learning tools
      </button>

      <WorkspaceDrawer
        open={mobileMenuOpen || activeTool !== null}
        title={mobileMenuOpen ? "Learning tools" : (activeTool?.label ?? "Learning tools")}
        triggerRef={activeTriggerRef}
        onClose={() => {
          setMobileMenuOpen(false);
          setActiveToolId(null);
        }}
        presentation={mobileMenuOpen ? "bottom" : "side"}
      >
        {mobileMenuOpen ? (
          <div className="learner-workspace-mobile-menu">
            {tools.map((tool, index) => (
              <button
                data-group-start={index > 0 && tools[index - 1].group !== tool.group ? "true" : undefined}
                key={tool.id}
                onClick={(event) => selectTool(event, tool.id, true)}
                type="button"
              >
                <span className="learner-workspace__tool-icon"><ToolIcon id={tool.id} /></span>
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
        ) : activeTool ? (
          <>
            <nav aria-label="Workspace tools" className="learner-workspace-drawer-tools">
              {tools.map((tool, index) => (
                <button
                  aria-pressed={activeTool.id === tool.id}
                  data-group-start={index > 0 && tools[index - 1].group !== tool.group ? "true" : undefined}
                  key={tool.id}
                  onClick={(event) => selectTool(event, tool.id, true)}
                  type="button"
                >
                  {tool.label}
                </button>
              ))}
            </nav>
            {activeTool.id === "course" ? (
              <CurriculumNavigation
                pathway={pathway}
                currentLessonSlug={currentLessonSlug}
                onLessonSelect={() => setActiveToolId(null)}
                progressByLessonId={progressByLessonId}
              />
            ) : activeTool.id === "learning" && myLearning ? (
              <MyLearning model={myLearning} unavailable={progressUnavailable} />
            ) : (
              <p role="status">Your learning progress is temporarily unavailable. Please try again later.</p>
            )}
          </>
        ) : null}
      </WorkspaceDrawer>
    </>
  );
}
