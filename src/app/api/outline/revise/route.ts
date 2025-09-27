// src/app/api/outline/revise/route.ts
export const runtime = "edge";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { outline, instructions, mode, voice } = await req.json();
  if (!outline || !String(instructions || "").trim()) {
    return new Response("Outline + instructions required", { status: 400 });
  }

  const sys = [
    "You are a precise story-outline editor.",
    "Apply the user's instructions to the current outline.",
    "Return exactly 6 numbered beats (1–6), each 1–3 lines.",
    "Keep any beats the user asked to preserve."
  ].join("\n");

  const user = `
Current outline:
${outline}

Instructions from user:
${instructions}

Mode: ${mode}
Voice guidance: ${voice?.summary || "confident, introspective"}

Return ONLY the revised outline text (no preface).
`;

  const r = await fetch(`${process.env.OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://your-domain.vercel.app",
      "X-Title": "Story Studio - Revise Outline",
    },
    body: JSON.stringify({
      model: "x-ai/grok-4-fast:free",   // free model
      temperature: 0.4,                 // deterministic edits
      max_tokens: 500,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user }
      ]
    })
  });

  if (!r.ok) return new Response(await r.text(), { status: r.status });
  const data = await r.json();
  const text = data.choices?.[0]?.message?.content?.trim() || "No revision.";
  return new Response(text, { headers: { "Content-Type": "text/plain" } });
}
