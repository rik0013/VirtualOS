import React, { useEffect } from "react";

export function ContextMenu({ x, y, onClose, onNewFile, onNewFolder, onChangeWallpaper, onToggleTheme, theme }) {
  useEffect(() => { const h = () => onClose(); window.addEventListener("click", h); return () => window.removeEventListener("click", h); }, [onClose]);
  const items = [
    { label: "New File", icon: "📝", action: onNewFile },
    { label: "New Folder", icon: "📁", action: onNewFolder },
    { divider: true },
    { label: theme === "dark" ? "Light Mode" : "Dark Mode", icon: theme === "dark" ? "☀️" : "🌙", action: onToggleTheme },
  ];
  return (
    <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", left: x, top: y, zIndex: 4000, background: "var(--bg-context)", border: "1px solid var(--border-strong)", borderRadius: 10, overflow: "hidden", boxShadow: "var(--shadow)", minWidth: 180, animation: "fadeIn 0.12s ease" }}>
      {items.map((item, i) => item.divider
        ? <div key={i} style={{ height: 1, background: "var(--border)", margin: "3px 0" }} />
        : <button key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 14px", fontSize: 13, color: "var(--text-primary)", background: "transparent", textAlign: "left" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}><span>{item.icon}</span>{item.label}</button>
      )}
    </div>
  );
}