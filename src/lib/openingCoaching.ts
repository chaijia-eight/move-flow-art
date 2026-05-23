import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CoachingGoals {
  summary?: string;
  keyIdeas?: string[];
  keySquares?: string[];
  typicalPlans?: string[];
}

export interface CoachingDeviation {
  aimFor?: string;
  generalPrinciples?: string[];
}

export interface CoachingMovePurposeEntry {
  san: string;
  short: string;
}

export interface OpeningCoaching {
  goals: CoachingGoals;
  move_purposes: Record<string, CoachingMovePurposeEntry>;
  deviation_hints: CoachingDeviation;
  source: "ai" | "dev";
}

interface FetchArgs {
  openingId: string;
  variationId: string;
  lineIndex: number;
  openingName: string;
  variationName?: string;
  playerSide: "w" | "b";
  moves: string[];
  enabled?: boolean;
}

/**
 * Fetch existing coaching from DB, or trigger AI generation via the edge function
 * and cache it. Returns null while loading / on failure.
 */
export function useOpeningCoaching(args: FetchArgs) {
  const enabled =
    (args.enabled ?? true) &&
    !!args.openingId &&
    !!args.variationId &&
    Array.isArray(args.moves) &&
    args.moves.length > 0;

  return useQuery<OpeningCoaching | null>({
    queryKey: [
      "opening-coaching",
      args.openingId,
      args.variationId,
      args.lineIndex,
      args.moves.length,
    ],
    enabled,
    staleTime: Infinity,
    queryFn: async () => {
      // 1. Try cache
      const { data: cached } = await supabase
        .from("opening_coaching")
        .select("goals, move_purposes, deviation_hints, source")
        .eq("opening_id", args.openingId)
        .eq("variation_id", args.variationId)
        .eq("line_index", args.lineIndex)
        .maybeSingle();
      if (cached) return cached as unknown as OpeningCoaching;

      // 2. Generate via edge function
      const { data, error } = await supabase.functions.invoke(
        "generate-opening-coaching",
        {
          body: {
            opening_id: args.openingId,
            variation_id: args.variationId,
            line_index: args.lineIndex,
            opening_name: args.openingName,
            variation_name: args.variationName,
            player_side: args.playerSide,
            moves: args.moves,
          },
        },
      );
      if (error) {
        console.warn("[openingCoaching] generation failed", error);
        return null;
      }
      return (data ?? null) as OpeningCoaching | null;
    },
  });
}