import { corsHeaders } from "@anthropic-ai/sdk/dist/esm/_shims/index.js";

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

    const { prompt, rawFacts } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a chess coach speaking directly to your student. You MUST follow these rules strictly:

1. When explaining YOUR moves (first person), use "I" — e.g. "I'm developing my knight to control the center."
2. When explaining the STUDENT's moves (second person), use "you" — e.g. "Nice, you took the center!"
3. NEVER say "White", "Black", "the player", or "the opponent". Only "I" and "you".
4. Be concise: 2-3 sentences maximum.
5. Do NOT invent any chess facts not provided in the observations. Only use what is given.
6. Do NOT include any formatting (no markdown, no bullet points).
7. Be casual, encouraging, and coach-like. Sound like a friendly mentor, not a textbook.
8. When the student makes a good move, acknowledge it warmly. When they make a questionable move, gently explain why.
9. Focus on the most important observation first.`;

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
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", errText);
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
