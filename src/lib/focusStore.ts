import { supabase } from "@/integrations/supabase/client";

const FOCUS_KEY = "chess-app-focus";

function loadLocal(): string[] {
  try {
    const raw = localStorage.getItem(FOCUS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(ids: string[]) {
  localStorage.setItem(FOCUS_KEY, JSON.stringify(ids));
  syncToCloud(ids);
}

export function replaceFocusData(ids: string[]) {
  localStorage.setItem(FOCUS_KEY, JSON.stringify(ids));
}

export function getFocusedOpenings(): string[] {
  return loadLocal();
}

export function toggleFocus(openingId: string): string[] {
  const current = loadLocal();
  const next = current.includes(openingId)
    ? current.filter((id) => id !== openingId)
    : [...current, openingId];
  saveLocal(next);
  return next;
}

export function isFocused(openingId: string): boolean {
  return loadLocal().includes(openingId);
}

// --- Cloud sync ---

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function syncToCloud(ids: string[]) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_focus").upsert({
      user_id: user.id,
      data: ids as any,
      updated_at: new Date().toISOString(),
    });
  }, 1000);
}

/** Pull from cloud, merge with local, save both. Call on login. */
export async function syncFocusFromCloud(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: row } = await supabase
    .from("user_focus")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle();

  const local = loadLocal();
  const cloud = (row?.data as string[]) || [];
  // Union merge
  const merged = [...new Set([...local, ...cloud])];

  replaceFocusData(merged);
  await supabase.from("user_focus").upsert({
    user_id: user.id,
    data: merged as any,
    updated_at: new Date().toISOString(),
  });
}
