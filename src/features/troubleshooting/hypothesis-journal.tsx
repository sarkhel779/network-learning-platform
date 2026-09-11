import { useId } from "react";

import type { Confidence } from "./troubleshooting-engine";
import type { TroubleshootingScenario } from "./troubleshooting-scenario.schema";

type Props = {
  hypotheses: TroubleshootingScenario["hypotheses"];
  hypothesisId: string;
  predictionId: string;
  confidence: Confidence;
  onHypothesisChange: (value: string) => void;
  onPredictionChange: (value: string) => void;
  onConfidenceChange: (value: Confidence) => void;
};

export function HypothesisJournal(props: Props) {
  const titleId = useId();
  const selected = props.hypotheses.find(({ id }) => id === props.hypothesisId) ?? props.hypotheses[0];
  return <section className="hypothesis-journal" aria-labelledby={titleId}>
    <h3 id={titleId}>Hypothesis journal</h3>
    <fieldset><legend>What could explain the evidence?</legend>{props.hypotheses.map((item) => <label key={item.id}><input checked={props.hypothesisId === item.id} name={`${titleId}-hypothesis`} onChange={() => { props.onHypothesisChange(item.id); props.onPredictionChange(item.predictions[0].id); }} type="radio" />{item.label}</label>)}</fieldset>
    <fieldset><legend>What should the next test show?</legend>{selected.predictions.map((item) => <label key={item.id}><input checked={props.predictionId === item.id} name={`${titleId}-prediction`} onChange={() => props.onPredictionChange(item.id)} type="radio" />{item.label}</label>)}</fieldset>
    <fieldset><legend>Confidence</legend>{(["underconfident", "calibrated", "overconfident"] as const).map((value) => <label key={value}><input checked={props.confidence === value} name={`${titleId}-confidence`} onChange={() => props.onConfidenceChange(value)} type="radio" />{value}</label>)}</fieldset>
  </section>;
}
