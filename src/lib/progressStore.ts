const STORAGE_KEY = "chess-line-progress";

export interface LineProgress {
  attempts: number;
  correctAttempts: number; // completed without mistakes
  mastered: boolean;
  lastAttemptAt?: number;
}

type ProgressData = Record<string, LineProgress>;

function load(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data: ProgressData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getLineProgress(lineId: string): LineProgress {
  const data = load();
  return data[lineId] || { attempts: 0, correctAttempts: 0, mastered: false };
}

export function recordAttempt(lineId: string, wasCorrect: boolean): LineProgress {
  const data = load();
  const prev = data[lineId] || { attempts: 0, correctAttempts: 0, mastered: false };
  const updated: LineProgress = {
    ...prev,
    attempts: prev.attempts + 1,
    correctAttempts: prev.correctAttempts + (wasCorrect ? 1 : 0),
    lastAttemptAt: Date.now(),
  };
  data[lineId] = updated;
  save(data);
  return updated;
}

export function markMastered(lineId: string, mastered: boolean): LineProgress {
  const data = load();
  const prev = data[lineId] || { attempts: 0, correctAttempts: 0, mastered: false };
  const updated = { ...prev, mastered };
  data[lineId] = updated;
  save(data);
  return updated;
}

export function isLineUnlocked(lineId: string, allLineIds: string[]): boolean {
  const idx = allLineIds.indexOf(lineId);
  if (idx <= 0) return true; // first line always unlocked
  // Previous line must have at least 1 correct attempt
  const prevProgress = getLineProgress(allLineIds[idx - 1]);
  return prevProgress.correctAttempts >= 1;
}

/** Calculate mastery progress for an opening (0-1) */
export function getOpeningProgress(lineIds: string[]): number {
  if (lineIds.length === 0) return 0;
  const masteredCount = lineIds.filter((id) => getLineProgress(id).mastered).length;
  return masteredCount / lineIds.length;
}

/** Get all mastered line IDs */
export function getMasteredLines(): string[] {
  const data = load();
  return Object.entries(data)
    .filter(([, p]) => p.mastered)
    .map(([id]) => id);
}

/** Threshold for prompting mastery question */
export const MASTERY_PROMPT_THRESHOLD = 3;
