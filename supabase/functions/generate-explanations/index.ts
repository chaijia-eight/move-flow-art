import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { openingName, variationName, lineName, moves, playerSide } = await req.json();

    if (!moves || !Array.isArray(moves) || moves.length === 0) {
      return new Response(JSON.stringify({ error: "moves array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a move list string like "1.e4 e5 2.Nf3 Nc6 ..."
    let moveStr = "";
    for (let i = 0; i < moves.length; i++) {
      if (i % 2 === 0) moveStr += `${Math.floor(i / 2) + 1}.`;
      moveStr += moves[i] + " ";
    }

    const sideText = playerSide === "w" ? "White" : "Black";
    
    const prompt = `You are a friendly chess coach explaining an opening line move by move to a beginner/intermediate player who is learning it.

Opening: ${openingName}
Variation: ${variationName || lineName}
The student plays as: ${sideText}
Moves: ${moveStr.trim()}

For EACH move in the sequence, write a brief, conversational explanation (1-2 sentences max). Explain:
- For the student's moves: what the move achieves, why it's good, what it aims for
- For the opponent's moves: what the opponent is trying to do, what the student should notice

Style guidelines:
- Be conversational and encouraging, like a friendly coach
- Use "we" for the student's side, "they" or "opponent" for the other side
- Reference specific squares and pieces naturally
- Point out tactical ideas, threats, and strategic goals
- Make it feel like a guided lesson, not a textbook

Return a JSON array of strings, one explanation per move, in the same order as the moves. Return ONLY the JSON array, no other text.

Example format:
["We start with the King's pawn to e4, controlling the center and opening lines for our bishop and queen.", "They respond symmetrically with e5, also fighting for the center.", ...]`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.content || "";
    
    // Extract JSON array from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON array");
    }

    const explanations = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(explanations) || explanations.length !== moves.length) {
      throw new Error(`Expected ${moves.length} explanations, got ${Array.isArray(explanations) ? explanations.length : 'non-array'}`);
    }

    return new Response(JSON.stringify({ explanations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
