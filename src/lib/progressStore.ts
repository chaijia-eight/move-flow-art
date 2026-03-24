import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "chess-line-progress";

export interface LineProgress {
  attempts: number;
  correctAttempts: number; // completed without mistakes
  mastered: boolean;
  lastAttemptAt?: number;
}

type ProgressData = Record<string, LineProgress>;

// In-memory cache to avoid repeated localStorage reads
let cache: ProgressData | null = null;

function load(): ProgressData {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : {};
    return cache!;
  } catch {
    cache = {};
    return cache;
  }
}

function save(data: ProgressData) {
  cache = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Fire-and-forget cloud sync
  syncToCloud(data);
}

/** Replace local data entirely (used during cloud sync) */
export function replaceProgressData(data: ProgressData) {
  cache = data;
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
  if (idx <= 0) return true;
  const prevProgress = getLineProgress(allLineIds[idx - 1]);
  return prevProgress.correctAttempts >= 1;
}

export function getOpeningProgress(lineIds: string[]): number {
  if (lineIds.length === 0) return 0;
  const masteredCount = lineIds.filter((id) => getLineProgress(id).mastered).length;
  return masteredCount / lineIds.length;
}

export function getMasteredLines(): string[] {
  const data = load();
  return Object.entries(data)
    .filter(([, p]) => p.mastered)
    .map(([id]) => id);
}

export const MASTERY_PROMPT_THRESHOLD = 3;

// --- Cloud sync helpers ---

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

async function syncToCloud(data: ProgressData) {
  // Debounce writes to avoid spamming the DB
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_progress").upsert({
      user_id: user.id,
      data: data as any,
      updated_at: new Date().toISOString(),
    });
  }, 1000);
}

/** Merge cloud data with local data, keeping the "better" progress for each line */
function mergeProgress(local: ProgressData, cloud: ProgressData): ProgressData {
  const merged = { ...cloud };
  for (const [id, lp] of Object.entries(local)) {
    const cp = merged[id];
    if (!cp) {
      merged[id] = lp;
    } else {
      // Keep the one with more attempts or mastered status
      merged[id] = {
        attempts: Math.max(cp.attempts, lp.attempts),
        correctAttempts: Math.max(cp.correctAttempts, lp.correctAttempts),
        mastered: cp.mastered || lp.mastered,
        lastAttemptAt: Math.max(cp.lastAttemptAt || 0, lp.lastAttemptAt || 0) || undefined,
      };
    }
  }
  return merged;
}

/** Pull from cloud, merge with local, save both. Call on login. */
export async function syncProgressFromCloud(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: row } = await supabase
    .from("user_progress")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle();

  const local = load();
  const cloud = (row?.data as ProgressData) || {};
  const merged = mergeProgress(local, cloud);

  // Save merged data locally and to cloud
  replaceProgressData(merged);
  await supabase.from("user_progress").upsert({
    user_id: user.id,
    data: merged as any,
    updated_at: new Date().toISOString(),
  });
}
