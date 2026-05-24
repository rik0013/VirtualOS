import React, { useState } from "react";
import { Terminal } from "../apps/Terminal";
import { Settings } from "../apps/Settings";

export const DOCK_APPS = [
  { id: "terminal", icon: "terminal", label: "Terminal" },
  { id: "files", icon: "finder", label: "Files" },
  { id: "editor", icon: "editor", label: "Editor" },
  { id: "settings", icon: "settings", label: "Settings" },
];

/* ============================================================
 * ICONS (macOS inspired SVGs)
 * ============================================================ */
export const MacIcon = ({ type, size = 52, ...props }) => {
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))", transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)", ...props.style }}>
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
      {type === "settings" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <rect x="5" y="5" width="90" height="90" rx="20" fill="url(#bgGradSet)" stroke="#B3B3B3" strokeWidth="1"/>
          <circle cx="50" cy="50" r="30" fill="url(#gearLayer)" stroke="#7A7A7A" strokeWidth="3"/>
          <circle cx="50" cy="50" r="14" fill="#3D3D3D" stroke="#222" strokeWidth="2"/>
          <path d="M44 20h12v12H44zM44 68h12v12H44zM20 44h12v12H20zM68 44h12v12H68zM26 26l8 8-8 8z" fill="#AAA"/>
          <defs>
            <linearGradient id="bgGradSet" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5F5F5"/>
              <stop offset="1" stopColor="#D4D4D4"/>
            </linearGradient>
            <linearGradient id="gearLayer" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#B5B5B5"/>
              <stop offset="1" stopColor="#7E7E7E"/>
            </linearGradient>
          </defs>
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
    </div>
  );
};

export function Dock({ onOpen }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 24, padding: "10px 14px", display: "flex", gap: 10, zIndex: 500, boxShadow: "0 10px 40px rgba(0,0,0,0.25)" }}>
      {DOCK_APPS.map((app) => {
        const isHovered = hovered === app.id;
        return (
          <button 
            key={app.id} 
            onClick={() => onOpen(app.id)} 
            onMouseEnter={() => setHovered(app.id)} 
            onMouseLeave={() => setHovered(null)} 
            title={app.label}
            style={{ 
              width: isHovered ? 56 : 44, 
              height: isHovered ? 56 : 44, 
              borderRadius: 12, 
              background: "transparent", 
              border: "none", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)", 
              marginBottom: isHovered ? -12 : 0,
              transform: isHovered ? "translateY(-8px)" : "translateY(0)",
              cursor: "pointer",
              outline: "none"
            }}>
            <MacIcon type={app.icon} size={isHovered ? 56 : 44} />
          </button>
        );
      })}
    </div>
  );
}