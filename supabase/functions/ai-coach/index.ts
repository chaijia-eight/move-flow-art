const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const body = await req.json();
    
    const isPlayerMove = body.isPlayerMove === true;
    const perspectiveRules = isPlayerMove
      ? `CRITICAL PERSPECTIVE: The STUDENT just played this move. Address them as "you" / "your". Refer to yourself (the coach) as "I" only when suggesting alternatives. Examples: "You played Nf3 — solid development." / "Your knight is now hanging — I would have preferred Nc3."`
      : `CRITICAL PERSPECTIVE: I (the coach / engine) just played this move. Use "I" / "my" for this move. Address the student as "you" / "your" when referring to their position. Examples: "I played e4 to claim the center." / "My knight attacks your bishop."`;

    const systemPrompt = `You are a warm, sharp chess coach speaking directly to your student. ${perspectiveRules}

ABSOLUTE RULES (violating any of these = bad answer):
- NEVER say "White", "Black", "the player", or "the engine". Always use I / you.
- NEVER invent pieces, squares, attackers, defenders, or threats that are not explicitly stated in the "Engine observations" block. If the observations don't mention a knight on d4, there is no knight on d4. Do NOT name tactical motifs (forks, pins, hanging pieces, attackers) the engine did not list.
- If the engine observations are sparse or generic, keep the explanation short and generic too ("solid developing move", "claims the center", "trades pieces"). Do NOT fabricate concrete tactics to fill space.
- If the move is flagged as a blunder/mistake/inaccuracy, say so and quote ONLY the specific reason the engine gave. If the engine just says "this loses material" without naming the attacker, say "this loses material" — do NOT invent which piece captures back.
- If the move is strong, say why using ONLY what the observations state.
- 2-3 sentences max. Casual, direct. When in doubt, say less.`;

    const userPrompt = body.userPrompt || body.prompt;
    const rawFacts = body.rawFacts || "";

    if (!userPrompt || typeof userPrompt !== "string") {
      return new Response(
        JSON.stringify({ error: "prompt or userPrompt is required" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again later." }),
          { status: 429, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ explanation: rawFacts || "Move played." }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let explanation: string =
      data?.choices?.[0]?.message?.content?.trim() || rawFacts || "Move played.";

    // Hard scrub: if the model still leaked White/Black, swap to I/you based on isPlayerMove
    const selfWord = isPlayerMove ? "You" : "I";
    const otherWord = isPlayerMove ? "I" : "you";
    explanation = explanation
      .replace(/\bWhite\b/g, isPlayerMove && body.playerColor === "w" ? selfWord : (body.playerColor === "w" ? selfWord : otherWord))
      .replace(/\bBlack\b/g, isPlayerMove && body.playerColor === "b" ? selfWord : (body.playerColor === "b" ? selfWord : otherWord));

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Coach error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate explanation" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
