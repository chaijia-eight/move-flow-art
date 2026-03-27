import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LineOverride {
  line_id: string;
  moves: string[] | null;
  crucial_moment_index: number | null;
  conclusion_text: string | null;
}

// Cache overrides in memory to avoid re-fetching
let cachedOverrides: Record<string, LineOverride> = {};
let cacheLoaded = false;

export function useLineOverrides() {
  const [overrides, setOverrides] = useState<Record<string, LineOverride>>(cachedOverrides);
  const [loading, setLoading] = useState(!cacheLoaded);

  useEffect(() => {
    if (cacheLoaded) return;
    loadOverrides();
  }, []);

  const loadOverrides = async () => {
    const { data } = await supabase
      .from("line_overrides")
      .select("line_id, moves, crucial_moment_index, conclusion_text");
    if (data) {
      const map: Record<string, LineOverride> = {};
      for (const row of data) {
        map[row.line_id] = row as LineOverride;
      }
      cachedOverrides = map;
      cacheLoaded = true;
      setOverrides(map);
    }
    setLoading(false);
  };

  const saveOverride = useCallback(async (override: LineOverride) => {
    const { error } = await supabase
      .from("line_overrides")
      .upsert({
        line_id: override.line_id,
        moves: override.moves,
        crucial_moment_index: override.crucial_moment_index,
        conclusion_text: override.conclusion_text,
        updated_at: new Date().toISOString(),
      }, { onConflict: "line_id" });

    if (!error) {
      cachedOverrides[override.line_id] = override;
      setOverrides({ ...cachedOverrides });
    }
    return { error };
  }, []);

  const deleteOverride = useCallback(async (lineId: string) => {
    const { error } = await supabase
      .from("line_overrides")
      .delete()
      .eq("line_id", lineId);

    if (!error) {
      delete cachedOverrides[lineId];
      setOverrides({ ...cachedOverrides });
    }
    return { error };
  }, []);

  return { overrides, loading, saveOverride, deleteOverride, reload: loadOverrides };
}

export function getOverride(lineId: string): LineOverride | undefined {
  return cachedOverrides[lineId];
}

export function invalidateCache() {
  cacheLoaded = false;
  cachedOverrides = {};
}
