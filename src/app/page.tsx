// src/app/studio/page.tsx
"use client";

import { useState } from "react";
import RichEditor from "@/components/RichEditor";


export default function StoryStudio() {
  const [mode, setMode] = useState<"Memory Lane" | "Dreamscape" | "Biography">("Memory Lane");
  const [voice, setVoice] = useState({ summary: "" });
  const [theme, setTheme] = useState("");
  const [outline, setOutline] = useState<string>(""); // HTML string
  const [preview, setPreview] = useState(true);
  const [history, setHistory] = useState<string[]>([]); // stack of previous outlines (HTML)
  const [reviseNote, setReviseNote] = useState("");
  const [busy, setBusy] = useState(false);

  // convert LLM plain text to simple HTML paragraphs
  function llmTextToHtml(text: string) {
    const noBold = text.replace(/\*\*(.*?)\*\*/g, "$1"); // strip **bold**
    return noBold
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => `<p>${escapeHtml(s)}</p>`)
      .join("");
  }

  // convert current rich-text HTML to plain text (for API calls)
  function htmlToPlainText(html: string) {
    const withBreaks = html
      .replace(/<\/li>\s*/gi, "\n")
      .replace(/<\/p>\s*/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n");
    return withBreaks.replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
  }
  function stripMarkdownBold(text: string) {
    return text.replace(/\*\*(.*?)\*\*/g, "$1");
  }

  const createOutline = async () => {
    const r = await fetch("/api/outline", { method: "POST", body: JSON.stringify({ theme, mode, voice }) });
    const text = await r.text();
    const cleaned = stripMarkdownBold(text)
      .split("\n")
      .map((ln) => ln.trim())
      .filter(Boolean)
      .map((ln) => `<p>${escapeHtml(ln)}</p>`)
      .join("");
    setOutline(cleaned);
    setPreview(true);
  };
  async function reviseOutline() {
    const note = reviseNote.trim();
    if (!note || !outline) return;
    setBusy(true);
    try {
      // snapshot BEFORE revising (for Undo)
      setHistory(h => [...h, outline]);

      // send plain text outline to API
      const plain = htmlToPlainText(outline);
      const r = await fetch("/api/outline/revise", {
        method: "POST",
        body: JSON.stringify({
          outline: plain,
          instructions: note,
          mode,
          voice,
        }),
      });

      const text = await r.text();
      const html = llmTextToHtml(text);
      setOutline(html);
      setPreview(true);      // stay in Preview
      setReviseNote("");
    } catch (e) {
      // request failed → pop snapshot
      setHistory(h => h.slice(0, -1));
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  function undo() {
    setHistory(h => {
      const last = h[h.length - 1];
      if (!last) return h;
      setOutline(last);
      setPreview(true);
      return h.slice(0, -1);
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-semibold">Story Studio</h1>

      {/* Mode */}
      <section className="space-y-2">
        <label className="font-medium">Mode</label>
        <select className="border rounded p-2 bg-white text-black" value={mode} onChange={(e) => setMode(e.target.value as any)}>
          <option>Memory Lane</option>
          <option>Dreamscape</option>
          <option>Biography</option>
        </select>
      </section>

      {/* Voice */}
      <section className="space-y-2">
        <label className="font-medium">Your voice (1–2 lines)</label>
        <textarea
          className="w-full border rounded p-2 bg-white text-black"
          value={voice.summary}
          onChange={(e) => setVoice({ summary: e.target.value })}
          placeholder="candid, wry humor, hopeful undercurrent"
        />
      </section>

      {/* Theme */}
      <section className="space-y-2">
        <label className="font-medium">Theme / prompt</label>
        <textarea
          className="w-full border rounded p-2 bg-white text-black"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="villain arc of a hero shunned by humanity"
        />
        <button className="rounded px-4 py-2 bg-black text-white" onClick={createOutline}>
          Create Outline
        </button>
      </section>

      {/* Outline Editor */}
      {outline && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Outline</h2>

          {/* Preview OR Editor */}
          {preview ? (
            <div
              className="border rounded p-3 bg-white text-black prose max-w-none"
              dangerouslySetInnerHTML={{ __html: outline }}
            />
          ) : (
            <RichEditor html={outline} onChange={setOutline} />
          )}

          {/* Action row (Edit lives here with others) */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="px-3 py-1.5 border rounded bg-white text-black"
              onClick={() => setPreview(p => !p)}
            >
              {preview ? "Edit" : "Preview"}
            </button>

            {/* Revise controls */}
            <div className="flex-1 flex gap-2">
              <input
                className="flex-1 px-3 py-1.5 border rounded bg-white text-black"
                placeholder='e.g., "Tighten beat 3, darker climax, keep 1–2 same."'
                value={reviseNote}
                onChange={(e) => setReviseNote(e.target.value)}
              />
              <button
                disabled={busy || !reviseNote.trim()}
                onClick={reviseOutline}
                className={`px-3 py-1.5 rounded text-white ${busy ? "bg-gray-500" : "bg-indigo-600 hover:bg-indigo-700"}`}
              >
                {busy ? "Revising…" : "Revise"}
              </button>
            </div>

            <button
              disabled={history.length === 0}
              onClick={undo}
              className="px-3 py-1.5 border rounded bg-white text-black disabled:opacity-60"
            >
              Undo
            </button>

            <button className="px-3 py-1.5 rounded bg-black text-white" disabled>
              Generate Story (next phase)
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
