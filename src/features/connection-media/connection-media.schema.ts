import { z } from "zod";

export type ConnectionMediumId = "copper" | "fibre" | "wireless";
export type ComparisonQualityId = "distance" | "bandwidth" | "interference" | "mobility" | "cost";
export type ConnectionOutcome = "recommended" | "workable-with-trade-offs" | "unsuitable";

export type ConnectionMediumQuality = Readonly<{
  label: string;
  explanation: string;
}>;

export type ConnectionMedium = Readonly<{
  id: ConnectionMediumId;
  name: string;
  signalLabel: string;
  summary: string;
  analogy: string;
  qualities: Readonly<Record<ComparisonQualityId, ConnectionMediumQuality>>;
}>;

export type ChoiceEvaluation = Readonly<{
  outcome: ConnectionOutcome;
  decisiveRequirements: readonly string[];
  explanation: string;
}>;

export type ConnectionScenario = Readonly<{
  id: string;
  title: string;
  source: string;
  destination: string;
  distance: string;
  minimumBandwidth: string;
  latencySensitivity: "low" | "medium" | "high";
  environment: string;
  mobilityRequired: boolean;
  reliabilityPriority: "standard" | "high";
  budget: "low" | "medium" | "high";
  recommendedMediumId: ConnectionMediumId;
  evaluations: Readonly<Record<ConnectionMediumId, ChoiceEvaluation>>;
}>;

export type ConnectionMediaCatalog = Readonly<{
  media: readonly ConnectionMedium[];
  scenarios: readonly ConnectionScenario[];
}>;

const nonEmptyString = z.string().trim().min(1);
const connectionMediumIdSchema = z.enum(["copper", "fibre", "wireless"]);
const comparisonQualityIdSchema = z.enum(["distance", "bandwidth", "interference", "mobility", "cost"]);
const connectionOutcomeSchema = z.enum(["recommended", "workable-with-trade-offs", "unsuitable"]);

const connectionMediumQualitySchema = z.object({
  label: nonEmptyString,
  explanation: nonEmptyString,
}).strict().readonly();

const connectionMediumSchema = z.object({
  id: connectionMediumIdSchema,
  name: nonEmptyString,
  signalLabel: nonEmptyString,
  summary: nonEmptyString,
  analogy: nonEmptyString,
  qualities: z.record(comparisonQualityIdSchema, connectionMediumQualitySchema).readonly(),
}).strict().readonly();

const choiceEvaluationSchema = z.object({
  outcome: connectionOutcomeSchema,
  decisiveRequirements: z.array(nonEmptyString).min(1, "At least one decisive requirement is required").readonly(),
  explanation: nonEmptyString,
}).strict().readonly();

const connectionScenarioSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  source: nonEmptyString,
  destination: nonEmptyString,
  distance: nonEmptyString,
  minimumBandwidth: nonEmptyString,
  latencySensitivity: z.enum(["low", "medium", "high"]),
  environment: nonEmptyString,
  mobilityRequired: z.boolean(),
  reliabilityPriority: z.enum(["standard", "high"]),
  budget: z.enum(["low", "medium", "high"]),
  recommendedMediumId: connectionMediumIdSchema,
  evaluations: z.record(connectionMediumIdSchema, choiceEvaluationSchema).readonly(),
}).strict().readonly();

const requiredMediumIds: readonly ConnectionMediumId[] = ["copper", "fibre", "wireless"];

const connectionMediaCatalogSchema = z.object({
  media: z.array(connectionMediumSchema).min(3, "Exactly three media are required").readonly(),
  scenarios: z.array(connectionScenarioSchema).min(1, "At least one scenario is required").readonly(),
}).strict().superRefine(({ media, scenarios }, context) => {
  const mediumIds = new Set<ConnectionMediumId>();
  media.forEach((medium, index) => {
    if (mediumIds.has(medium.id)) {
      context.addIssue({
        code: "custom",
        path: ["media", index, "id"],
        message: `Duplicate medium ID: ${medium.id}`,
      });
    }
    mediumIds.add(medium.id);
  });

  if (media.length !== requiredMediumIds.length || requiredMediumIds.some((id) => !mediumIds.has(id))) {
    context.addIssue({
      code: "custom",
      path: ["media"],
      message: "Exactly the three approved media (copper, fibre, and wireless) are required",
    });
  }

  const scenarioIds = new Set<string>();
  scenarios.forEach((scenario, scenarioIndex) => {
    if (scenarioIds.has(scenario.id)) {
      context.addIssue({
        code: "custom",
        path: ["scenarios", scenarioIndex, "id"],
        message: `Duplicate scenario ID: ${scenario.id}`,
      });
    }
    scenarioIds.add(scenario.id);

    const recommendedIds = requiredMediumIds.filter(
      (mediumId) => scenario.evaluations[mediumId].outcome === "recommended",
    );
    if (recommendedIds.length !== 1) {
      context.addIssue({
        code: "custom",
        path: ["scenarios", scenarioIndex, "evaluations"],
        message: "Each scenario must have exactly one recommended evaluation",
      });
    }
    if (recommendedIds[0] !== scenario.recommendedMediumId) {
      context.addIssue({
        code: "custom",
        path: ["scenarios", scenarioIndex, "recommendedMediumId"],
        message: `Recommended medium ${scenario.recommendedMediumId} must match its recommended evaluation`,
      });
    }
  });
}).readonly();

export function parseConnectionMediaCatalog(input: unknown): ConnectionMediaCatalog {
  return connectionMediaCatalogSchema.parse(input);
}

export function safeParseConnectionMediaCatalog(input: unknown) {
  return connectionMediaCatalogSchema.safeParse(input);
}
