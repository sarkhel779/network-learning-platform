"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

import type { HopDevice, HopQuiz, HopStep } from "./hop-lab-types";

export function HopLab({
  ariaLabel,
  topologyAriaLabel,
  devices,
  steps,
  quiz,
  extraPanelTitle,
  extraPanel,
}: {
  ariaLabel: string;
  topologyAriaLabel: string;
  devices: HopDevice[];
  steps: HopStep[];
  quiz: HopQuiz;
  extraPanelTitle?: string;
  extraPanel?: ReactNode;
}) {
  const views = ["Topology", "Detail", ...(extraPanelTitle ? [extraPanelTitle] : []), "Explanation"] as const;
  const [view, setView] = useState<string>(views[0]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const id = useId();
  const step = steps[index];
  const activeStart = devices.findIndex((device) => device.id === step.fromId);
  const activeEnd = step.toId ? devices.findIndex((device) => device.id === step.toId) : -1;

  useEffect(() => {
    if (!playing || index >= steps.length - 1) return;
    const timer = window.setTimeout(() => {
      setIndex(index + 1);
      if (index + 1 >= steps.length - 1) setPlaying(false);
    }, 1650);
    return () => window.clearTimeout(timer);
  }, [index, steps.length, playing]);

  function selectView(next: string) { setView(next); }

  return <section aria-label={ariaLabel} className="sample-lab">
    <div className="sample-lab__tabs" role="tablist" aria-label="Lab views">
      {views.map((name, tabIndex) => <button key={name} role="tab" type="button" aria-selected={view === name} aria-controls={`${id}-panel`} tabIndex={view === name ? 0 : -1} onClick={() => selectView(name)} onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const next = views[(tabIndex + (event.key === "ArrowRight" ? 1 : views.length - 1)) % views.length];
        selectView(next);
        event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[views.indexOf(next)]?.focus();
      }}>{name}</button>)}
    </div>
    <div className="sample-lab__panel" id={`${id}-panel`} role="tabpanel" aria-label={view}>
      {view === "Topology" ? <div className="sample-lab__topology" role="img" aria-label={topologyAriaLabel}>
        {devices.map((device, deviceIndex) => <div className="sample-lab__segment" key={device.id}>
          <div className={`sample-lab__device ${device.id === step.fromId || device.id === step.toId ? "sample-lab__device--active" : ""}`}>{device.icon}<strong>{device.label}</strong>{device.sublabel ? <small>{device.sublabel}</small> : null}</div>
          {deviceIndex < devices.length - 1 ? <div className={`sample-lab__link ${Math.min(activeStart, activeEnd) === deviceIndex && Math.abs(activeStart - activeEnd) === 1 ? "sample-lab__link--active" : ""}`}>
            {Math.min(activeStart, activeEnd) === deviceIndex && Math.abs(activeStart - activeEnd) === 1 ? <span key={`${step.fromId}-${step.toId}-${index}`} data-testid="moving-lab-packet" className={`sample-lab__packet ${activeStart > activeEnd ? "sample-lab__packet--reverse" : ""}`} aria-hidden="true">▣</span> : null}
          </div> : null}
        </div>)}
      </div> : null}
      {view === "Detail" ? <div className="sample-lab__flow"><h3>{step.title}</h3><p>{step.explanation}</p>{step.fields.length ? <dl>{step.fields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}</dl> : null}</div> : null}
      {extraPanelTitle && view === extraPanelTitle ? <div className="sample-lab__flow">{extraPanel}</div> : null}
      {view === "Explanation" ? <div className="sample-lab__explanation"><h3>What&apos;s happening at this step?</h3><p>{step.explanation}</p></div> : null}
    </div>
    <p className="sample-lab__stage" role="status">Step {index + 1} of {steps.length}: {step.title}{step.outcome === "blocked" ? " · blocked" : step.outcome === "delivered" ? " · delivered" : ""}</p>
    <div className="sample-lab__controls"><button type="button" onClick={() => setPlaying((value) => !value)} disabled={index >= steps.length - 1}>{playing ? "Pause" : "Play walkthrough"}</button><button type="button" onClick={() => { setPlaying(false); setIndex((current) => Math.min(current + 1, steps.length - 1)); }} disabled={index >= steps.length - 1}>Next step</button><button type="button" onClick={() => { setPlaying(false); setIndex(0); }}>Restart</button></div>
    <fieldset className="sample-lab__quiz"><legend>{quiz.question}</legend>{quiz.options.map((option) => <label key={option.id}><input type="radio" name={`${id}-prediction`} checked={prediction === option.id} onChange={() => { setPrediction(option.id); setChecked(false); }} />{option.label}</label>)}<button type="button" disabled={!prediction} onClick={() => setChecked(true)}>Check prediction</button>{checked ? <p role="status" aria-label="Prediction feedback">{prediction === quiz.correctId ? quiz.feedbackCorrect : quiz.feedbackIncorrect}</p> : null}</fieldset>
  </section>;
}
