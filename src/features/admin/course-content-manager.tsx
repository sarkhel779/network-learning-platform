"use client";

import { useState, useTransition } from "react";

import { moveLessonAction, setLessonPublishedAction } from "@/app/admin/courses/actions";
import type { Pathway } from "@/features/catalog/catalog.types";

export function CourseContentManager({ pathways }: { pathways: Pathway[] }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  function togglePublished(lessonId: string, nextPublished: boolean) {
    setActiveLessonId(lessonId);
    startTransition(async () => {
      const data = new FormData();
      data.set("lessonId", lessonId);
      data.set("published", String(nextPublished));
      const result = await setLessonPublishedAction(data);
      setFeedback(result);
      setActiveLessonId(null);
    });
  }

  function move(moduleId: string, lessonId: string, direction: "up" | "down") {
    setActiveLessonId(lessonId);
    startTransition(async () => {
      const data = new FormData();
      data.set("moduleId", moduleId);
      data.set("lessonId", lessonId);
      data.set("direction", direction);
      const result = await moveLessonAction(data);
      setFeedback(result);
      setActiveLessonId(null);
    });
  }

  return (
    <section className="admin-panel admin-course-manager">
      <p>Publishing controls the copy learners already read; the lesson text itself is still authored as MDX in the repository. Changes take effect within moments.</p>
      {feedback ? <p role={feedback.ok ? "status" : "alert"}>{feedback.message}</p> : null}
      {pathways.map((pathway) => (
        <div key={pathway.id}>
          <h2>{pathway.title}</h2>
          {pathway.modules.map((courseModule) => (
            <div key={courseModule.id}>
              <h3>{courseModule.title}</h3>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Lesson</th>
                      <th scope="col">Status</th>
                      <th scope="col">Reorder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseModule.lessons.map((lesson, index) => {
                      const isActive = pending && activeLessonId === lesson.id;
                      return (
                        <tr key={lesson.id}>
                          <td>{lesson.title}</td>
                          <td>
                            <span>{lesson.published ? "Published" : "Draft"}</span>
                            {" "}
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => togglePublished(lesson.id, !lesson.published)}
                            >
                              {isActive ? "Saving…" : lesson.published ? "Unpublish" : "Publish"}
                            </button>
                          </td>
                          <td>
                            <button
                              type="button"
                              disabled={pending || index === 0}
                              onClick={() => move(courseModule.id, lesson.id, "up")}
                            >
                              Move up
                            </button>
                            {" "}
                            <button
                              type="button"
                              disabled={pending || index === courseModule.lessons.length - 1}
                              onClick={() => move(courseModule.id, lesson.id, "down")}
                            >
                              Move down
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
