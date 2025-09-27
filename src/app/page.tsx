// src/app/studio/page.tsx
"use client";
import { useState } from "react";

export default function StoryStudio() {
  const [mode, setMode] = useState<"Memory Lane"|"Dreamscape"|"Biography">("Memory Lane");
  const [voice, setVoice] = useState({ summary: "" });
  const [theme, setTheme] = useState("");
  const [outline, setOutline] = useState("");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-semibold">Story Studio</h1>

      <section className="space-y-2">
        <label className="font-medium">Mode</label>
        <select className="border rounded p-2" value={mode} onChange={e=>setMode(e.target.value as any)}>
          <option>Memory Lane</option><option>Dreamscape</option><option>Biography</option>
        </select>
      </section>

      <section className="space-y-2">
        <label className="font-medium">Your voice (1–2 lines)</label>
        <textarea className="w-full border rounded p-2"
          value={voice.summary}
          onChange={e=>setVoice({ summary: e.target.value })}
          placeholder="candid, wry humor, hopeful undercurrent"
        />
      </section>

      <section className="space-y-2">
        <label className="font-medium">Theme / prompt</label>
        <textarea className="w-full border rounded p-2"
          value={theme}
          onChange={e=>setTheme(e.target.value)}
          placeholder="boy listening to 'Hostage' in a spark-filled workshop"
        />
        {/* temporary: fake an outline so you see the next section */}
        <button
          className="rounded px-4 py-2 bg-black text-white"
          onClick={() => setOutline(
            `1) Hook...\n2) Setup...\n3) Complication...\n4) Escalation...\n5) Climax...\n6) Resolution...`
          )}
        >
          Create Outline (placeholder)
        </button>
      </section>

      {outline && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Outline (editable)</h2>
          <textarea
            className="w-full min-h-[220px] border rounded p-3 font-mono text-sm leading-6"
            value={outline}
            onChange={(e)=>setOutline(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <button className="rounded px-4 py-2 border">Revise (coming next)</button>
            <button className="rounded px-4 py-2 border">Undo (coming next)</button>
            <button className="rounded px-4 py-2 bg-black text-white">Generate Story (coming next)</button>
          </div>
        </section>
      )}
    </div>
  );
}
