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
    
    // Support both old format (prompt) and new wintrchess format (systemPrompt + userPrompt)
    const systemPrompt = body.systemPrompt || `You are a chess coach speaking directly to your student. Use "I" for your moves and "you" for the student's moves. NEVER say "White" or "Black". Be concise (2-3 sentences). Never invent facts. Be casual and encouraging.`;
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
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 250,
        temperature: 0.7,
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
    const explanation =
      data?.choices?.[0]?.message?.content?.trim() || rawFacts || "Move played.";

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
