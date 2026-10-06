import type { ReactNode } from "react";

export type HopDevice = {
  id: string;
  label: string;
  sublabel?: string;
  icon: ReactNode;
};

export type HopField = { label: string; value: string };

export type HopStep = {
  fromId: string;
  toId: string | null;
  title: string;
  explanation: string;
  fields: HopField[];
  outcome?: "delivered" | "blocked";
};

export type HopQuizOption = { id: string; label: string };

export type HopQuiz = {
  question: string;
  options: HopQuizOption[];
  correctId: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
};

export type HopScenarioData = {
  devices: HopDevice[];
  steps: HopStep[];
  quiz: HopQuiz;
  topologyAriaLabel: string;
};
