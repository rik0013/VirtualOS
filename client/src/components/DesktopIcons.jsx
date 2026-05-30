import React, { useState, useEffect, useRef } from "react";
import { getNode, setNode, deleteNode, listDir } from "../utils/fs";
import { ICON_SIZES, ICON_FONT, ICON_TEXT } from "../constants/wallpapers";
import { MacIcon } from "./Dock";

export function DesktopIcons({ fs, desktopPath, layout, onLayoutChange, onOpenFile, onOpenFolder, onDelete, onRename, iconSize }) {
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
  const handleRename = (oldName, newName) => {
    if (!newName || oldName === newName) {
      setRenamingItem(null);
      return;
    }
    onRename(oldName, newName);
    setRenamingItem(null);
  };

  useEffect(() => {
    const handler = (e) => { 
      if (e.key === "Delete" && selected) {
        const itemToDelete = items.find(i => i.name === selected);
        if (itemToDelete) {
          onDelete(itemToDelete.name);
          setSelected(null);
        }
      }
      if (e.key === "Escape") { 
        setSelected(null); 
        setCtxMenu(null); 
      }
    };
    const clickHandler = () => { setSelected(null); setCtxMenu(null); };
    window.addEventListener("keydown", handler);
    window.addEventListener("click", clickHandler);
    return () => { 
      window.removeEventListener("keydown", handler);
      window.removeEventListener("click", clickHandler);
    };
  }, [selected, items, onDelete]);

  return (
    <>
      {items.map((item) => {
        const pos = fullLayout[item.name] || { x: 20, y: 20 };
        const isSelected = selected === item.name;
        return (
          <div key={item.name}
            onMouseDown={(e) => { e.stopPropagation(); startDrag(e, item.name); }}
            onClick={(e) => { e.stopPropagation(); setSelected(item.name); }}
            onDoubleClick={() => handleDblClick(item)}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, item }); setSelected(item.name); }}
            style={{ position: "absolute", left: pos.x, top: pos.y, width: W, textAlign: "center", cursor: "default", zIndex: isSelected ? 50 : 40, padding: "8px 4px", borderRadius: 10, background: isSelected ? "rgba(99,179,237,0.18)" : "transparent", border: "1px solid " + (isSelected ? "rgba(99,179,237,0.4)" : "transparent") }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 5, pointerEvents: "none" }}>
              <MacIcon type={item.isDir ? "folder" : "file"} size={52} />
            </div>
            {renamingItem === item.name ? (
              <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)}
                onBlur={() => handleRename(item.name, renameVal)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(item.name, renameVal);
                  if (e.key === "Escape") setRenamingItem(null);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{ fontSize: TFONT, color: "var(--text-primary)", background: "var(--bg-input)", border: "1px solid var(--accent)", borderRadius: 4, padding: "1px 4px", width: "100%", textAlign: "center" }} />
            ) : (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                <span style={{ 
                  fontSize: TFONT, 
                  color: "#fff", 
                  lineHeight: 1.3, 
                  wordBreak: "break-word", 
                  padding: "2px 6px",
                  borderRadius: "6px",
                  background: isSelected ? "var(--accent)" : "rgba(0, 0, 0, 0.25)",
                  backdropFilter: "blur(6px)",
                  display: "inline-block",
                  maxWidth: "100%",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                  border: isSelected ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(255, 255, 255, 0.05)",
                  pointerEvents: "none" 
                }}>
                  {item.name}
                </span>
              </div>
            )}
          </div>
        );
      })}
      {ctxMenu && (
        <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", left: ctxMenu.x, top: ctxMenu.y, zIndex: 4000, background: "var(--bg-context)", border: "1px solid var(--border-strong)", borderRadius: 10, overflow: "hidden", boxShadow: "var(--shadow)", minWidth: 180, animation: "fadeIn 0.12s ease" }}>
          {[
            { label: ctxMenu.item.isDir ? "Open Folder" : "Open", emoji: "📂", action: () => { handleDblClick(ctxMenu.item); setCtxMenu(null); } },
            { label: "Rename", emoji: "✏️", action: () => startRename(ctxMenu.item) },
            { divider: true },
            { label: "Delete", emoji: "🗑️", action: () => { onDelete(ctxMenu.item.name); setCtxMenu(null); }, danger: true },
          ].map((it, i) => it.divider
            ? <div key={i} style={{ height: 1, background: "var(--border)", margin: "3px 0" }} />
            : <button key={i} onClick={it.action} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 14px", fontSize: 13, color: it.danger ? "var(--accent-red)" : "var(--text-primary)", background: "transparent", textAlign: "left", cursor: "pointer", border: "none" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}><span style={{ fontSize: 16 }}>{it.emoji}</span>{it.label}</button>
          )}
        </div>
      )}
    </>
  );
}
