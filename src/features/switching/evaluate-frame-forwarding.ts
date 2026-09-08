import {
  switchDecisionSchema,
  switchingScenarioSchema,
  type ForwardingEntry,
  type LearnerPrediction,
  type SwitchDecision,
  type SwitchingScenario,
} from "./switching.schema";

export type FrameForwardingResult = Readonly<{
  scenarioId: string;
  decision: SwitchDecision;
  learnedEntry: ForwardingEntry;
  egressPortIds: readonly string[];
  correct: boolean;
  explanation: string;
  wrongAnswerExplanation?: string;
  nextTable: readonly ForwardingEntry[];
}>;

function sameMembers(left: readonly string[], right: readonly string[]) {
  return left.length === right.length
    && new Set(left).size === left.length
    && left.every((value) => right.includes(value));
}

export function evaluateFrameForwarding(
  scenarioInput: SwitchingScenario,
  prediction: LearnerPrediction,
): FrameForwardingResult {
  const scenario = switchingScenarioSchema.parse(scenarioInput);
  const predictedDecision = switchDecisionSchema.parse(prediction.decision);
  const portIds = scenario.ports.map(({ id }) => id);

  if (new Set(prediction.egressPortIds).size !== prediction.egressPortIds.length
    || prediction.egressPortIds.some((id) => !portIds.includes(id))) {
    throw new Error("Prediction contains an unknown or duplicate egress port");
  }

  const learnedEntry = Object.freeze({
    mac: scenario.sourceMac,
    portId: scenario.ingressPortId,
  });
  const nextTable = Object.freeze([
    ...scenario.initialTable.filter(({ mac }) => mac !== scenario.sourceMac),
    learnedEntry,
  ].map((entry) => Object.freeze({ ...entry })));
  const destinationEntry = nextTable.find(({ mac }) => mac === scenario.destinationMac);

  let decision: SwitchDecision;
  let selectedPorts: readonly string[];
  if (scenario.destinationType === "broadcast") {
    decision = "broadcast-flood";
    selectedPorts = scenario.eligibleEgressPortIds;
  } else if (!destinationEntry) {
    decision = "unknown-unicast-flood";
    selectedPorts = scenario.eligibleEgressPortIds;
  } else if (destinationEntry.portId === scenario.ingressPortId) {
    decision = "filter";
    selectedPorts = [];
  } else {
    decision = "known-unicast";
    selectedPorts = [destinationEntry.portId];
  }

  const egressPortIds = Object.freeze(
    scenario.ports
      .map(({ id }) => id)
      .filter((id) => selectedPorts.includes(id)),
  );
  const correct = predictedDecision === decision
    && sameMembers(prediction.egressPortIds, egressPortIds);

  return Object.freeze({
    scenarioId: scenario.id,
    decision,
    learnedEntry,
    egressPortIds,
    correct,
    explanation: scenario.explanation,
    wrongAnswerExplanation: correct
      ? undefined
      : scenario.wrongAnswerExplanations[predictedDecision],
    nextTable,
  });
}

export function safeEvaluateFrameForwarding(
  scenario: SwitchingScenario,
  prediction: LearnerPrediction,
): FrameForwardingResult | undefined {
  try {
    return evaluateFrameForwarding(scenario, prediction);
  } catch {
    return undefined;
  }
}
