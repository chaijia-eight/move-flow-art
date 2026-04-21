import { useState, useCallback } from "react";

// NOTE: line_overrides table was dropped during the Smart Feed pivot.
// This hook is kept as a no-op stub so legacy components compile.
// It will be deleted in Phase 2 along with the pages that use it.
export interface LineOverride {
  line_id: string;
  moves: string[] | null;
  crucial_moment_index: number | null;
  conclusion_text: string | null;
}

const cachedOverrides: Record<string, LineOverride> = {};

export function useLineOverrides() {
  const [overrides] = useState<Record<string, LineOverride>>(cachedOverrides);
  const saveOverride = useCallback(async (_o: LineOverride) => ({ error: null as null }), []);
  const deleteOverride = useCallback(async (_id: string) => ({ error: null as null }), []);
  const reload = useCallback(async () => {}, []);
  return { overrides, loading: false, saveOverride, deleteOverride, reload };
}

export function getOverride(lineId: string): LineOverride | undefined {
  return cachedOverrides[lineId];
}

export function invalidateCache() {
  for (const k of Object.keys(cachedOverrides)) delete cachedOverrides[k];
}
