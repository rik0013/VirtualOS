import React, { useState, useRef } from "react";
import { setNode } from "../utils/fs";

export function TextEditor({ initialPath, initialContent, fs, setFs, notify, onCopy }) {
  const [content, setContent] = useState(initialContent || "");
  const [path] = useState(initialPath || "");
  const [saved, setSaved] = useState(true);
  const [selectionCopied, setSelectionCopied] = useState(false);
  const textareaRef = useRef(null);

  const save = () => {
    if (!path) return;
    setFs(setNode(fs, path, content));
    setSaved(true);
    notify({ icon: "💾", title: "Saved", message: path.split("/").pop() });
  };

  const copySelection = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const sel = ta.value.substring(ta.selectionStart, ta.selectionEnd);
    const textToCopy = sel || content;
    onCopy(textToCopy);
    setSelectionCopied(true);
    setTimeout(() => setSelectionCopied(false), 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-window)" }}>
      <div style={{ padding: "6px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{path || "Untitled"}{!saved ? " •" : ""}</span>
        <button onClick={copySelection} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "var(--bg-input)", border: "1px solid var(--border)", color: selectionCopied ? "var(--accent-green)" : "var(--text-secondary)" }}>
          {selectionCopied ? "✅ Copied" : "Copy"}
        </button>
        <button onClick={save} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, background: "var(--accent)", color: "#fff", fontWeight: 600 }}>Save</button>
      </div>
      <textarea ref={textareaRef} value={content} onChange={(e) => { setContent(e.target.value); setSaved(false); }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(); }
          if ((e.ctrlKey || e.metaKey) && e.key === "c") {
            const ta = textareaRef.current;
            if (ta) { const sel = ta.value.substring(ta.selectionStart, ta.selectionEnd); if (sel) onCopy(sel); }
          }
        }}
        style={{ flex: 1, resize: "none", background: "var(--bg-window)", color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: 16, lineHeight: 1.7, border: "none", outline: "none", userSelect: "text" }} />
      <div style={{ padding: "4px 14px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>
        Ctrl+S save · Ctrl+C copy selection · or use Copy button above
      </div>
    </div>
  );
}