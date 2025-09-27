// src/app/api/outline/route.ts
export const runtime = "edge";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { theme, mode, voice } = await req.json();
  if (!theme || !String(theme).trim()) {
    return new Response("Theme required", { status: 400 });
  }

  const sys =
    "You produce tight, usable short-story outlines: exactly 6 numbered beats; 1–3 lines each.";
  const user = `
Create a concise 6-beat outline.

Theme: ${theme}
Mode: ${mode}
Voice guidance: ${voice?.summary || "confident, introspective"}

Include beats 1) Hook 2) Setup 3) Complication 4) Escalation 5) Climax 6) Resolution.
Return ONLY the outline text.
`;

  const r = await fetch(`${process.env.OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://your-domain.vercel.app",
      "X-Title": "Story Studio - Create Outline",
    },
    body: JSON.stringify({
      // ⬇️ use the free Grok model
      model: "x-ai/grok-4-fast:free",
      // keep outputs small to stay within free limits
      max_tokens: 400,
      temperature: 0.6,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
  });

  if (!r.ok) return new Response(await r.text(), { status: r.status });
  const data = await r.json();
  const text = data.choices?.[0]?.message?.content?.trim() || "No outline.";
  return new Response(text, { headers: { "Content-Type": "text/plain" } });
}
