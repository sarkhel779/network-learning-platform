import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ setLessonPublishedAction: vi.fn(), moveLessonAction: vi.fn() }));
vi.mock("@/app/admin/courses/actions", () => ({
  setLessonPublishedAction: mocks.setLessonPublishedAction,
  moveLessonAction: mocks.moveLessonAction,
}));

import { CourseContentManager } from "./course-content-manager";
import type { Pathway } from "@/features/catalog/catalog.types";

const pathway: Pathway = {
  id: "path_test",
  slug: "test-pathway",
  title: "Test Pathway",
  description: "A pathway for tests.",
  audience: "Testers.",
  modules: [
    {
      id: "module_one",
      slug: "module-one",
      title: "Module One",
      description: "First module.",
      lessons: [
        { id: "lesson_a", slug: "lesson-a", title: "Lesson A", objective: "", seo: { title: "A", description: "A" }, estimatedMinutes: 5, published: true },
        { id: "lesson_b", slug: "lesson-b", title: "Lesson B", objective: "", seo: { title: "B", description: "B" }, estimatedMinutes: 5, published: false },
      ],
    },
  ],
};

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  mocks.setLessonPublishedAction.mockReset();
  mocks.moveLessonAction.mockReset();
});

describe("CourseContentManager", () => {
  it("toggles a published lesson to a draft", async () => {
    mocks.setLessonPublishedAction.mockResolvedValue({ ok: true, message: "Lesson A is now a draft." });
    render(<CourseContentManager pathways={[pathway]} />);
    fireEvent.click(screen.getByRole("button", { name: "Unpublish" }));
    expect(await screen.findByRole("status")).toHaveTextContent("now a draft");
    expect(mocks.setLessonPublishedAction).toHaveBeenCalledOnce();
    const formData = mocks.setLessonPublishedAction.mock.calls[0][0] as FormData;
    expect(formData.get("lessonId")).toBe("lesson_a");
    expect(formData.get("published")).toBe("false");
  });

  it("disables Move up for the first lesson and Move down for the last", () => {
    render(<CourseContentManager pathways={[pathway]} />);
    expect(screen.getAllByRole("button", { name: "Move up" })[0]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Move down" })[1]).toBeDisabled();
  });

  it("submits a reorder request for a lesson that can move", async () => {
    mocks.moveLessonAction.mockResolvedValue({ ok: true, message: "Lesson order updated." });
    render(<CourseContentManager pathways={[pathway]} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Move down" })[0]);
    expect(await screen.findByRole("status")).toHaveTextContent("Lesson order updated");
    const formData = mocks.moveLessonAction.mock.calls[0][0] as FormData;
    expect(formData.get("moduleId")).toBe("module_one");
    expect(formData.get("lessonId")).toBe("lesson_a");
    expect(formData.get("direction")).toBe("down");
  });

  it("surfaces a failed update as an alert instead of a false success", async () => {
    mocks.setLessonPublishedAction.mockResolvedValue({ ok: false, message: "Lesson publication could not be updated." });
    render(<CourseContentManager pathways={[pathway]} />);
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be updated");
  });
});
