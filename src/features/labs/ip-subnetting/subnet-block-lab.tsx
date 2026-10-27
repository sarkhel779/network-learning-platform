"use client";

import { useEffect, useId, useState } from "react";

import { AddressBlockBar } from "./address-block-bar";
import { FloatingTopology } from "../floating-topology";
import type { BlockSegment, SubnetBlockConfig } from "./subnet-block-types";
import { focusLessonAnchor } from "@/features/progress/progress-navigation";

export function SubnetBlockLab({ config }: { config: SubnetBlockConfig }) {
  const id = useId();
  const [started, setStarted] = useState(false);
  const [currentHopIndex, setCurrentHopIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(string | null)[]>(() => config.hops.map(() => null));
  const [checked, setChecked] = useState<boolean[]>(() => config.hops.map(() => false));
  const [segments, setSegments] = useState<BlockSegment[]>([]);
  const [totalUnits, setTotalUnits] = useState(config.hops[0]?.totalUnits ?? 1);

  useEffect(() => {
    if (finished) { focusLessonAnchor(`${id}-finished`); return; }
    if (currentHopIndex === 0) return;
    focusLessonAnchor(`${id}-hop-${currentHopIndex}`);
  }, [currentHopIndex, finished, id]);

  function selectAnswer(hopIndex: number, optionId: string) {
    setAnswers((current) => current.map((value, index) => (index === hopIndex ? optionId : value)));
    setChecked((current) => current.map((value, index) => (index === hopIndex ? false : value)));
  }

  function checkHop(hopIndex: number) {
    setChecked((current) => current.map((value, index) => (index === hopIndex ? true : value)));
    const hop = config.hops[hopIndex];
    if (answers[hopIndex] !== hop.correctId) return;
    setTotalUnits(hop.totalUnits);
    setSegments((current) => (config.barMode === "append" ? [...current, ...hop.segments] : hop.segments));
  }

  function advanceHop(hopIndex: number) {
    const isLastHop = hopIndex === config.hops.length - 1;
    if (isLastHop) setFinished(true); else setCurrentHopIndex(hopIndex + 1);
  }

  function restart() {
    setStarted(false);
    setCurrentHopIndex(0);
    setFinished(false);
    setAnswers(config.hops.map(() => null));
    setChecked(config.hops.map(() => false));
    setSegments([]);
    setTotalUnits(config.hops[0]?.totalUnits ?? 1);
  }

  return (
    <section aria-label={config.title} className="sample-lab">
      <div className="sample-lab__panel acl-sim">
        {segments.length > 0 ? (
          <FloatingTopology>
            <AddressBlockBar ariaLabel={config.ariaLabel} totalUnits={totalUnits} segments={segments} />
          </FloatingTopology>
        ) : null}

        {!started ? (
          <div className="acl-sim__controls">
            <p>{config.intro}</p>
            <button type="button" onClick={() => setStarted(true)}>Start</button>
          </div>
        ) : null}

        {started
          ? config.hops.map((hop, hopIndex) => {
              if (hopIndex > currentHopIndex) return null;
              const isCurrent = hopIndex === currentHopIndex;
              const isCorrect = checked[hopIndex] && answers[hopIndex] === hop.correctId;
              return (
                <div className="arp-and-step" id={`${id}-hop-${hopIndex}`} key={hopIndex}>
                  <p className="labs-step-progress">Step {hopIndex + 1} of {config.hops.length}</p>
                  <p>{hop.prompt}</p>
                  {hop.detail ? <p className="acl-sim__hint">{hop.detail}</p> : null}
                  <fieldset className="acl-sim__controls">
                    <legend>Pick one</legend>
                    {hop.options.map((option) => (
                      <label key={option.id}>
                        <input
                          type="radio"
                          name={`${id}-hop-${hopIndex}`}
                          checked={answers[hopIndex] === option.id}
                          disabled={!isCurrent}
                          onChange={() => selectAnswer(hopIndex, option.id)}
                        />
                        {option.label}
                      </label>
                    ))}
                    <button type="button" onClick={() => checkHop(hopIndex)} disabled={!isCurrent || !answers[hopIndex]}>Check</button>
                  </fieldset>
                  {checked[hopIndex] ? (
                    isCorrect ? (
                      <>
                        <p role="status" className="acl-sim__result" data-outcome="permit"><strong>Correct!</strong> {hop.explanation}</p>
                        {isCurrent ? (
                          <button type="button" onClick={() => advanceHop(hopIndex)}>
                            {hopIndex === config.hops.length - 1 ? "Finish" : "Continue"}
                          </button>
                        ) : null}
                      </>
                    ) : (
                      <p role="status" className="acl-sim__result" data-outcome="blocked">Not correct — try again.</p>
                    )
                  ) : null}
                </div>
              );
            })
          : null}

        {finished ? (
          <div id={`${id}-finished`}>
            <p role="status" className="acl-sim__result" data-outcome="permit">{config.completionMessage}</p>
            <div className="sample-lab__controls">
              <button type="button" onClick={restart}>Restart</button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
