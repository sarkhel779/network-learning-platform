"use client";

import { useState } from "react";
import { TransportPlayerControls } from "@/features/transport/transport-player-controls";
import { rootBootstrapScenario } from "./dns-pro.data";

export function RootBootstrapPlayer() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = rootBootstrapScenario.steps[stepIndex];
  return <section className="root-bootstrap-player"><h3>{rootBootstrapScenario.title}</h3><p aria-live="polite" role="status">Step {stepIndex + 1} of {rootBootstrapScenario.steps.length}: {step.title}. {step.explanation}</p>
    <TransportPlayerControls finalIndex={rootBootstrapScenario.steps.length - 1} onNext={() => setStepIndex((value) => value + 1)} onPrevious={() => setStepIndex((value) => value - 1)} onRestart={() => setStepIndex(0)} onSpeedChange={() => undefined} onTogglePlay={() => undefined} playing={false} speed={1} stepIndex={stepIndex} />
  </section>;
}
