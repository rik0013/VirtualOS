import React, { useState } from "react";
import { Terminal } from "../apps/Terminal";
import { Settings } from "../apps/Settings";

export const DOCK_APPS = [
  { id: "launchpad", icon: "launchpad", label: "Launchpad" },
  { id: "terminal", icon: "terminal", label: "Terminal" },
  { id: "files", icon: "finder", label: "Files" },
  { id: "editor", icon: "editor", label: "Editor" },
  { id: "music", icon: "music", label: "Music" },
  { id: "browser", icon: "browser", label: "Browser" },
  { id: "assistant", icon: "assistant", label: "Assistant" },
  { id: "settings", icon: "settings", label: "Settings" },
];

/* ============================================================
 * ICONS (macOS inspired SVGs)
 * ============================================================ */
export const MacIcon = ({ type, size = 52, ...props }) => {
  const [loadError, setLoadError] = useState(false);

  const getIconUrl = (t) => {
    const base = "https://raw.githubusercontent.com/elrumo/macOS_Big_Sur_icons/master/icons/";
    switch(t) {
      case "finder": return `${base}Finder.png`;
      case "terminal": return `${base}Terminal.png`;
      case "editor": return `${base}TextEdit.png`;
      case "settings": return `${base}System%20Preferences.png`;
      default: return null;
    }
  };

  const url = getIconUrl(type);

  if (url && !loadError) {
    return (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.18))", transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)", ...props.style }}>
        <img 
          src={url} 
          style={{ width: "100%", height: "100%", objectFit: "contain" }} 
          alt={type} 
          onError={() => setLoadError(true)} 
        />
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))", transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)", ...props.style }}>
      {type === "terminal" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <rect x="5" y="10" width="90" height="80" rx="16" fill="url(#termGrad)" stroke="#4A4A4A" strokeWidth="2"/>
          <path d="M5 28h90M5 10v18a16 16 0 0 0 16-16h58a16 16 0 0 0 16 16z" fill="#333" stroke="#4A4A4A" strokeWidth="2" strokeDasharray="90 300" />
          <circle cx="15" cy="19" r="3" fill="#FF5F56"/>
          <circle cx="25" cy="19" r="3" fill="#FFBD2E"/>
          <circle cx="35" cy="19" r="3" fill="#27C93F"/>
          <path d="M20 40l10 10-10 10" stroke="#FFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M40 60h15" stroke="#FFF" strokeWidth="6" strokeLinecap="round"/>
          <defs>
            <linearGradient id="termGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E1E1E"/>
              <stop offset="1" stopColor="#000000"/>
            </linearGradient>
          </defs>
        </svg>
      )}
      {type === "finder" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <rect x="5" y="10" width="90" height="80" rx="16" fill="#F4F5F5" stroke="#CCC" strokeWidth="1"/>
          <path d="M50 10v80" stroke="#DDD" strokeWidth="2"/>
          <path d="M15 35q25 35 35 10M85 35q-25 35-35 10" stroke="#888" strokeWidth="3" strokeLinecap="round"/>
          <path d="M32 50v2M68 50v2" stroke="#444" strokeWidth="5" strokeLinecap="round"/>
          <path d="M30 65q20 20 40 0" stroke="#444" strokeWidth="4" strokeLinecap="round"/>
          <defs>
            <linearGradient id="finderLeft" x1="5" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E9F2FF"/>
              <stop offset="1" stopColor="#A8CDFF"/>
            </linearGradient>
            <linearGradient id="finderRight" x1="50" y1="10" x2="95" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#81B2FF"/>
              <stop offset="1" stopColor="#3E7DDF"/>
            </linearGradient>
          </defs>
          <path d="M5 26a16 16 0 0 1 16-16h29v80H21a16 16 0 0 1-16-16V26z" fill="url(#finderLeft)"/>
          <path d="M95 26a16 16 0 0 0-16-16H50v80h29a16 16 0 0 0 16-16V26z" fill="url(#finderRight)"/>
          <path d="M25 40v3c0 5-5 5-5 5M75 40v3c0 5 5 5 5 5" stroke="#444" strokeWidth="3" strokeLinecap="round"/>
          <path d="M50 30v40" stroke="#FFF" strokeWidth="2" opacity="0.4"/>
          <path d="M35 65q15 15 30 0" stroke="#444" strokeWidth="3" strokeLinecap="round" fill="white"/>
        </svg>
      )}
      {type === "folder" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <path d="M10 15h30a10 10 0 0110 10v45a10 10 0 01-10 10H15A10 10 0 015 85V25z" fill="url(#folderGradDark)"/>
          <path d="M5 35A10 10 0 0115 25h70a10 10 0 0110 10v50a10 10 0 01-10 10H15A10 10 0 015 85V35z" fill="url(#folderGradLight)"/>
          <defs>
            <linearGradient id="folderGradDark" x1="50" y1="15" x2="50" y2="95" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8FC7FB"/>
              <stop offset="1" stopColor="#5B9DE2"/>
            </linearGradient>
            <linearGradient id="folderGradLight" x1="50" y1="25" x2="50" y2="95" gradientUnits="userSpaceOnUse">
              <stop stopColor="#BCE2FF"/>
              <stop offset="1" stopColor="#8AC6FB"/>
            </linearGradient>
          </defs>
        </svg>
      )}
      {type === "file" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <path d="M20 10a10 10 0 00-10 10v60a10 10 0 0010 10h60a10 10 0 0010-10V35L65 10H20z" fill="#FFF" stroke="#CCC" strokeWidth="2"/>
          <path d="M90 35H70a10 10 0 01-10-10V10l30 25z" fill="#F0F0F0" stroke="#CCC" strokeWidth="2"/>
          <path d="M30 45h40M30 55h40M30 65h30" stroke="#CCC" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      )}
      {type === "editor" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <rect x="15" y="10" width="70" height="80" rx="5" fill="#FFF" stroke="#CCC" strokeWidth="2"/>
          <path d="M25 25h50M25 40h50M25 55h50M25 70h30" stroke="#DDD" strokeWidth="3" strokeLinecap="round"/>
          <path d="M60 20L80 40 50 70 30 75 35 55z" fill="url(#penGrad)" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M70 30l10-10 10 10-10 10-10-10z" fill="#FFCBA4" stroke="#333" strokeWidth="2"/>
          <path d="M30 75l10-20-10 10 5 10z" fill="#333"/>
          <defs>
             <linearGradient id="penGrad" x1="50" y1="20" x2="60" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F6ED1E"/>
              <stop offset="1" stopColor="#F29813"/>
            </linearGradient>
          </defs>
        </svg>
      )}
      {type === "launchpad" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <linearGradient id="launchBg" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c4b5fd" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#launchBg)" />
          <rect x="24" y="24" width="12" height="12" rx="4" fill="rgba(255,255,255,0.95)" />
          <rect x="44" y="24" width="12" height="12" rx="4" fill="rgba(255,255,255,0.95)" />
          <rect x="64" y="24" width="12" height="12" rx="4" fill="rgba(255,255,255,0.95)" />
          <rect x="24" y="44" width="12" height="12" rx="4" fill="rgba(255,255,255,0.95)" />
          <rect x="44" y="44" width="12" height="12" rx="4" fill="rgba(255,255,255,0.95)" />
          <rect x="64" y="44" width="12" height="12" rx="4" fill="rgba(255,255,255,0.95)" />
          <rect x="24" y="64" width="12" height="12" rx="4" fill="rgba(255,255,255,0.95)" />
          <rect x="44" y="64" width="12" height="12" rx="4" fill="rgba(255,255,255,0.95)" />
          <rect x="64" y="64" width="12" height="12" rx="4" fill="rgba(255,255,255,0.95)" />
        </svg>
      )}
      {type === "music" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <linearGradient id="dockMusicBg" x1="20" y1="15" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff9a3c" />
              <stop offset="1" stopColor="#d9480f" />
            </linearGradient>
            <linearGradient id="dockMusicDisc" x1="35" y1="28" x2="70" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="1" stopColor="#f3f4f6" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="84" height="84" rx="20" fill="url(#dockMusicBg)" />
          <circle cx="50" cy="50" r="24" fill="url(#dockMusicDisc)" opacity="0.95" />
          <circle cx="50" cy="50" r="6" fill="#d9480f" />
          <path d="M56 26v28.5c0 4.2-3.8 7.5-8.5 7.5s-8.5-3.3-8.5-7.5 3.8-7.5 8.5-7.5c1.8 0 3.4.4 4.8 1.1V32l18-4v10.5" stroke="#7c2d12" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M70 26l-14 4" stroke="#7c2d12" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )}
      {type === "browser" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <linearGradient id="dockBrowserBg" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6ea8ff" />
              <stop offset="1" stopColor="#2457d6" />
            </linearGradient>
            <linearGradient id="dockBrowserGlass" x1="35" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="1" stopColor="#dbeafe" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="84" height="84" rx="20" fill="url(#dockBrowserBg)" />
          <rect x="18" y="24" width="64" height="50" rx="10" fill="url(#dockBrowserGlass)" stroke="#1e3a8a" strokeWidth="3" />
          <rect x="18" y="24" width="64" height="12" rx="10" fill="#dbeafe" />
          <circle cx="27" cy="30" r="2.8" fill="#ef4444" />
          <circle cx="35" cy="30" r="2.8" fill="#f59e0b" />
          <circle cx="43" cy="30" r="2.8" fill="#22c55e" />
          <circle cx="50" cy="49" r="15" fill="none" stroke="#2457d6" strokeWidth="4" />
          <path d="M50 34c-4 4-6 9-6 15s2 11 6 15c4-4 6-9 6-15s-2-11-6-15Z" fill="#2457d6" opacity="0.85" />
          <path d="M35 49h30" stroke="#2457d6" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 34v30" stroke="#2457d6" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        </svg>
      )}
      {type === "assistant" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <linearGradient id="dockAssistantBg" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7c3aed" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="dockAssistantGlow" x1="28" y1="26" x2="72" y2="74" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.96" />
              <stop offset="1" stopColor="#dbeafe" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#dockAssistantBg)" />
          <path d="M50 18l6 12 13 6-13 6-6 12-6-12-13-6 13-6 6-12Z" fill="url(#dockAssistantGlow)" opacity="0.96" />
          <circle cx="50" cy="56" r="18" fill="rgba(255,255,255,0.18)" />
          <circle cx="43" cy="54" r="2.8" fill="#fff" />
          <circle cx="57" cy="54" r="2.8" fill="#fff" />
          <path d="M42 62c2.5 3 5.4 4.5 8 4.5s5.5-1.5 8-4.5" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}
      {type === "settings" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <linearGradient id="dockSettingsBgFallback" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f3f4f6" />
              <stop offset="1" stopColor="#c7cdd6" />
            </linearGradient>
            <linearGradient id="dockSettingsPanelFallback" x1="22" y1="20" x2="78" y2="82" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#e5e7eb" />
            </linearGradient>
            <linearGradient id="dockSettingsGearFallback" x1="30" y1="28" x2="70" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b919a" />
              <stop offset="1" stopColor="#545b66" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#dockSettingsBgFallback)" />
          <rect x="16" y="16" width="68" height="68" rx="20" fill="url(#dockSettingsPanelFallback)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="20" fill="url(#dockSettingsGearFallback)" stroke="#2f3640" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="9" fill="#2b3139" stroke="#1d2228" strokeWidth="1.5" />
          <path d="M50 28v8M50 64v8M28 50h8M64 50h8M34 34l6 6M60 60l6 6M34 66l6-6M60 40l6-6" stroke="#6b7280" strokeWidth="4" strokeLinecap="round" />
          <circle cx="36" cy="34" r="5" fill="rgba(255,255,255,0.35)" />
        </svg>
      )}
    </div>
  );
};

