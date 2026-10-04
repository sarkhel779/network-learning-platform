import { labTopics } from "./labs.data";
import type { LabScenario, LabTopic } from "./labs.types";

export function listLabTopics(): LabTopic[] {
  return labTopics;
}

export function getLabTopic(topicSlug: string): LabTopic {
  const topic = labTopics.find(({ slug }) => slug === topicSlug);

  if (!topic) {
    throw new Error("LAB_TOPIC_NOT_FOUND");
  }

  return topic;
}

export function getLabScenario(topicSlug: string, scenarioSlug: string): LabScenario {
  const scenario = getLabTopic(topicSlug).scenarios.find(({ slug }) => slug === scenarioSlug);

  if (!scenario) {
    throw new Error("LAB_SCENARIO_NOT_FOUND");
  }

  return scenario;
}
