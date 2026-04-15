import type {
  CharacterStage,
  ProgressSnapshot,
  ProgressTotals,
} from "@/src/types/progress";

type StageRequirement = {
  level: number;
  requiredCompletions: number;
  requiredFocusMinutes: number;
};

export const CHARACTER_STAGE_REQUIREMENTS: StageRequirement[] = [
  { level: 1, requiredCompletions: 0, requiredFocusMinutes: 0 },
  { level: 2, requiredCompletions: 2, requiredFocusMinutes: 50 },
  { level: 3, requiredCompletions: 6, requiredFocusMinutes: 150 },
  { level: 4, requiredCompletions: 12, requiredFocusMinutes: 300 },
  { level: 5, requiredCompletions: 40, requiredFocusMinutes: 1000 },
  { level: 6, requiredCompletions: 60, requiredFocusMinutes: 1500 },
  { level: 7, requiredCompletions: 84, requiredFocusMinutes: 2100 },
  { level: 8, requiredCompletions: 112, requiredFocusMinutes: 2800 },
  { level: 9, requiredCompletions: 144, requiredFocusMinutes: 3600 },
  { level: 10, requiredCompletions: 180, requiredFocusMinutes: 4500 },
];

export const EMPTY_PROGRESS_TOTALS: ProgressTotals = {
  totalFocusCompletions: 0,
  totalFocusMinutes: 0,
};

const normalizeBaseUrl = (baseUrl: string | undefined) => {
  const trimmed = baseUrl?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
};

export const getCharacterImageUrl = (
  level: number,
  baseUrl = process.env.CHARACTER_CDN_BASE_URL,
) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  if (!normalizedBaseUrl) {
    return null;
  }

  return `${normalizedBaseUrl}/step${level}.png`;
};

const toCharacterStage = (
  requirement: StageRequirement,
): CharacterStage => ({
  ...requirement,
  characterImageUrl: getCharacterImageUrl(requirement.level),
});

export const getCurrentCharacterStage = (
  totals: ProgressTotals,
): CharacterStage => {
  let current = CHARACTER_STAGE_REQUIREMENTS[0];

  for (const requirement of CHARACTER_STAGE_REQUIREMENTS) {
    if (
      totals.totalFocusCompletions >= requirement.requiredCompletions &&
      totals.totalFocusMinutes >= requirement.requiredFocusMinutes
    ) {
      current = requirement;
      continue;
    }

    break;
  }

  return toCharacterStage(current);
};

export const getNextCharacterStage = (
  currentLevel: number,
): CharacterStage | null => {
  const nextRequirement = CHARACTER_STAGE_REQUIREMENTS.find(
    (requirement) => requirement.level === currentLevel + 1,
  );

  return nextRequirement ? toCharacterStage(nextRequirement) : null;
};

export const buildProgressSnapshot = (
  totals: ProgressTotals,
): ProgressSnapshot => {
  const stage = getCurrentCharacterStage(totals);

  return {
    totals,
    stage,
    nextStage: getNextCharacterStage(stage.level),
  };
};
