import React, { useState, useEffect, useRef } from "react";
import { getNode, setNode, deleteNode, listDir, resolvePath } from "../utils/fs";


export function Terminal({ fs, setFs, cwd, setCwd, currentUser, notify, onCopy }) {
  const [lines, setLines] = useState([{ type: "info", text: "VirtualOS Terminal — type 'help' for commands.\nClick any output line to copy it." }]);
  const [input, setInput] = useState("");
  const [cmdHist, setCmdHist] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [copiedLine, setCopiedLine] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  const push = (text, type = "output") => setLines((h) => [...h, { type, text }]);

  const copyLine = (text, idx) => {
    onCopy(text);
    setCopiedLine(idx);
    setTimeout(() => setCopiedLine(null), 1200);
  };

  const exec = (raw) => {
    const line = raw.trim(); if (!line) return;
    push(cwd + " $ " + line, "prompt");
    setCmdHist((h) => [line, ...h]); setHistIdx(-1);
    const [cmd, ...args] = line.split(/\s+/); const arg = args.join(" ");
    const cmds = {
      help: () => push("ls, cd, cat, echo, mkdir, touch, rm, pwd, whoami, clear, eval", "info"),
      pwd: () => push(cwd),
      whoami: () => push(currentUser.username),
      clear: () => setLines([]),
      ls: () => { const t = arg ? resolvePath(cwd, arg) : cwd; const items = listDir(fs, t); push(items.length ? items.map((i) => (i.isDir ? "📁 " + i.name + "/" : "📄 " + i.name)).join("  ") : "(empty)"); },
      cd: () => { if (!arg) { setCwd("/home/" + currentUser.username); return; } const t = resolvePath(cwd, arg); const n = getNode(fs, t); if (n === null || typeof n !== "object") { push("cd: no such directory: " + arg, "error"); return; } setCwd(t); },
      cat: () => { if (!arg) { push("Usage: cat <file>", "error"); return; } const p = resolvePath(cwd, arg); const n = getNode(fs, p); if (n === null) { push("cat: No such file: " + arg, "error"); return; } if (typeof n === "object") { push("cat: Is a directory: " + arg, "error"); return; } push(n); },
      echo: () => push(arg),
      mkdir: () => { if (!arg) { push("Usage: mkdir <dir>", "error"); return; } setFs(setNode(fs, resolvePath(cwd, arg), {})); notify({ icon: "📁", message: "Created " + arg }); },
      touch: () => { if (!arg) { push("Usage: touch <file>", "error"); return; } setFs(setNode(fs, resolvePath(cwd, arg), "")); notify({ icon: "📄", message: "Created " + arg }); },
      rm: () => { if (!arg) { push("Usage: rm <file>", "error"); return; } const p = resolvePath(cwd, arg); if (getNode(fs, p) === null) { push("rm: No such file: " + arg, "error"); return; } setFs(deleteNode(fs, p)); push("Removed " + arg); },
      eval: () => {
        if (line === "sudo rm -rf /") { push("💥 SYSTEM DESTRUCTION INITIATED...", "error"); setTimeout(() => push("just kidding 😄", "info"), 800); return; }
        try { push(String(Function('"use strict"; return (' + arg + ')')())); } catch (e) { push("Error: " + e.message, "error"); }
      },
    };
    if (cmds[cmd]) cmds[cmd](); else push("Command not found: " + cmd, "error");
  };

  const colors = { prompt: "var(--accent)", output: "var(--terminal-text)", error: "var(--accent-red)", info: "var(--text-secondary)" };

  return (
    <div onClick={() => inputRef.current?.focus()} style={{ width: "100%", height: "100%", background: "var(--terminal-bg)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: 14, overflowY: "auto", cursor: "text" }}>
      {lines.map((h, i) => (
        <div key={i} onClick={(e) => { e.stopPropagation(); if (h.type !== "prompt") copyLine(h.text, i); }}
          title={h.type !== "prompt" ? "Click to copy" : ""}
          style={{ color: copiedLine === i ? "var(--accent-yellow)" : colors[h.type], lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all", cursor: h.type !== "prompt" ? "pointer" : "default", borderRadius: 4, padding: "1px 2px", transition: "color 0.2s" }}>
          {copiedLine === i ? "✅ copied!" : h.text}
        </div>
      ))}
      {suggestions.length > 0 && <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{suggestions.join("  ")}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "var(--accent)", flexShrink: 0 }}>{cwd} $</span>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { exec(input); setInput(""); setSuggestions([]); }
            else if (e.key === "ArrowUp") { const idx = Math.min(histIdx + 1, cmdHist.length - 1); setHistIdx(idx); setInput(cmdHist[idx] || ""); }
            else if (e.key === "ArrowDown") { const idx = Math.max(histIdx - 1, -1); setHistIdx(idx); setInput(idx === -1 ? "" : cmdHist[idx] || ""); }
            else if (e.key === "Tab") {
              e.preventDefault();
              const parts = input.split(" "); const last = parts[parts.length - 1]; if (!last) return;
              const matches = listDir(fs, cwd).filter((i) => i.name.startsWith(last));
              if (matches.length === 1) { parts[parts.length - 1] = matches[0].name + (matches[0].isDir ? "/" : ""); setInput(parts.join(" ")); setSuggestions([]); }
              else if (matches.length > 1) setSuggestions(matches.map((m) => m.name));
            }
          }}
          autoFocus spellCheck={false}
          style={{ flex: 1, background: "none", color: "var(--terminal-text)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, caretColor: "var(--accent-green)" }} />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
