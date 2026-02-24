import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { budget, occasion, style, wristSize, gender, brandOpenness, movementType } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const systemPrompt = `You are an expert watch advisor and horologist. Given a person's preferences, pick exactly 4 watches as a JSON array. The first 3 are main picks. The 4th is a "hidden gem" — a lesser-known but excellent alternative.

Each watch object must have these exact fields:
- "name": full model name (e.g. "Seiko Presage SPB167")
- "brand": brand name
- "price_range": price range string (e.g. "$400–$500")
- "case_size": case diameter in mm (e.g. "40.8mm")
- "reason": 2 sentences explaining why this watch matches the user's preferences
- "chrono24_url": "https://www.chrono24.com/search/index.htm?query=" + URL-encoded watch name
- "amazon_url": "https://www.amazon.com/s?k=" + URL-encoded watch name

Return ONLY the JSON array, no markdown, no explanation, no code fences.`;

    const userMessage = `Budget: ${budget}
Occasion: ${occasion}
Style preference: ${style}
Wrist size: ${wristSize}
Gender preference: ${gender}
Brand openness: ${brandOpenness}
Movement type: ${movementType || "No preference"}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("OpenAI API error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to generate picks" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    let watches;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      watches = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      console.error("Failed to parse watches JSON:", content);
      watches = [];
    }

    return new Response(JSON.stringify({ watches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pick-watches error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
