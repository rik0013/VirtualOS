import React, { useState, useEffect, useRef } from "react";
import { getNode, setNode, deleteNode, listDir } from "../utils/fs";
import { ICON_SIZES, ICON_FONT, ICON_TEXT } from "../constants/wallpapers";
import { MacIcon } from "./Dock";

export function DesktopIcons({ fs, desktopPath, layout, onLayoutChange, onOpenFile, onOpenFolder, onDelete, iconSize }) {
  const items = listDir(fs, desktopPath);
  const dragState = useRef(null);
  const [selected, setSelected] = useState(null);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameVal, setRenameVal] = useState("");

  const W = ICON_SIZES[iconSize] || 80;
  const FONT = ICON_FONT[iconSize] || 32;
  const TFONT = ICON_TEXT[iconSize] || 11;
  const GAP = 16;

  const ensureLayout = (items, layout) => {
    const updated = { ...layout };
    let col = 0, row = 0;
    items.forEach((item) => {
      if (!updated[item.name]) {
        updated[item.name] = { x: 20 + col * (W + GAP), y: 20 + row * (W + GAP + 20) };
        col++;
        if ((col + 1) * (W + GAP) > 280) { col = 0; row++; }
      }
    });
    return updated;
  };

  const fullLayout = ensureLayout(items, layout);

  const startDrag = (e, name) => {
    e.stopPropagation();
    const pos = fullLayout[name] || { x: 20, y: 20 };
    dragState.current = { name, startX: e.clientX - pos.x, startY: e.clientY - pos.y, moved: false };
    const onMove = (ev) => {
      if (!dragState.current) return;
      dragState.current.moved = true;
      onLayoutChange({ ...fullLayout, [name]: { x: Math.max(0, ev.clientX - dragState.current.startX), y: Math.max(0, ev.clientY - dragState.current.startY) } });
    };
    const onUp = () => { dragState.current = null; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleDblClick = (item) => {
    const fullPath = (desktopPath === "/" ? "" : desktopPath) + "/" + item.name;
    if (item.isDir) onOpenFolder(fullPath, item.name);
    else { const content = getNode(fs, fullPath); onOpenFile(fullPath, content, item.name); }
  };

  const startRename = (item) => { setRenamingItem(item.name); setRenameVal(item.name); setCtxMenu(null); };

  useEffect(() => {
    const handler = () => { setSelected(null); setCtxMenu(null); };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <>
      {items.map((item) => {
        const pos = fullLayout[item.name] || { x: 20, y: 20 };
        const isSelected = selected === item.name;
        return (
          <div key={item.name}
            onMouseDown={(e) => startDrag(e, item.name)}
            onClick={(e) => { e.stopPropagation(); setSelected(item.name); }}
            onDoubleClick={() => handleDblClick(item)}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, item }); setSelected(item.name); }}
            style={{ position: "absolute", left: pos.x, top: pos.y, width: W, textAlign: "center", cursor: "default", zIndex: isSelected ? 50 : 40, padding: "8px 4px", borderRadius: 10, background: isSelected ? "rgba(99,179,237,0.18)" : "transparent", border: "1px solid " + (isSelected ? "rgba(99,179,237,0.4)" : "transparent") }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 5, pointerEvents: "none" }}>
              <MacIcon type={item.isDir ? "folder" : "file"} size={52} />
            </div>
            {renamingItem === item.name ? (
              <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // rename: move node, delete old, update layout
                    const oldPath = desktopPath + "/" + item.name;
                    const newPath = desktopPath + "/" + renameVal;
                    const content = getNode(fs, oldPath);
                    let newFs = setNode(fs, newPath, content);
                    newFs = deleteNode(newFs, oldPath);
                    onOpenFile.__setFs && onOpenFile.__setFs(newFs);
                    const newLayout = { ...fullLayout, [renameVal]: fullLayout[item.name] };
                    delete newLayout[item.name];
                    onLayoutChange(newLayout);
                    setRenamingItem(null);
                  }
                  if (e.key === "Escape") setRenamingItem(null);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{ fontSize: TFONT, color: "var(--text-primary)", background: "var(--bg-input)", border: "1px solid var(--accent)", borderRadius: 4, padding: "1px 4px", width: "100%", textAlign: "center" }} />
            ) : (
              <div style={{ fontSize: TFONT, color: "#fff", lineHeight: 1.3, wordBreak: "break-word", textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)", pointerEvents: "none" }}>{item.name}</div>
            )}
          </div>
        );
      })}
      {ctxMenu && (
        <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", left: ctxMenu.x, top: ctxMenu.y, zIndex: 4000, background: "var(--bg-context)", border: "1px solid var(--border-strong)", borderRadius: 10, overflow: "hidden", boxShadow: "var(--shadow)", minWidth: 160, animation: "fadeIn 0.12s ease" }}>
          {[
            { label: ctxMenu.item.isDir ? "Open Folder" : "Open", icon: "↗️", action: () => { handleDblClick(ctxMenu.item); setCtxMenu(null); } },
            { label: "Rename", icon: "✏️", action: () => startRename(ctxMenu.item) },
            { divider: true },
            { label: "Delete", icon: "🗑️", action: () => { onDelete(ctxMenu.item.name); setCtxMenu(null); } },
          ].map((it, i) => it.divider
            ? <div key={i} style={{ height: 1, background: "var(--border)", margin: "3px 0" }} />
            : <button key={i} onClick={it.action} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 14px", fontSize: 13, color: "var(--text-primary)", background: "transparent", textAlign: "left" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}><span>{it.icon}</span>{it.label}</button>
          )}
        </div>
      )}
    </>
  );
}