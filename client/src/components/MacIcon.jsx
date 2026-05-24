import React from "react";

export const DOCK_APPS = [
  { id: "terminal", icon: "terminal", label: "Terminal" },
  { id: "files", icon: "finder", label: "Files" },
  { id: "editor", icon: "editor", label: "Editor" },
  { id: "settings", icon: "settings", label: "Settings" },
];

export const MacIcon = ({ type, size = 52, color = "currentColor", ...props }) => {
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
      {(type === "file" || type === "document") && (
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
