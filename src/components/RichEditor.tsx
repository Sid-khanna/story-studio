// src/components/RichEditor.tsx
"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";

export default function RichEditor({
  html,
  onChange,
  placeholder = "Click to edit your outline…",
}: {
  html: string;
  onChange: (nextHtml: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      Placeholder.configure({ placeholder }),
    ],
    content: html || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[240px] bg-white text-black rounded-b p-3 outline-none prose max-w-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    // 🔧 IMPORTANT for Next.js/SSR to avoid hydration mismatch
    immediatelyRender: false,
  });

  // keep external changes in sync (e.g., when a new outline arrives)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();

    if (html && current !== html) {
      editor.commands.setContent(html, { emitUpdate: false });
    } else if (!html && current !== "<p></p>") {
      editor.commands.clearContent(false);
    }
  }, [html, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: any }) {
  const btn =
    "px-2 py-1 text-xs border rounded hover:bg-black/5 active:bg-black/10 bg-white text-black";

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
      <button
        className={btn}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        Bold
      </button>
      <button
        className={btn}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        Italic
      </button>
      <button
        className={btn}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </button>
      <button
        className={btn}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </button>
      <button
        className={btn}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </button>
      <button
        className={btn}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </button>
      <button
        className={btn}
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
      >
        Clear
      </button>
      <div className="ml-auto text-xs text-gray-500 px-2 py-1">
        Tip: select text, then click buttons.
      </div>
    </div>
  );
}
