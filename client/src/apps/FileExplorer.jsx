import React, { useState, useRef, useEffect } from "react";
import { getNode, setNode, deleteNode, listDir } from "../utils/fs";
import { MacIcon } from "../components/Dock";
import { motion, AnimatePresence } from "framer-motion";

function DynamicIcon({ name, isDir, size = 48 }) {
  if (isDir) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 20h30l5 10h45v50H10V20z" fill="url(#folderGrad)"/>
        <defs>
          <linearGradient id="folderGrad" x1="0" y1="0" x2="0" y2="100">
            <stop stopColor="#8FC7FB" />
            <stop offset="1" stopColor="#5B9DE2" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  
  const ext = name.split('.').pop().toLowerCase();
  const colors = { txt: "#8E8E93", js: "#F7DF1E", jsx: "#61DAFB", png: "#FF2D55", jpg: "#FF2D55", pdf: "#FF3B30", mp4: "#5856D6", zip: "#FF9500" };
  const color = colors[ext] || "#999";
  const label = name.includes('.') ? ext.substring(0, 3).toUpperCase() : 'FILE';
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 10h35l20 20v60H25V10z" fill="#FFF" stroke="#CCC" strokeWidth="2"/>
      <path d="M60 10v20h20" fill="#E0E0E0" stroke="#CCC" strokeWidth="2"/>
      <rect x="30" y="45" width="40" height="20" rx="4" fill={color} />
      <text x="50" y="59" fontSize="11" fill={ext === 'js' || ext === 'jsx' ? '#000' : '#FFF'} fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">{label}</text>
    </svg>
  );
}

function ContextMenu({ x, y, options, onClose }) {
  useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      style={{
        position: "fixed", left: x, top: y, zIndex: 9999,
        background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        padding: "4px 0", minWidth: 160, display: "flex", flexDirection: "column"
      }}
      onClick={e => e.stopPropagation()}
      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); }}
    >
      {options.map((opt, i) => opt.divider ? (
        <div key={i} style={{ height: 1, background: "rgba(0,0,0,0.1)", margin: "4px 0" }} />
      ) : (
        <button key={i} onClick={() => { opt.action(); onClose(); }}
          style={{
            padding: "6px 16px", textAlign: "left", background: "transparent", border: "none",
            fontSize: 13, color: opt.danger ? "var(--accent-red)" : "#333", cursor: "pointer", width: "100%"
          }}
          onMouseEnter={e => e.currentTarget.style.background = opt.danger ? "rgba(255,0,0,0.1)" : "rgba(0,0,0,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {opt.label}
        </button>
      ))}
    </motion.div>
  );
}

