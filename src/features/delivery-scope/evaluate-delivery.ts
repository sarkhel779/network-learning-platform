import {
  deliveryScenarioSchema,
  learnerDeliveryPredictionSchema,
  type DeliveryOutcome,
  type DeliveryScenario,
  type LearnerDeliveryPrediction,
} from "./delivery-scope.schema";

const sameSet = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value) => right.includes(value));

export function evaluateDelivery(scenario: DeliveryScenario): DeliveryOutcome {
  const eligibleNonIngress = scenario.ports.filter(
    ({ id, eligible }) => eligible && id !== scenario.ingressPortId,
  );

  let egressPorts = eligibleNonIngress;
  if (scenario.deliveryKind === "known-unicast") {
    egressPorts = eligibleNonIngress.filter(({ id }) => id === scenario.learnedDestinationPortId);
  } else if (scenario.deliveryKind === "multicast" && scenario.multicastGroupKnownToSwitch) {
    egressPorts = eligibleNonIngress.filter(({ connectedNodeId }) =>
      scenario.nodes.find(({ id }) => id === connectedNodeId)?.multicastGroups.includes(
        scenario.multicastGroup ?? "",
      ),
    );
  }

  const receivingNodeIds = egressPorts.map(({ connectedNodeId }) => connectedNodeId);
  const receivingNodes = receivingNodeIds.map((nodeId) =>
    scenario.nodes.find(({ id }) => id === nodeId)!,
  );
  const acceptingNodeIds = receivingNodes.filter((node) => {
    if (scenario.deliveryKind === "broadcast") return true;
    if (scenario.deliveryKind === "multicast") {
      return node.multicastGroups.includes(scenario.multicastGroup ?? "");
    }
    return node.id === scenario.destinationNodeId && node.acceptsUnicast;
  }).map(({ id }) => id);

  return {
    egressPortIds: egressPorts.map(({ id }) => id),
    receivingNodeIds,
    acceptingNodeIds,
    routerAction: scenario.routerAction,
    explanation: scenario.explanation,
  };
}

export function safeEvaluateDelivery(input: unknown): DeliveryOutcome | undefined {
  const result = deliveryScenarioSchema.safeParse(input);
  return result.success ? evaluateDelivery(result.data) : undefined;
}

export type DeliveryPredictionResult = {
  correct: boolean;
  forwardedCorrect: boolean;
  receivedCorrect: boolean;
  acceptedCorrect: boolean;
  routerCorrect: boolean;
  outcome: DeliveryOutcome;
};

export function evaluateDeliveryPrediction(
  scenario: DeliveryScenario,
  prediction: LearnerDeliveryPrediction,
): DeliveryPredictionResult {
  const outcome = evaluateDelivery(scenario);
  const forwardedCorrect = sameSet(prediction.egressPortIds, outcome.egressPortIds);
  const receivedCorrect = sameSet(prediction.receivingNodeIds, outcome.receivingNodeIds);
  const acceptedCorrect = sameSet(prediction.acceptingNodeIds, outcome.acceptingNodeIds);
  const routerCorrect = prediction.routerAction === outcome.routerAction;
  return {
    correct: forwardedCorrect && receivedCorrect && acceptedCorrect && routerCorrect,
    forwardedCorrect, receivedCorrect, acceptedCorrect, routerCorrect, outcome,
  };
}

export function safeEvaluateDeliveryPrediction(
  scenarioInput: unknown,
  predictionInput: unknown,
): DeliveryPredictionResult | undefined {
  const scenario = deliveryScenarioSchema.safeParse(scenarioInput);
  const prediction = learnerDeliveryPredictionSchema.safeParse(predictionInput);
  return scenario.success && prediction.success
    ? evaluateDeliveryPrediction(scenario.data, prediction.data)
    : undefined;
}
