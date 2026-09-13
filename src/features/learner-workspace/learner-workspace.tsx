"use client";

import { type MouseEvent, useRef, useState } from "react";

import type { Pathway } from "@/features/catalog/catalog.types";
import { CurriculumNavigation } from "@/features/lessons/curriculum-navigation";
import { MyLearning, type MyLearningModel } from "@/features/progress/my-learning";

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

function ToolIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20">
      <path d="M4 4h12v12H4zM7 7h6M7 10h6M7 13h4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function LearnerWorkspace({ pathway, currentLessonSlug, viewer, myLearning, progressUnavailable }: LearnerWorkspaceProps) {
  const [activeToolId, setActiveToolId] = useState<WorkspaceToolId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeTriggerRef = useRef<HTMLButtonElement>(null);
  const tools = getVisibleWorkspaceTools(viewer);
  const activeTool = tools.find(({ id }) => id === activeToolId) ?? null;

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
            <ToolIcon />
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
                <ToolIcon />
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
