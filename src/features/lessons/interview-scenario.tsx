import type { ReactNode } from "react";

type InterviewScenarioProps = {
  prompt: ReactNode;
  children: ReactNode;
};

export function InterviewScenario({ prompt, children }: InterviewScenarioProps) {
  return (
    <section aria-label="Interview scenario" className="learning-block interview-scenario">
      <h2>Interview scenario</h2>
      <p>{prompt}</p>
      <details>
        <summary>Show answer and reasoning</summary>
        <div>{children}</div>
      </details>
    </section>
  );
}
