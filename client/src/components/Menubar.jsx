import React, { useState, useEffect } from "react";

export function Menubar({ activeApp, currentUser, onLogout, clipboardVal }) {
  const [time, setTime] = useState(new Date());
  const [showCal, setShowCal] = useState(false);
  const [showClip, setShowClip] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const now = time;
  const year = now.getFullYear(), month = now.getMonth();
  const monthName = now.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleCopyClipboard = () => {
    try { navigator.clipboard.writeText(clipboardVal); } catch (e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ height: 28, background: "var(--bg-menubar)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", position: "relative", zIndex: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.3px" }}>VOS</span>
        {activeApp && <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{activeApp}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Clipboard indicator */}
        <div style={{ position: "relative" }}>
          <button onClick={() => { setShowClip(!showClip); setShowCal(false); }}
            title="Clipboard" style={{ fontSize: 12, padding: "2px 8px", borderRadius: 5, background: clipboardVal ? "var(--bg-selected)" : "var(--bg-hover)", color: clipboardVal ? "var(--accent)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            📋 {clipboardVal ? <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}>{clipboardVal}</span> : <span>empty</span>}
          </button>
          {showClip && (
            <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", right: 0, top: 32, width: 280, background: "var(--bg-context)", border: "1px solid var(--border-strong)", borderRadius: 12, padding: 14, boxShadow: "var(--shadow)", zIndex: 2000, animation: "fadeIn 0.15s ease" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Clipboard</div>
              {clipboardVal ? (
                <>
                  <div style={{ fontSize: 12, color: "var(--text-primary)", background: "var(--bg-input)", borderRadius: 8, padding: "8px 10px", maxHeight: 100, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>{clipboardVal}</div>
                  <button onClick={handleCopyClipboard} style={{ width: "100%", padding: "7px", borderRadius: 7, background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 600 }}>{copied ? "✅ Copied!" : "Copy to system clipboard"}</button>
                </>
              ) : (
                <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>Nothing copied yet</div>
              )}
            </div>
          )}
        </div>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>' {currentUser?.username}</span>
        <div style={{ position: "relative" }}>
          <button onClick={() => { setShowCal(!showCal); setShowClip(false); }} style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>
            {now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} &nbsp; {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </button>
          {showCal && (
            <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", right: 0, top: 30, width: 220, background: "var(--bg-context)", border: "1px solid var(--border-strong)", borderRadius: 12, padding: 14, boxShadow: "var(--shadow)", zIndex: 2000, animation: "fadeIn 0.15s ease" }}>
              <div style={{ textAlign: "center", fontWeight: 600, fontSize: 13, marginBottom: 10, color: "var(--text-primary)" }}>{monthName} {year}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => <div key={d} style={{ fontSize: 10, color: "var(--text-muted)", padding: 3, fontWeight: 600 }}>{d}</div>)}
                {days.map((d, i) => <div key={i} style={{ fontSize: 11, padding: 4, borderRadius: 5, background: d === now.getDate() ? "var(--accent)" : "transparent", color: d === now.getDate() ? "#fff" : d ? "var(--text-primary)" : "transparent", fontWeight: d === now.getDate() ? 700 : 400 }}>{d || ""}</div>)}
              </div>
            </div>
          )}
        </div>
        <button onClick={onLogout} style={{ fontSize: 11, color: "var(--text-muted)", padding: "2px 8px", borderRadius: 5, background: "var(--bg-hover)" }}>Logout</button>
      </div>
    </div>
  );
}