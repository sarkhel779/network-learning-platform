export type LabDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type LabScenario = {
  slug: string;
  title: string;
  summary: string;
  difficulty: LabDifficulty;
  estimatedMinutes: number;
};

export type LabTopic = {
  slug: string;
  title: string;
  description: string;
  scenarios: LabScenario[];
};