export function Dock({ onOpen, windows = [], onFocusWindow, restoreWindow, restoreAllMinimized, onDockClick }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoverPreview, setHoverPreview] = useState(null);

  const getScale = (idx) => {
    if (hoveredIndex === null) return 1;
    const dist = Math.abs(idx - hoveredIndex);
    if (dist === 0) return 1.45;
    if (dist === 1) return 1.25;
    if (dist === 2) return 1.1;
    return 1;
  };

  return (
    <div 
      style={{ 
        position: "fixed", 
        bottom: 12, 
        left: "50%", 
        transform: "translateX(-50%)", 
        background: "var(--bg-dock)", 
        backdropFilter: "blur(40px) saturate(220%)", 
        border: "1px solid rgba(255, 255, 255, 0.15)", 
        borderRadius: 24, 
        padding: "10px 14px", 
        display: "flex", 
        alignItems: "flex-end", 
        gap: 12, 
        zIndex: 500, 
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {DOCK_APPS.map((app, idx) => {
        const scale = getScale(idx);
        const size = Math.round(46 * scale);
        const openInstances = windows.filter(w => w.appId === app.id && !w.minimized);
        const minimizedInstances = windows.filter(w => w.appId === app.id && w.minimized);
        const isOpen = openInstances.length > 0 || minimizedInstances.length > 0;
        
        return (
          <div key={app.id} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}
            onMouseEnter={() => { if (minimizedInstances.length > 0) setHoverPreview(app.id); }} onMouseLeave={() => setHoverPreview(null)}>
            <button 
              onClick={() => { if (typeof onDockClick === 'function') onDockClick(app.id); else onOpen(app.id); }} 
              onMouseEnter={() => setHoveredIndex(idx)} 
              title={app.label}
              style={{ 
                width: size, 
                height: size, 
                borderRadius: 12, 
                background: "transparent", 
                border: "none", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)", 
                transform: `translateY(${-((scale - 1) * 12)}px)`,
                cursor: "pointer",
                outline: "none"
              }}>
              <MacIcon type={app.icon} size={size} style={{ transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }} />
            </button>
            {isOpen && (
              <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                {openInstances.slice(0,4).map((_, i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 6px rgba(0,0,0,0.2)" }} />
                ))}
                {minimizedInstances.slice(0,4).map((_, i) => (
                  <div key={i+openInstances.length} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "1px solid rgba(0,0,0,0.08)" }} />
                ))}
                {(openInstances.length + minimizedInstances.length) > 4 && <div style={{ color: "var(--text-muted)", fontSize: 10, marginLeft: 4 }}>+{(openInstances.length + minimizedInstances.length)-4}</div>}
              </div>
            )}
            {hoverPreview === app.id && minimizedInstances.length > 0 && (
              <div style={{ position: "absolute", bottom: 70, left: "50%", transform: "translateX(-50%)", minWidth: 220, background: "rgba(0,0,0,0.8)", color: "#fff", padding: 8, borderRadius: 8, boxShadow: "0 12px 40px rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 2000 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{app.label}</div>
                {minimizedInstances.map((w) => (
                  <div key={w.id} onClick={() => { restoreWindow(w.id); }} style={{ padding: 6, borderRadius: 6, cursor: "pointer", background: "transparent", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{w.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{w.appState?.currentPath || w.appState?.initialPath || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}