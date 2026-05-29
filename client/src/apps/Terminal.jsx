import React, { useState, useEffect, useRef } from "react";
import { getNode, setNode, deleteNode, listDir, resolvePath } from "../utils/fs";


export function Terminal({ fs, setFs, cwd, setCwd, currentUser, notify, onCopy }) {
  const [lines, setLines] = useState([{ type: "info", text: "VirtualOS Terminal — A JavaScript REPL\ntype 'help' for commands. Click any output line to copy it.\nYou can also run JavaScript directly (e.g., 2+2, Math.random(), etc.)" }]);
  const [input, setInput] = useState("");
  const [cmdHist, setCmdHist] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [copiedLine, setCopiedLine] = useState(null);
  const jsContextRef = useRef({}); // Persistent JS variables
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
    const line = raw.trim(); 
    if (!line) return;
    push(cwd + " $ " + line, "prompt");
    setCmdHist((h) => [line, ...h]); 
    setHistIdx(-1);
    
    const [cmd, ...args] = line.split(/\s+/); 
    const arg = args.join(" ");
    
    // Built-in terminal commands
    const cmds = {
      help: () => push("Terminal Commands:\n  help             - Show this help\n  pwd              - Print working directory\n  whoami           - Print current user\n  clear            - Clear terminal\n  ls [path]        - List directory contents\n  cd [path]        - Change directory\n  cat <file>       - Read file contents\n  echo <text>      - Print text\n  mkdir <dir>      - Create directory\n  touch <file>     - Create file\n  rm <file>        - Delete file\n  run <file>       - Execute Python or JavaScript files\n\nJavaScript REPL:\n  Just type any JS expression and it will be executed!\n  Examples: 2+2, Math.random(), 'hello'.toUpperCase()\n  Variables persist across commands: x=5; x*2", "info"),
      pwd: () => push(cwd),
      whoami: () => push(currentUser.username),
      clear: () => setLines([]),
      ls: () => { 
        const t = arg ? resolvePath(cwd, arg) : cwd; 
        const items = listDir(fs, t); 
        push(items.length ? items.map((i) => (i.isDir ? "📁 " + i.name + "/" : "📄 " + i.name)).join("\n") : "(empty)"); 
      },
      cd: () => { 
        if (!arg) { setCwd("/home/" + currentUser.username); return; } 
        const t = resolvePath(cwd, arg); 
        const n = getNode(fs, t); 
        if (n === null || typeof n !== "object") { 
          push("cd: no such directory: " + arg, "error"); 
          return; 
        } 
        setCwd(t); 
      },
      cat: () => { 
        if (!arg) { push("Usage: cat <file>", "error"); return; } 
        const p = resolvePath(cwd, arg); 
        const n = getNode(fs, p); 
        if (n === null) { push("cat: No such file: " + arg, "error"); return; } 
        if (typeof n === "object") { push("cat: Is a directory: " + arg, "error"); return; } 
        push(n); 
      },
      echo: () => push(arg),
      mkdir: () => { 
        if (!arg) { push("Usage: mkdir <dir>", "error"); return; } 
        setFs(setNode(fs, resolvePath(cwd, arg), {})); 
        notify({ icon: "folder", message: "Created " + arg }); 
      },
      touch: () => { 
        if (!arg) { push("Usage: touch <file>", "error"); return; } 
        setFs(setNode(fs, resolvePath(cwd, arg), "")); 
        notify({ icon: "document", message: "Created " + arg }); 
      },
      rm: () => { 
        if (!arg) { push("Usage: rm <file>", "error"); return; } 
        const p = resolvePath(cwd, arg); 
        if (getNode(fs, p) === null) { push("rm: No such file: " + arg, "error"); return; } 
        setFs(deleteNode(fs, p)); 
        push("Removed " + arg); 
      },
      run: () => {
        if (!arg) { push("Usage: run <file>", "error"); return; }
        const filePath = resolvePath(cwd, arg);
        const fileContent = getNode(fs, filePath);
        
        if (fileContent === null) { 
          push(`run: File not found: ${arg}`, "error"); 
          return; 
        }
        if (typeof fileContent === "object") { 
          push(`run: ${arg} is a directory`, "error"); 
          return; 
        }
        
        // Determine file type by extension
        const ext = arg.split(".").pop().toLowerCase();
        
        if (ext === "js") {
          push(`▶ Executing ${arg}...`);
          evalJS(fileContent, true);
        } else if (ext === "py") {
          push(`▶ Executing ${arg}...`);
          executePython(fileContent);
        } else {
          push(`run: Unsupported file type: .${ext}. Only .js and .py are supported.`, "error");
        }
      },
    };
    
    // Check if it's a terminal command
    if (cmds[cmd]) {
      cmds[cmd]();
    } else {
      // Treat as JavaScript expression
      evalJS(line);
    }
  };

  const evalJS = (code, isFile = false) => {
    try {
      // Check for simple variable assignment (e.g., x = 5)
      const assignmentMatch = code.match(/^\s*(\w+)\s*=\s*(.+)$/);
      
      if (assignmentMatch && !code.includes("==") && !code.includes("===")) {
        // This is an assignment
        const varName = assignmentMatch[1];
        const expression = assignmentMatch[2];
        
        // Execute the expression with context variables available
        const contextKeys = Object.keys(jsContextRef.current);
        const contextValues = contextKeys.map(k => jsContextRef.current[k]);
        
        const func = new Function(...contextKeys, `return ${expression}`);
        const value = func(...contextValues);
        
        // Store the variable
        jsContextRef.current[varName] = value;
        if (!isFile) push(formatOutput(value));
      } else {
        // This is an expression
        const contextKeys = Object.keys(jsContextRef.current);
        const contextValues = contextKeys.map(k => jsContextRef.current[k]);
        
        const func = new Function(...contextKeys, `"use strict"; return (${code})`);
        const result = func(...contextValues);
        if (!isFile) push(formatOutput(result));
      }
    } catch (e) {
      push(`Error: ${e.message}`, "error");
    }
  };

  const executePython = (code) => {
    try {
      const consoleLogs = [];
      
      // Create a Python-like environment
      const pythonEnv = {
        print: (...args) => consoleLogs.push(args.map(a => String(a)).join(" ")),
        len: (obj) => {
          if (typeof obj === "string" || Array.isArray(obj)) return obj.length;
          if (typeof obj === "object") return Object.keys(obj).length;
          return 0;
        },
        range: (start, end, step = 1) => {
          const result = [];
          if (end === undefined) {
            for (let i = 0; i < start; i += step) result.push(i);
          } else {
            for (let i = start; i < end; i += step) result.push(i);
          }
          return result;
        },
        sum: (arr) => arr.reduce((a, b) => a + b, 0),
        max: (arr) => Math.max(...arr),
        min: (arr) => Math.min(...arr),
        str: (val) => String(val),
        int: (val) => parseInt(val),
        float: (val) => parseFloat(val),
        list: (val) => Array.isArray(val) ? [...val] : [...String(val)],
        dict: (obj) => obj || {},
      };
      
      // Convert Python code to JavaScript
      let jsCode = code;
      
      // Handle Python print statements
      jsCode = jsCode.replace(/print\s*\(\s*([^)]*)\s*\)/g, (match, content) => {
        return `print(${content})`;
      });
      
      // Replace Python True/False/None with JS equivalents
      jsCode = jsCode.replace(/\bTrue\b/g, "true");
      jsCode = jsCode.replace(/\bFalse\b/g, "false");
      jsCode = jsCode.replace(/\bNone\b/g, "null");
      
      // Handle basic Python loops and conditionals
      jsCode = jsCode.replace(/for\s+(\w+)\s+in\s+range\s*\(\s*([^)]+)\s*\)\s*:/g, "for (let $1 of range($2)) {");
      jsCode = jsCode.replace(/if\s+(.+?)\s*:/g, "if ($1) {");
      jsCode = jsCode.replace(/else\s*:/g, "} else {");
      jsCode = jsCode.replace(/elif\s+(.+?)\s*:/g, "} else if ($1) {");
      
      // Replace indented blocks with braces (simplified)
      const lines = jsCode.split("\n");
      let result = [];
      let prevIndent = 0;
      let openBraces = 0;
      
      for (const line of lines) {
        const indent = line.search(/\S/);
        const trimmed = line.trim();
        
        if (!trimmed || trimmed.startsWith("#")) {
          result.push(line);
          continue;
        }
        
        if (indent < prevIndent) {
          const diff = prevIndent - indent;
          for (let i = 0; i < Math.ceil(diff / 2); i++) {
            if (openBraces > 0) {
              result[result.length - 1] = result[result.length - 1].slice(0, -1);
              result.push("}");
              openBraces--;
            }
          }
        }
        
        result.push(line);
        if (trimmed.endsWith(":")) {
          result[result.length - 1] = result[result.length - 1].slice(0, -1) + " {";
          openBraces++;
        }
        
        prevIndent = indent;
      }
      
      // Close remaining braces
      for (let i = 0; i < openBraces; i++) {
        result.push("}");
      }
      
      jsCode = result.join("\n");
      
      // Execute the converted code
      const func = new Function("print", "len", "range", "sum", "max", "min", "str", "int", "float", "list", "dict", jsCode);
      func(
        pythonEnv.print,
        pythonEnv.len,
        pythonEnv.range,
        pythonEnv.sum,
        pythonEnv.max,
        pythonEnv.min,
        pythonEnv.str,
        pythonEnv.int,
        pythonEnv.float,
        pythonEnv.list,
        pythonEnv.dict
      );
      
      // Output results
      if (consoleLogs.length > 0) {
        consoleLogs.forEach((log) => push(log));
      } else {
        push("✓ Python script executed successfully");
      }
    } catch (e) {
      push(`Python Error: ${e.message}`, "error");
    }
  };

  const formatOutput = (value) => {
    if (value === undefined) return "undefined";
    if (value === null) return "null";
    if (typeof value === "string") return `"${value}"`;
    if (typeof value === "boolean") return String(value);
    if (typeof value === "number") return String(value);
    if (typeof value === "function") return "[Function: " + (value.name || "anonymous") + "]";
    if (Array.isArray(value)) {
      return "[ " + value.map(v => formatOutput(v)).join(", ") + " ]";
    }
    if (typeof value === "object") {
      const keys = Object.keys(value);
      if (keys.length === 0) return "{}";
      if (keys.length > 5) {
        return "{ " + keys.slice(0, 5).map(k => `${k}: ${formatOutput(value[k])}`).join(", ") + ", ... }";
      }
      return "{ " + keys.map(k => `${k}: ${formatOutput(value[k])}`).join(", ") + " }";
    }
    return String(value);
  };

  const colors = { prompt: "var(--accent)", output: "var(--terminal-text)", error: "var(--accent-red)", info: "var(--text-secondary)" };

  return (
    <div onClick={() => inputRef.current?.focus()} style={{ width: "100%", height: "100%", background: "var(--terminal-bg)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: 14, overflowY: "auto", cursor: "text" }}>
      {lines.map((h, i) => (
        <div key={i} onClick={(e) => { e.stopPropagation(); if (h.type !== "prompt") copyLine(h.text, i); }}
          title={h.type !== "prompt" ? "Click to copy" : ""}
          style={{ color: copiedLine === i ? "var(--accent-yellow)" : colors[h.type], lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all", cursor: h.type !== "prompt" ? "pointer" : "default", borderRadius: 4, padding: "1px 2px", transition: "color 0.2s" }}>
          {copiedLine === i ? "copied!" : h.text}
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
