export type ChallengeOption = { id: string; label: string };

export type ChallengeRound = {
  prompt: string;
  detail?: string;
  options: ChallengeOption[];
  correctId: string;
  explanation: string;
};
