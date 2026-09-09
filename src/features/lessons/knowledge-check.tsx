"use client";

import { useId, useState } from "react";

import { useOptionalLessonProgressItem } from "@/features/progress/lesson-progress-context";

type KnowledgeCheckProps = {
  progressItemId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

function assertValidCorrectIndex(options: string[], correctIndex: number) {
  if (
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex >= options.length
  ) {
    throw new Error("KnowledgeCheck correctIndex must reference an option.");
  }
}

export function KnowledgeCheck({
  progressItemId,
  question,
  options,
  correctIndex,
  explanation,
}: KnowledgeCheckProps) {
  assertValidCorrectIndex(options, correctIndex);

  const groupName = useId();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const progress = useOptionalLessonProgressItem(progressItemId);
  const isCorrect = checked && selectedIndex === correctIndex;

  return (
    <section className="learning-block knowledge-check">
      <fieldset>
        <legend>Knowledge check: {question}</legend>
        <div className="knowledge-check-options">
          {options.map((option, index) => (
            <label key={option}>
              <input
                checked={selectedIndex === index}
                name={groupName}
                onChange={() => {
                  setSelectedIndex(index);
                  setChecked(false);
                }}
                type="radio"
                value={index}
              />
              {option}
            </label>
          ))}
        </div>
        <button
          disabled={selectedIndex === null}
          onClick={() => {
            setChecked(true);
            void progress.complete({
              eventType: "knowledge_check_attempted",
              answerCorrect: selectedIndex === correctIndex,
            });
          }}
          type="button"
        >
          Check answer
        </button>
      </fieldset>

      <div aria-live="polite" className="knowledge-check-result" role="status">
        {checked ? (
          <>
            <p><strong>{isCorrect ? "Correct." : "Not quite."}</strong></p>
            <p>{explanation}</p>
          </>
        ) : null}
      </div>
      {progress.state === "saving" ? <p role="status">Saving answer…</p> : null}
      {progress.state === "saved" ? <p role="status">Answer saved</p> : null}
      {progress.state === "error" ? (
        <p role="alert">Answer progress was not saved. <button type="button" onClick={() => void progress.retry()}>Retry saving answer</button></p>
      ) : null}
    </section>
  );
}
