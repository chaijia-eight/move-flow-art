import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  opening_id: string;
  variation_id: string;
  line_index: number;
  opening_name: string;
  variation_name?: string;
  player_side: "w" | "b";
  moves: string[]; // SAN sequence
}

const SYSTEM = `You are a chess opening coach. Given an opening line, return a concise strategic briefing that helps a club-level player understand the POINT of the opening — not just the moves.

You must respond by calling the provided tool exactly once. Be specific and concrete. Use real squares (e.g. f7, d5). Keep each item short.`;

const TOOL_SCHEMA = {
  type: "function",
  function: {
    name: "submit_coaching",
    description: "Submit structured strategic coaching for an opening line.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        goals: {
          type: "object",
          additionalProperties: false,
          properties: {
            summary: {
              type: "string",
              description: "One sentence describing the big-picture point of this opening for the player's side.",
            },
            keyIdeas: {
              type: "array",
              minItems: 2,
              maxItems: 4,
              items: { type: "string" },
              description: "2–4 bullet 'key ideas' — short, concrete strategic objectives.",
            },
            keySquares: {
              type: "array",
              minItems: 0,
              maxItems: 5,
              items: { type: "string" },
              description: "Important squares (e.g. ['e5','f7','d5']).",
            },
            typicalPlans: {
              type: "array",
              minItems: 1,
              maxItems: 3,
              items: { type: "string" },
              description: "1–3 short typical plans for the player's side.",
            },
          },
          required: ["summary", "keyIdeas", "keySquares", "typicalPlans"],
        },
        move_purposes: {
          type: "array",
          description: "Per-move purpose. One entry per move in the line, in order. index is 0-based.",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              index: { type: "integer" },
              san: { type: "string" },
              short: {
                type: "string",
                description: "Very short purpose tag, e.g. 'eyes f7, prepares O-O'. ≤ 60 chars.",
              },
            },
            required: ["index", "san", "short"],
          },
        },
        deviation_hints: {
          type: "object",
          additionalProperties: false,
          properties: {
            aimFor: {
              type: "string",
              description: "One sentence: what should the player aim for when the opponent goes off book?",
            },
            generalPrinciples: {
              type: "array",
              minItems: 2,
              maxItems: 4,
              items: { type: "string" },
              description: "2–4 short principles to follow if off-book.",
            },
          },
          required: ["aimFor", "generalPrinciples"],
        },
      },
      required: ["goals", "move_purposes", "deviation_hints"],
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Body;
    if (!body?.opening_id || !body?.variation_id || typeof body.line_index !== "number" || !Array.isArray(body.moves)) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Cache check
    const { data: existing } = await supabase
      .from("opening_coaching")
      .select("*")
      .eq("opening_id", body.opening_id)
      .eq("variation_id", body.variation_id)
      .eq("line_index", body.line_index)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify(existing), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sideName = body.player_side === "w" ? "White" : "Black";
    const numberedMoves = body.moves
      .map((m, i) => {
        const isWhite = i % 2 === 0;
        const moveNo = Math.floor(i / 2) + 1;
        return isWhite ? `${moveNo}.${m}` : `${m}`;
      })
      .join(" ");

    const userPrompt = `Opening: ${body.opening_name}${body.variation_name ? ` — ${body.variation_name}` : ""}
Player side: ${sideName}
Moves (player is ${sideName}): ${numberedMoves}

Return strategic coaching via the submit_coaching tool. The player wants to understand the POINT of this opening: what they are trying to accomplish, which squares matter, and what to do if the opponent deviates from this line.

For move_purposes, include one entry per move in the sequence above (${body.moves.length} entries total), indices 0..${body.moves.length - 1}.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        tools: [TOOL_SCHEMA],
        tool_choice: { type: "function", function: { name: "submit_coaching" } },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(
        JSON.stringify({ error: "AI request failed", status: aiRes.status, detail: txt }),
        { status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ error: "No tool call in AI response", aiJson }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in AI tool call" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Normalize move_purposes into { [index]: { san, short } } map
    const movePurposesMap: Record<string, { san: string; short: string }> = {};
    for (const p of parsed.move_purposes ?? []) {
      if (typeof p?.index === "number") {
        movePurposesMap[String(p.index)] = { san: p.san ?? "", short: p.short ?? "" };
      }
    }

    const row = {
      opening_id: body.opening_id,
      variation_id: body.variation_id,
      line_index: body.line_index,
      goals: parsed.goals ?? {},
      move_purposes: movePurposesMap,
      deviation_hints: parsed.deviation_hints ?? {},
      source: "ai",
      model: "google/gemini-2.5-flash",
      generated_at: new Date().toISOString(),
    };

    const { data: inserted, error: insErr } = await supabase
      .from("opening_coaching")
      .upsert(row, { onConflict: "opening_id,variation_id,line_index" })
      .select()
      .maybeSingle();

    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(inserted ?? row), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});