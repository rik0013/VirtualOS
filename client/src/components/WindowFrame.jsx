import React, { useRef } from "react";

export function WindowFrame({ win, onClose, onMinimize, onMaximize, onFocus, onUpdatePos, onUpdateSize, children, isActive }) {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  const handleTitleMouseDown = (e) => {
    onFocus(win.id);
    if (e.target.closest("[data-nodrag]")) return;
    dragRef.current = { startX: e.clientX - win.x, startY: e.clientY - win.y };
    const onMove = (ev) => {
      let nx = ev.clientX - dragRef.current.startX;
      let ny = ev.clientY - dragRef.current.startY;
      if (nx < 0) nx = 0;
      if (nx + win.width > window.innerWidth) nx = window.innerWidth - win.width;
      if (ny < 0) ny = 0;
      onUpdatePos(win.id, nx, ny);
    };
    const onUp = () => { dragRef.current = null; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleResizeDown = (e) => {
    e.stopPropagation();
    resizeRef.current = { startX: e.clientX, startY: e.clientY, w: win.width, h: win.height };
    const onMove = (ev) => { onUpdateSize(win.id, Math.max(320, resizeRef.current.w + ev.clientX - resizeRef.current.startX), Math.max(200, resizeRef.current.h + ev.clientY - resizeRef.current.startY)); };
    const onUp = () => { resizeRef.current = null; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  if (win.minimized) {
    if (win.appId === "music") {
      return (
        <div aria-hidden="true" style={{ position: "fixed", left: -99999, top: -99999, width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
          {children}
        </div>
      );
    }
    return null;
  }
  const isMax = win.maximized;
  const wStyle = isMax
    ? { position: "fixed", left: 0, top: 24, width: "100vw", height: "calc(100vh - 24px)", zIndex: 3000 + win.zIndex }
    : { position: "absolute", left: win.x, top: win.y, width: win.width, height: win.height, zIndex: 1000 + win.zIndex };

  return (
    <div style={{ ...wStyle, background: "var(--bg-window)", border: "1px solid " + (isActive ? "var(--border-strong)" : "var(--border)"), borderRadius: isMax ? 0 : 12, overflow: "hidden", boxShadow: isActive ? "var(--shadow)" : "var(--shadow-sm)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column" }}
      className="window-open" onClick={(e) => { e.stopPropagation(); onFocus(win.id); }} onMouseDown={() => onFocus(win.id)}>
      <div onMouseDown={handleTitleMouseDown} style={{ height: 36, background: "var(--bg-titlebar)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 12px", gap: 8, cursor: "default", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }} data-nodrag>
          <button onClick={() => onClose(win.id)} style={{ width: 12, height: 12, borderRadius: "50%", background: "#fc8181" }} />
          <button onClick={() => onMinimize(win.id)} style={{ width: 12, height: 12, borderRadius: "50%", background: "#f6e05e" }} />
          <button onClick={() => onMaximize(win.id)} style={{ width: 12, height: 12, borderRadius: "50%", background: "#68d391" }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginLeft: 8, pointerEvents: "none" }}>{win.title}</span>
      </div>
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>{children}</div>
      {!isMax && <div onMouseDown={handleResizeDown} style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, cursor: "se-resize" }} />}
    </div>
  );
}