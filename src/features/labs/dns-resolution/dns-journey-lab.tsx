"use client";

import { useEffect, useId, useState } from "react";

import { FlowDiagram, type FlowLink, type FlowNode } from "./flow-diagram";
import { FloatingTopology } from "../floating-topology";
import type { DnsJourneyConfig } from "./dns-journey-types";
import { focusLessonAnchor } from "@/features/progress/progress-navigation";

export function DnsJourneyLab({ config }: { config: DnsJourneyConfig }) {
  const id = useId();
  const [started, setStarted] = useState(false);
  const [currentHopIndex, setCurrentHopIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(string | null)[]>(() => config.hops.map(() => null));
  const [checked, setChecked] = useState<boolean[]>(() => config.hops.map(() => false));
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [blockedAt, setBlockedAt] = useState<string | null>(null);
  const [pathHistory, setPathHistory] = useState<string[]>([]);

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
  }

  function start() {
    setStarted(true);
    setActiveNode(config.startNodeId);
    setPathHistory([config.startNodeId]);
  }

  function advanceHop(hopIndex: number) {
    const hop = config.hops[hopIndex];
    const isLastHop = hopIndex === config.hops.length - 1;
    if (hop.activateSequence.length === 0) {
      if (isLastHop) setFinished(true); else setCurrentHopIndex(hopIndex + 1);
      return;
    }
    hop.activateSequence.forEach((nodeId, stepIndex) => {
      const delay = 50 + stepIndex * 900;
      window.setTimeout(() => {
        setActiveNode(nodeId);
        setPathHistory((current) => [...current, nodeId]);
        if (stepIndex === hop.activateSequence.length - 1) {
          setBlockedAt(hop.blockedAtEnd ? nodeId : null);
          if (isLastHop) setFinished(true); else setCurrentHopIndex(hopIndex + 1);
        }
      }, delay);
    });
  }

  function restart() {
    setStarted(false);
    setCurrentHopIndex(0);
    setFinished(false);
    setAnswers(config.hops.map(() => null));
    setChecked(config.hops.map(() => false));
    setActiveNode(null);
    setBlockedAt(null);
    setPathHistory([]);
  }

  const traveledEdges = new Set(pathHistory.slice(0, -1).map((nodeId, index) => `${nodeId}->${pathHistory[index + 1]}`));
  const nodes: FlowNode[] = config.nodes.map((node) => ({
    ...node,
    state: blockedAt === node.id ? "blocked" : activeNode === node.id ? "active" : "idle",
  }));
  const links: FlowLink[] = config.links.map((link) => ({
    ...link,
    traveled: traveledEdges.has(`${link.from}->${link.to}`),
  }));

  return (
    <section aria-label={config.title} className="sample-lab">
      <div className="sample-lab__panel acl-sim">
        <FloatingTopology>
          <FlowDiagram ariaLabel={config.canvasAriaLabel} nodes={nodes} links={links} />
        </FloatingTopology>

        {!started ? (
          <div className="acl-sim__controls">
            <p>{config.intro}</p>
            <button type="button" onClick={start}>Start</button>
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
