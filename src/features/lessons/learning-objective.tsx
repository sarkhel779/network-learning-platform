import type { ReactNode } from "react";

type LearningObjectiveProps = { children: ReactNode };

export function LearningObjective({ children }: LearningObjectiveProps) {
  return (
    <section aria-label="Learning objective" className="learning-block learning-objective">
      <h2>Learning objective</h2>
      <p>{children}</p>
    </section>
  );
}
