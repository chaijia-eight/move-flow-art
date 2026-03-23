const FOCUS_KEY = "chess-app-focus";

export function getFocusedOpenings(): string[] {
  try {
    const raw = localStorage.getItem(FOCUS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFocus(openingId: string): string[] {
  const current = getFocusedOpenings();
  const next = current.includes(openingId)
    ? current.filter((id) => id !== openingId)
    : [...current, openingId];
  localStorage.setItem(FOCUS_KEY, JSON.stringify(next));
  return next;
}

export function isFocused(openingId: string): boolean {
  return getFocusedOpenings().includes(openingId);
}
