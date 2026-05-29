import React, { useRef } from "react";

export function WindowFrame({ win, onClose, onMinimize, onMaximize, onFocus, onUpdatePos, onUpdateSize, children, isActive }) {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const minWidth = 320;
  const minHeight = 200;

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

  const handleResizeDown = (direction, e) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: win.x,
      startTop: win.y,
      startWidth: win.width,
      startHeight: win.height,
    };

    const onMove = (ev) => {
      const state = resizeRef.current;
      if (!state) return;

      const deltaX = ev.clientX - state.startX;
      const deltaY = ev.clientY - state.startY;

      let nextLeft = state.startLeft;
      let nextTop = state.startTop;
      let nextWidth = state.startWidth;
      let nextHeight = state.startHeight;

      if (state.direction.includes("e")) nextWidth = Math.max(minWidth, state.startWidth + deltaX);
      if (state.direction.includes("s")) nextHeight = Math.max(minHeight, state.startHeight + deltaY);
      if (state.direction.includes("w")) {
        nextWidth = Math.max(minWidth, state.startWidth - deltaX);
        nextLeft = state.startLeft + (state.startWidth - nextWidth);
      }
      if (state.direction.includes("n")) {
        nextHeight = Math.max(minHeight, state.startHeight - deltaY);
        nextTop = state.startTop + (state.startHeight - nextHeight);
      }

      nextLeft = Math.max(0, Math.min(nextLeft, window.innerWidth - nextWidth));
      nextTop = Math.max(0, nextTop);

      onUpdatePos(win.id, nextLeft, nextTop);
      onUpdateSize(win.id, nextWidth, nextHeight);
    };

    const onUp = () => {
      resizeRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

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
      {!isMax && (
        <>
          <div onMouseDown={(e) => handleResizeDown("nw", e)} style={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, cursor: "nw-resize" }} />
          <div onMouseDown={(e) => handleResizeDown("n", e)} style={{ position: "absolute", top: 0, left: 10, right: 10, height: 6, cursor: "n-resize" }} />
          <div onMouseDown={(e) => handleResizeDown("ne", e)} style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, cursor: "ne-resize" }} />
          <div onMouseDown={(e) => handleResizeDown("w", e)} style={{ position: "absolute", top: 10, left: 0, bottom: 10, width: 6, cursor: "w-resize" }} />
          <div onMouseDown={(e) => handleResizeDown("e", e)} style={{ position: "absolute", top: 10, right: 0, bottom: 10, width: 6, cursor: "e-resize" }} />
          <div onMouseDown={(e) => handleResizeDown("sw", e)} style={{ position: "absolute", bottom: 0, left: 0, width: 10, height: 10, cursor: "sw-resize" }} />
          <div onMouseDown={(e) => handleResizeDown("s", e)} style={{ position: "absolute", left: 10, right: 10, bottom: 0, height: 6, cursor: "s-resize" }} />
          <div onMouseDown={(e) => handleResizeDown("se", e)} style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, cursor: "se-resize" }} />
        </>
      )}
    </div>
  );
}