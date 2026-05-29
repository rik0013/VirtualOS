import React, { useState } from "react";

export const DOCK_APPS = [
  { id: "terminal", icon: "terminal", label: "Terminal" },
  { id: "files", icon: "finder", label: "Files" },
  { id: "editor", icon: "editor", label: "Editor" },
  { id: "assistant", icon: "assistant", label: "Assistant" },
  { id: "settings", icon: "settings", label: "Settings" },
];

export const MacIcon = ({ type, size = 52, color = "currentColor", ...props }) => {
  const [loadError, setLoadError] = useState(false);

  const getIconUrl = (t) => {
    const base = "https://raw.githubusercontent.com/PuruVJ/macos-web/main/public/app-icons/";
    switch(t) {
      case "finder": return `${base}finder/256.png`;
      case "terminal": return `${base}terminal/256.png`;
      case "editor": return `${base}textedit/256.png`;
      case "settings": return `${base}system-preferences/256.png`;
      case "folder": return `${base}finder/256.png`;
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
      {(type === "file" || type === "document") && (
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
            <linearGradient id="launchBgShared" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c4b5fd" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#launchBgShared)" />
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
            <linearGradient id="musicBg" x1="20" y1="15" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff9a3c" />
              <stop offset="1" stopColor="#d9480f" />
            </linearGradient>
            <linearGradient id="musicDisc" x1="35" y1="28" x2="70" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="1" stopColor="#f3f4f6" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="84" height="84" rx="20" fill="url(#musicBg)" />
          <circle cx="50" cy="50" r="24" fill="url(#musicDisc)" opacity="0.95" />
          <circle cx="50" cy="50" r="6" fill="#d9480f" />
          <path d="M56 26v28.5c0 4.2-3.8 7.5-8.5 7.5s-8.5-3.3-8.5-7.5 3.8-7.5 8.5-7.5c1.8 0 3.4.4 4.8 1.1V32l18-4v10.5" stroke="#7c2d12" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M70 26l-14 4" stroke="#7c2d12" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )}
      {type === "browser" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <linearGradient id="browserBg" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6ea8ff" />
              <stop offset="1" stopColor="#2457d6" />
            </linearGradient>
            <linearGradient id="browserGlass" x1="35" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="1" stopColor="#dbeafe" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="84" height="84" rx="20" fill="url(#browserBg)" />
          <rect x="18" y="24" width="64" height="50" rx="10" fill="url(#browserGlass)" stroke="#1e3a8a" strokeWidth="3" />
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
            <linearGradient id="assistantBgShared" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7c3aed" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="assistantGlowShared" x1="28" y1="26" x2="72" y2="74" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.96" />
              <stop offset="1" stopColor="#dbeafe" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#assistantBgShared)" />
          <path d="M50 18l6 12 13 6-13 6-6 12-6-12-13-6 13-6 6-12Z" fill="url(#assistantGlowShared)" opacity="0.96" />
          <circle cx="50" cy="56" r="18" fill="rgba(255,255,255,0.18)" />
          <circle cx="43" cy="54" r="2.8" fill="#fff" />
          <circle cx="57" cy="54" r="2.8" fill="#fff" />
          <path d="M42 62c2.5 3 5.4 4.5 8 4.5s5.5-1.5 8-4.5" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}
      {type === "settings" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <linearGradient id="settingsBgFallbackShared" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f3f4f6" />
              <stop offset="1" stopColor="#c7cdd6" />
            </linearGradient>
            <linearGradient id="settingsPanelFallbackShared" x1="22" y1="20" x2="78" y2="82" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#e5e7eb" />
            </linearGradient>
            <linearGradient id="settingsGearFallbackShared" x1="30" y1="28" x2="70" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b919a" />
              <stop offset="1" stopColor="#545b66" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#settingsBgFallbackShared)" />
          <rect x="16" y="16" width="68" height="68" rx="20" fill="url(#settingsPanelFallbackShared)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="20" fill="url(#settingsGearFallbackShared)" stroke="#2f3640" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="9" fill="#2b3139" stroke="#1d2228" strokeWidth="1.5" />
          <path d="M50 28v8M50 64v8M28 50h8M64 50h8M34 34l6 6M60 60l6 6M34 66l6-6M60 40l6-6" stroke="#6b7280" strokeWidth="4" strokeLinecap="round" />
          <circle cx="36" cy="34" r="5" fill="rgba(255,255,255,0.35)" />
        </svg>
      )}
      {type === "trash" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <path d="M30 30l5 55c0 5 5 5 15 5h0c10 0 15 0 15-5l5-55H30z" fill="url(#trashGrad)" stroke="#999" strokeWidth="3" strokeLinejoin="round"/>
          <path d="M20 30h60" stroke="#CCC" strokeWidth="6" strokeLinecap="round"/>
          <path d="M40 30v-5c0-3 3-5 10-5 7 0 10 2 10 5v5" fill="none" stroke="#CCC" strokeWidth="4" strokeLinecap="round"/>
          <path d="M40 45v30M50 45v30M60 45v30" stroke="#F5F5F5" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
          <defs>
             <linearGradient id="trashGrad" x1="50" y1="30" x2="50" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5F5F7"/>
              <stop offset="1" stopColor="#D9D9DF"/>
            </linearGradient>
          </defs>
        </svg>
      )}
      {type === "home" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <path d="M50 15L15 45h10v40h15V60h20v25h15V45h10L50 15z" fill="url(#blueGrad)" />
          <defs>
             <linearGradient id="blueGrad" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#63b3ed"/>
              <stop offset="1" stopColor="#2b6cb0"/>
            </linearGradient>
          </defs>
        </svg>
      )}
      {type === "desktop" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <rect x="10" y="20" width="80" height="50" rx="8" fill="url(#monitorGrad)" stroke="#444" strokeWidth="4" />
          <path d="M40 70h20v15H40z" fill="#666" />
          <path d="M25 85h50" stroke="#444" strokeWidth="6" strokeLinecap="round" />
          <defs>
             <linearGradient id="monitorGrad" x1="50" y1="20" x2="50" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e2e8f0"/>
              <stop offset="1" stopColor="#a0aec0"/>
            </linearGradient>
          </defs>
        </svg>
      )}
      {type === "save" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <path d="M15 15h50l20 20v50H15V15z" fill="url(#saveGrad)" />
          <rect x="25" y="15" width="40" height="25" fill="#FFF" />
          <rect x="30" y="55" width="40" height="30" fill="#e2e8f0" />
          <defs>
             <linearGradient id="saveGrad" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4fd1c5"/>
              <stop offset="1" stopColor="#2c7a7b"/>
            </linearGradient>
          </defs>
        </svg>
      )}
      {type === "user" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <circle cx="50" cy="35" r="20" fill="url(#blueGrad)" />
          <path d="M20 90c0-20 15-30 30-30s30 10 30 30" fill="url(#blueGrad)" stroke="url(#blueGrad)" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      )}
      {(type === "moon" || type === "theme-dark") && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <path d="M50 15A35 35 0 0085 70a45 45 0 11-35-55z" fill="#f6e05e" />
        </svg>
      )}
      {(type === "sun" || type === "theme-light") && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <circle cx="50" cy="50" r="20" fill="#f6e05e" />
          <path d="M50 10v10M50 80v10M10 50h10M80 50h10M22 22l7 7M71 71l7 7M22 78l7-7M71 29l7-7" stroke="#f6e05e" strokeWidth="6" strokeLinecap="round"/>
        </svg>
      )}
      {type === "copy" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <rect x="35" y="35" width="45" height="50" rx="4" fill="#a0aec0" />
          <path d="M20 25h45v40H20V25z" fill="#edf2f7" stroke="#cbd5e0" strokeWidth="4"/>
          <path d="M30 40h20M30 50h15" stroke="#a0aec0" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      )}
      {type === "success" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <circle cx="50" cy="50" r="40" fill="#48bb78" />
          <path d="M30 50l15 15 25-25" stroke="#FFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {type === "error" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <circle cx="50" cy="50" r="40" fill="#f56565" />
          <path d="M35 35l30 30M65 35l-30 30" stroke="#FFF" strokeWidth="8" strokeLinecap="round"/>
        </svg>
      )}
      {type === "smile" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <circle cx="50" cy="50" r="40" fill="#f6e05e" />
          <circle cx="35" cy="40" r="5" fill="#4a5568" />
          <circle cx="65" cy="40" r="5" fill="#4a5568" />
          <path d="M30 60q20 20 40 0" stroke="#4a5568" strokeWidth="6" strokeLinecap="round" fill="none"/>
        </svg>
      )}
      {type === "rename" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <path d="M75 25l10 10L40 80 20 85l5-20L75 25z" fill="url(#penGrad)" stroke="#4a5568" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M65 15q15-15 30 0l-10 10z" fill="#fc8181" stroke="#4a5568" strokeWidth="2" />
          <path d="M20 85l5-20 15 15z" fill="#4a5568" />
        </svg>
      )}
      {type === "open" && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <path d="M40 20H20v60h60V60M50 50l30-30m0 0H60m20 0v20" stroke="#4a5568" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
};
