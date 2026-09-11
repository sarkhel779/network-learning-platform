"use client";

import { useEffect, useMemo, useState } from "react";

import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { TransportPlayerControls } from "@/features/transport/transport-player-controls";

import type { NatScenario } from "./nat-scenario.schema";
import { NatTopology } from "./nat-topology";
import { PacketTupleInspector } from "./packet-tuple-inspector";
import { TranslationTableInspector } from "./translation-table-inspector";

type NatJourneyPlayerProps = {
  scenarios: NatScenario[];
  initialScenarioId: string;
  progressItemId?: string;
  title: string;
};

export function NatJourneyPlayer({ scenarios, initialScenarioId, progressItemId, title }: NatJourneyPlayerProps) {
  const { markTerminalStateReached, retry, state } = useProgressCompletionBoundary(progressItemId);
  const [scenarioId, setScenarioId] = useState(initialScenarioId);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId, scenarios]);
  const finalIndex = Math.max(0, (scenario?.steps.length ?? 1) - 1);
  const step = scenario?.steps[Math.min(stepIndex, finalIndex)];

  useEffect(() => {
    if (!playing || stepIndex >= finalIndex) return;
    const timer = window.setTimeout(() => setStepIndex((value) => Math.min(finalIndex, value + 1)), 1800 / speed);
    return () => window.clearTimeout(timer);
  }, [finalIndex, playing, speed, stepIndex]);

  useEffect(() => {
    if (stepIndex >= finalIndex) setPlaying(false);
  }, [finalIndex, stepIndex]);

  useEffect(() => {
    if (stepIndex >= finalIndex) markTerminalStateReached();
  }, [finalIndex, markTerminalStateReached, stepIndex]);

  if (!scenario || !step) return <p role="alert">This NAT journey is unavailable.</p>;

  return (
    <section className="nat-journey-player" aria-label={title}>
      <header><p className="eyebrow">Interactive packet journey</p><h3>{title}</h3></header>
      {scenarios.length > 1 ? (
        <div className="nat-scenario-switcher" role="group" aria-label="Choose U-Turn NAT path">
          {scenarios.map((item) => (
            <button key={item.id} type="button" aria-pressed={item.id === scenario.id} onClick={() => {
              setScenarioId(item.id);
              setStepIndex(0);
              setPlaying(false);
            }}>{item.title ?? item.id}</button>
          ))}
        </div>
      ) : null}
      <NatTopology step={step} outcome={scenario.outcome} />
      <p role="status" aria-live="polite">Step {stepIndex + 1} of {scenario.steps.length}: {step.explanation}</p>
      <div className="nat-evidence-grid">
        <PacketTupleInspector tuple={step.tuple} translations={step.translations} />
        <TranslationTableInspector entries={step.tableEntries} activeEntryId={step.activeEntryId} />
      </div>
      <TransportPlayerControls
        finalIndex={finalIndex}
        onNext={() => { setPlaying(false); setStepIndex((value) => Math.min(finalIndex, value + 1)); }}
        onPrevious={() => { setPlaying(false); setStepIndex((value) => Math.max(0, value - 1)); }}
        onRestart={() => { setPlaying(false); setStepIndex(0); }}
        onSpeedChange={setSpeed}
        onTogglePlay={() => setPlaying((value) => !value)}
        playing={playing}
        speed={speed}
        stepIndex={stepIndex}
      />
      {state === "error" ? <button type="button" onClick={() => void retry()}>Retry saving progress</button> : null}
    </section>
  );
}
