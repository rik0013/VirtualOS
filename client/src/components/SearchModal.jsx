import React, { useState, useEffect, useRef } from "react";
import { getNode, fuzzyMatch } from "../utils/fs";
import { DOCK_APPS } from "./Dock";

export function SearchModal({ fs, onClose, onOpenApp, onOpenFile }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);

  const appResults = DOCK_APPS.filter((a) => fuzzyMatch(a.label, query));
  const fileResults = [];
  const walk = (node, path) => {
    if (typeof node !== "object") return;
    Object.keys(node).forEach((key) => {
      const fp = (path === "/" ? "" : path) + "/" + key;
      if (fuzzyMatch(key, query)) fileResults.push({ name: key, path: fp, isDir: typeof node[key] === "object" });
      if (typeof node[key] === "object") walk(node[key], fp);
    });
  };
  if (query.length > 0) walk(fs, "/");
  const hasResults = appResults.length > 0 || fileResults.length > 0;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 100, backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 520, background: "var(--bg-context)", border: "1px solid var(--border-strong)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)", animation: "slideUp 0.18s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: query ? "1px solid var(--border)" : "none" }}>
          <span style={{ fontSize: 16 }}>"</span>
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search apps and files..."
            style={{ flex: 1, fontSize: 16, color: "var(--text-primary)", background: "none" }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)", padding: "2px 6px", border: "1px solid var(--border)", borderRadius: 4 }}>Esc</span>
        </div>
        {query && (
          <div style={{ maxHeight: 360, overflowY: "auto", padding: "8px 0" }}>
            {!hasResults && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No results for "{query}"</div>}
            {appResults.length > 0 && <>
              <div style={{ padding: "4px 18px 6px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Apps</div>
              {appResults.map((a) => (
                <button key={a.id} onClick={() => { onOpenApp(a.id); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "8px 18px", background: "transparent", textAlign: "left" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{a.label}</span>
                </button>
              ))}
            </>}
            {fileResults.length > 0 && <>
              <div style={{ padding: "4px 18px 6px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Files</div>
              {fileResults.slice(0, 8).map((f) => (
                <button key={f.path} onClick={() => { if (!f.isDir) { onOpenFile(f.path, getNode(fs, f.path), f.name); } onClose(); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "8px 18px", background: "transparent", textAlign: "left" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontSize: 16 }}>{f.isDir ? "📁" : "📝"}</span>
                  <div><div style={{ fontSize: 13, color: "var(--text-primary)" }}>{f.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.path}</div></div>
                </button>
              ))}
            </>}
          </div>
        )}
      </div>
    </div>
  );
}