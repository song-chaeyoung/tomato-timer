export type ProgressTotals = {
  totalFocusCompletions: number;
  totalFocusMinutes: number;
};

export type CharacterStage = {
  level: number;
  requiredCompletions: number;
  requiredFocusMinutes: number;
  characterImageUrl: string | null;
};

export type ProgressSnapshot = {
  totals: ProgressTotals;
  stage: CharacterStage;
  nextStage: CharacterStage | null;
};

export type CompletionRequestPayload = {
  completedAt: string;
  focusSeconds: number;
  focusMinutes: number;
};

export type CompletionResponse = ProgressSnapshot & {
  leveledUp: boolean;
};
