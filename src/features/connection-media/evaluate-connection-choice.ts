import type {
  ChoiceEvaluation,
  ConnectionMediumId,
  ConnectionOutcome,
  ConnectionScenario,
} from "./connection-media.schema";

export type ConnectionChoiceResult = Readonly<{
  scenarioId: string;
  selectedMediumId: ConnectionMediumId;
  recommendedMediumId: ConnectionMediumId;
  outcome: ConnectionOutcome;
  decisiveRequirements: readonly string[];
  explanation: string;
}>;

function getChoiceEvaluation(
  scenario: ConnectionScenario,
  mediumId: ConnectionMediumId,
): ChoiceEvaluation {
  const evaluations = scenario.evaluations;

  if (!evaluations || typeof evaluations !== "object" || !Object.hasOwn(evaluations, mediumId)) {
    throw new Error(`Unknown connection medium identifier: ${String(mediumId)}`);
  }

  const evaluation = evaluations[mediumId];
  if (!evaluation) {
    throw new Error(`Missing evaluation for connection medium: ${String(mediumId)}`);
  }

  return evaluation;
}

export function evaluateConnectionChoice(
  scenario: ConnectionScenario,
  mediumId: ConnectionMediumId,
): ConnectionChoiceResult {
  const evaluation = getChoiceEvaluation(scenario, mediumId);

  return Object.freeze({
    scenarioId: scenario.id,
    selectedMediumId: mediumId,
    recommendedMediumId: scenario.recommendedMediumId,
    outcome: evaluation.outcome,
    decisiveRequirements: Object.freeze([...evaluation.decisiveRequirements]),
    explanation: evaluation.explanation,
  });
}

export function safeEvaluateConnectionChoice(
  scenario: ConnectionScenario,
  mediumId: ConnectionMediumId,
): ConnectionChoiceResult | undefined {
  try {
    return evaluateConnectionChoice(scenario, mediumId);
  } catch {
    return undefined;
  }
}