export function FileExplorer({ fs, setFs, onOpenFile, currentUser, notify, initialPath, winId, appState = {}, updateAppState }) {
  const [path, setPath] = useState(appState.currentPath || appState.initialPath || initialPath || "/home/" + currentUser.username);
  const [selected, setSelected] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const items = listDir(fs, path);
  const parts = path.split("/").filter(Boolean);
  
  const containerRef = useRef(null);
  const [marquee, setMarquee] = useState(null);

  const navigate = (name) => {
    const np = (path === "/" ? "" : path) + "/" + name;
    const node = getNode(fs, np);
    if (typeof node === "object") setPath(np);
    else onOpenFile(np, node, name);
  };
  const breadcrumb = (idx) => { if (idx === -1) { setPath("/"); return; } setPath("/" + parts.slice(0, idx + 1).join("/")); };
  
  const handleItemClick = (e, name) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      const newSel = new Set(selected);
      if (newSel.has(name)) newSel.delete(name); else newSel.add(name);
      setSelected(newSel);
    } else if (e.shiftKey) {
      const arr = items.map(i => i.name);
      const last = arr.findIndex(n => selected.has(n));
      const curr = arr.indexOf(name);
      const newSel = new Set(selected);
      if (last !== -1) {
        const start = Math.min(last, curr);
        const end = Math.max(last, curr);
        for(let i=start; i<=end; i++) newSel.add(arr[i]);
      } else newSel.add(name);
      setSelected(newSel);
    } else {
      setSelected(new Set([name]));
    }
  };

  const handleContainerClick = () => setSelected(new Set());

  // Sync state back to window manager
  useEffect(() => {
    if (updateAppState && winId) {
      updateAppState(winId, { currentPath: path, selectedFiles: Array.from(selected) });
    }
  }, [path, selected, winId, updateAppState]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !updateAppState || !winId) return;
    const onScroll = () => updateAppState(winId, { scrollPosition: el.scrollTop });
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef, winId, updateAppState]);

  const handlePointerDown = (e) => {
    if (e.target.closest('.file-item')) return;
    if (e.button !== 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const y = e.clientY - rect.top + containerRef.current.scrollTop;
    setMarquee({ startX: x, startY: y, x, y });
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) setSelected(new Set());
  };

  const handlePointerMove = (e) => {
    if (!marquee) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const y = e.clientY - rect.top + containerRef.current.scrollTop;
    setMarquee(m => ({ ...m, x, y }));
    
    // Check intersections
    const minX = Math.min(marquee.startX, x);
    const maxX = Math.max(marquee.startX, x);
    const minY = Math.min(marquee.startY, y);
    const maxY = Math.max(marquee.startY, y);
    
    const elements = containerRef.current.querySelectorAll('.file-item');
    const newSel = new Set();
    elements.forEach(el => {
      const name = el.getAttribute('data-name');
      const elOffsetLeft = el.offsetLeft;
      const elOffsetTop = el.offsetTop;
      const elWidth = el.offsetWidth;
      const elHeight = el.offsetHeight;
      if (minX < elOffsetLeft + elWidth && maxX > elOffsetLeft && minY < elOffsetTop + elHeight && maxY > elOffsetTop) {
        newSel.add(name);
      }
    });
    setSelected(newSel);
  };

  const handlePointerUp = () => setMarquee(null);

  const handleContextMenu = (e, name) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isBg = !name;
    if (!isBg && !selected.has(name)) setSelected(new Set([name]));
    
    let options = [];
    if (isBg) {
      options = [
        { label: "New Folder", action: () => handleNew(true) },
        { label: "New File", action: () => handleNew(false) },
        { divider: true },
        { label: "Paste", action: () => notify({ icon: "info", message: "Paste not implemented" }) },
        { label: "Properties", action: () => notify({ icon: "info", message: "Folder Properties" }) }
      ];
    } else {
      const activeName = selected.has(name) && selected.size > 1 ? `${selected.size} items` : name;
      options = [
        { label: "Open", action: () => { if (selected.size === 1) navigate(name); } },
        { label: "Rename", action: () => notify({ icon: "info", message: "Rename " + activeName }) },
        { divider: true },
        { label: "Copy", action: () => notify({ icon: "info", message: "Copied " + activeName }) },
        { label: "Delete", danger: true, action: () => handleDeleteSelected() },
        { divider: true },
        { label: "Properties", action: () => notify({ icon: "info", message: "Properties for " + activeName }) }
      ];
    }
    setContextMenu({ x: e.clientX, y: e.clientY, options });
  };

  const handleDeleteSelected = () => {
    let newFs = fs;
    selected.forEach(name => {
      newFs = deleteNode(newFs, (path === "/" ? "" : path) + "/" + name);
    });
    setFs(newFs);
    notify({ icon: "trash", message: `Deleted ${selected.size} item(s)` });
    setSelected(new Set());
  };

  const handleNew = (isDir) => {
    const name = isDir ? "New Folder " + Date.now() : "New File " + Date.now() + ".txt";
    setFs(setNode(fs, (path === "/" ? "" : path) + "/" + name, isDir ? {} : ""));
    notify({ icon: isDir ? "folder" : "file", message: "Created " + name });
  };

  const favs = [
    { label: "Home", path: "/home/" + currentUser.username, icon: "home" },
    { label: "Desktop", path: "/home/" + currentUser.username + "/desktop", icon: "desktop" },
    { label: "Documents", path: "/home/" + currentUser.username + "/documents", icon: "document" },
    { label: "Downloads", path: "/home/" + currentUser.username + "/downloads", icon: "folder" },
    { label: "Trash", path: "/trash", icon: "trash" },
    { label: "Root /", path: "/", icon: "save" },
  ];

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg-window)" }}>
      <div style={{ width: 160, borderRight: "1px solid var(--border)", padding: "12px 8px", background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, padding: "0 8px", textTransform: "uppercase", letterSpacing: 1 }}>Favorites</div>
        {favs.map((item) => (
          <button key={item.path} onClick={() => setPath(item.path)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 8px", borderRadius: 7, fontSize: 12, color: path === item.path ? "var(--accent)" : "var(--text-secondary)", background: path === item.path ? "var(--bg-selected)" : "transparent", textAlign: "left", border: "none", cursor: "pointer" }}>
            <MacIcon type={item.icon} size={16} />{item.label}
          </button>
        ))}
      </div>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, flexWrap: "wrap" }}>
            <button onClick={() => breadcrumb(-1)} style={{ fontSize: 12, border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}>Root</button>
            {parts.map((p, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{">"}</span>
                <button onClick={() => breadcrumb(i)} style={{ fontSize: 12, border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}>{p}</button>
              </span>
            ))}
          </div>
        </div>
        
        <div 
          ref={containerRef}
          style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexWrap: "wrap", gap: 10, alignContent: "flex-start", position: "relative", userSelect: "none" }}
          onClick={handleContainerClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onContextMenu={e => handleContextMenu(e, null)}
        >
          {items.map((item) => {
            const isSelected = selected.has(item.name);
            return (
              <motion.div 
                key={item.name} 
                className="file-item"
                data-name={item.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={(e) => handleItemClick(e, item.name)} 
                onDoubleClick={() => navigate(item.name)}
                onContextMenu={e => handleContextMenu(e, item.name)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ 
                  width: 84, padding: "8px", borderRadius: 8, textAlign: "center", cursor: "pointer", 
                  background: isSelected ? "rgba(0, 122, 255, 0.15)" : "transparent", 
                  border: "1px solid " + (isSelected ? "rgba(0, 122, 255, 0.4)" : "transparent"), 
                  transition: "background 0.1s",
                  boxShadow: isSelected ? "0 0 10px rgba(0, 122, 255, 0.2)" : "none"
                }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                  <DynamicIcon name={item.name} isDir={item.isDir} size={48} />
                </div>
                <div style={{ fontSize: 12, color: isSelected ? "#000" : "var(--text-primary)", fontWeight: isSelected ? 500 : 400, wordBreak: "break-all", lineHeight: 1.2 }}>
                  {item.name}
                </div>
              </motion.div>
            )
          })}
          
          {marquee && (
            <div style={{
              position: "absolute",
              left: Math.min(marquee.startX, marquee.x),
              top: Math.min(marquee.startY, marquee.y),
              width: Math.abs(marquee.x - marquee.startX),
              height: Math.abs(marquee.y - marquee.startY),
              background: "rgba(0, 122, 255, 0.1)",
              border: "1px solid rgba(0, 122, 255, 0.5)",
              pointerEvents: "none",
              zIndex: 100
            }} />
          )}
        </div>
      </div>

      <AnimatePresence>
        {contextMenu && (
          <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
