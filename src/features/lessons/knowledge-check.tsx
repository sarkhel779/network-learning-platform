"use client";

import { useId, useState } from "react";

type KnowledgeCheckProps = {
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
  question,
  options,
  correctIndex,
  explanation,
}: KnowledgeCheckProps) {
  assertValidCorrectIndex(options, correctIndex);

  const groupName = useId();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
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
          onClick={() => setChecked(true)}
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
    </section>
  );
}
