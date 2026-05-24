import React, { useState } from "react";
import { getNode, setNode, deleteNode, listDir } from "../utils/fs";
import { MacIcon } from "../components/Dock";

export function FileExplorer({ fs, setFs, onOpenFile, currentUser, notify, initialPath }) {
  const [path, setPath] = useState(initialPath || "/home/" + currentUser.username);
  const [selected, setSelected] = useState(null);
  const items = listDir(fs, path);
  const parts = path.split("/").filter(Boolean);

  const navigate = (name) => {
    const np = (path === "/" ? "" : path) + "/" + name;
    const node = getNode(fs, np);
    if (typeof node === "object") setPath(np);
    else onOpenFile(np, node, name);
  };
  const breadcrumb = (idx) => { if (idx === -1) { setPath("/"); return; } setPath("/" + parts.slice(0, idx + 1).join("/")); };
  const handleDelete = (name) => { setFs(deleteNode(fs, (path === "/" ? "" : path) + "/" + name)); notify({ icon: "🗑️", message: "Deleted " + name }); setSelected(null); };
  const handleNew = (isDir) => {
    const name = isDir ? "folder_" + Date.now() : "file_" + Date.now() + ".txt";
    setFs(setNode(fs, (path === "/" ? "" : path) + "/" + name, isDir ? {} : ""));
    notify({ icon: isDir ? "📁" : "📝", message: "Created " + name });
  };

  const favs = [
    { label: "Home", path: "/home/" + currentUser.username, icon: "🏠" },
    { label: "Desktop", path: "/home/" + currentUser.username + "/desktop", icon: "🖥️" },
    { label: "Documents", path: "/home/" + currentUser.username + "/documents", icon: "📄" },
    { label: "Downloads", path: "/home/" + currentUser.username + "/downloads", icon: "⬇️" },
    { label: "Trash", path: "/trash", icon: "🗑️" },
    { label: "Root /", path: "/", icon: "💾" },
  ];

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg-window)" }}>
      <div style={{ width: 155, borderRight: "1px solid var(--border)", padding: "12px 8px", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, padding: "0 8px", textTransform: "uppercase", letterSpacing: 1 }}>Favorites</div>
        {favs.map((item) => (
          <button key={item.path} onClick={() => setPath(item.path)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 8px", borderRadius: 7, fontSize: 12, color: path === item.path ? "var(--accent)" : "var(--text-secondary)", background: path === item.path ? "var(--bg-selected)" : "transparent", textAlign: "left" }}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, flexWrap: "wrap" }}>
            <button onClick={() => breadcrumb(-1)} style={{ fontSize: 11, color: "var(--accent)", padding: "2px 6px", borderRadius: 4, background: "var(--bg-hover)" }}>/</button>
            {parts.map((p, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 11 }}>›</span>
                <button onClick={() => breadcrumb(i)} style={{ fontSize: 11, color: "var(--accent)", padding: "2px 6px", borderRadius: 4, background: "var(--bg-hover)" }}>{p}</button>
              </span>
            ))}
          </div>
          <button onClick={() => handleNew(false)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>+ File</button>
          <button onClick={() => handleNew(true)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>+ Folder</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexWrap: "wrap", gap: 10, alignContent: "flex-start" }}>
          {items.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 13, width: "100%", textAlign: "center", paddingTop: 40 }}>Empty folder</div>}
          {items.map((item) => (
            <div key={item.name} onClick={() => setSelected(item.name)} onDoubleClick={() => navigate(item.name)}
              style={{ width: 80, padding: "10px 6px", borderRadius: 10, textAlign: "center", cursor: "pointer", background: selected === item.name ? "var(--bg-selected)" : "transparent", border: "1px solid " + (selected === item.name ? "var(--accent)" : "transparent"), transition: "background 0.1s" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                <MacIcon type={item.isDir ? "folder" : "file"} size={36} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text-primary)", wordBreak: "break-all", lineHeight: 1.3 }}>{item.name}</div>
            </div>
          ))}
        </div>
        {selected && (
          <div style={{ padding: "6px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{selected}</span>
            <button onClick={() => handleDelete(selected)} style={{ fontSize: 11, color: "var(--accent-red)", padding: "3px 8px", borderRadius: 5, background: "var(--bg-hover)" }}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}