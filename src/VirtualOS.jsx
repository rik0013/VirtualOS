import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// THEME
// ============================================================
const THEMES = {
  dark: {
    "--bg-window": "rgba(28,30,40,0.92)",
    "--bg-titlebar": "rgba(20,22,30,0.98)",
    "--bg-dock": "rgba(255,255,255,0.08)",
    "--bg-menubar": "rgba(15,17,23,0.92)",
    "--bg-input": "rgba(255,255,255,0.06)",
    "--bg-hover": "rgba(255,255,255,0.07)",
    "--bg-selected": "rgba(99,179,237,0.18)",
    "--bg-context": "rgba(28,30,40,0.98)",
    "--border": "rgba(255,255,255,0.08)",
    "--border-strong": "rgba(255,255,255,0.15)",
    "--text-primary": "#e8eaf0",
    "--text-secondary": "#8b90a0",
    "--text-muted": "#555a6b",
    "--accent": "#63b3ed",
    "--accent-green": "#68d391",
    "--accent-yellow": "#f6e05e",
    "--accent-red": "#fc8181",
    "--shadow": "0 8px 32px rgba(0,0,0,0.6)",
    "--shadow-sm": "0 2px 8px rgba(0,0,0,0.4)",
    "--terminal-bg": "#0a0c10",
    "--terminal-text": "#a8ff78",
    "--scrollbar": "rgba(255,255,255,0.1)",
  },
  light: {
    "--bg-window": "rgba(245,246,250,0.96)",
    "--bg-titlebar": "rgba(230,232,240,0.98)",
    "--bg-dock": "rgba(255,255,255,0.55)",
    "--bg-menubar": "rgba(240,241,246,0.94)",
    "--bg-input": "rgba(0,0,0,0.05)",
    "--bg-hover": "rgba(0,0,0,0.05)",
    "--bg-selected": "rgba(59,130,246,0.15)",
    "--bg-context": "rgba(245,246,250,0.98)",
    "--border": "rgba(0,0,0,0.08)",
    "--border-strong": "rgba(0,0,0,0.15)",
    "--text-primary": "#1a1d27",
    "--text-secondary": "#5a6075",
    "--text-muted": "#9aa0b5",
    "--accent": "#2b7fd4",
    "--accent-green": "#38a169",
    "--accent-yellow": "#d69e2e",
    "--accent-red": "#e53e3e",
    "--shadow": "0 8px 32px rgba(0,0,0,0.18)",
    "--shadow-sm": "0 2px 8px rgba(0,0,0,0.1)",
    "--terminal-bg": "#1a1d27",
    "--terminal-text": "#a8ff78",
    "--scrollbar": "rgba(0,0,0,0.15)",
  },
};

// ============================================================
// UTILS
// ============================================================
function djb2(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) hash = (hash * 33) ^ str.charCodeAt(i);
  return (hash >>> 0).toString(16);
}
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
function getNode(fs, path) {
  const parts = path.replace(/^\//, "").split("/").filter(Boolean);
  let node = fs;
  for (const p of parts) { if (node[p] === undefined) return null; node = node[p]; }
  return node;
}
function setNode(fs, path, value) {
  const clone = deepClone(fs);
  const parts = path.replace(/^\//, "").split("/").filter(Boolean);
  let node = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!node[parts[i]] || typeof node[parts[i]] !== "object") return clone;
    node = node[parts[i]];
  }
  node[parts[parts.length - 1]] = value;
  return clone;
}
function deleteNode(fs, path) {
  const clone = deepClone(fs);
  const parts = path.replace(/^\//, "").split("/").filter(Boolean);
  let node = clone;
  for (let i = 0; i < parts.length - 1; i++) { if (!node[parts[i]]) return clone; node = node[parts[i]]; }
  delete node[parts[parts.length - 1]];
  return clone;
}
function listDir(fs, path) {
  const node = getNode(fs, path);
  if (!node || typeof node !== "object") return [];
  return Object.keys(node).map((name) => ({ name, isDir: typeof node[name] === "object" }));
}
function fuzzyMatch(str, query) { return str.toLowerCase().includes(query.toLowerCase()); }
function resolvePath(cwd, input) {
  if (input.startsWith("/")) return input;
  if (input === "..") { const parts = cwd.replace(/\/$/, "").split("/"); parts.pop(); return parts.join("/") || "/"; }
  if (input === ".") return cwd;
  return (cwd === "/" ? "" : cwd) + "/" + input;
}

// ============================================================
// DEFAULT FS
// ============================================================
function makeDefaultFS(username) {
  return {
    home: {
      [username]: {
        desktop: {
          "readme.txt": "Welcome to VirtualOS!\n\nThis file lives on your desktop.\nDouble-click to open, drag to reposition.\nRight-click the desktop for options.",
          projects: {},
        },
        documents: { "notes.txt": "Your notes go here." },
        pictures: {},
        downloads: {},
      },
    },
    etc: { hosts: "127.0.0.1 localhost\n::1 localhost" },
    tmp: {},
    trash: {},
  };
}

// ============================================================
// STORAGE
// ============================================================
const Storage = {
  getUsers: () => JSON.parse(localStorage.getItem("vos_users") || "[]"),
  saveUsers: (u) => localStorage.setItem("vos_users", JSON.stringify(u)),
  getFS: (u) => JSON.parse(localStorage.getItem("vos_fs_" + u) || "null"),
  saveFS: (u, fs) => localStorage.setItem("vos_fs_" + u, JSON.stringify(fs)),
  getPrefs: (u) => JSON.parse(localStorage.getItem("vos_prefs_" + u) || "null"),
  savePrefs: (u, p) => localStorage.setItem("vos_prefs_" + u, JSON.stringify(p)),
  getDesktopLayout: (u) => JSON.parse(localStorage.getItem("vos_desktop_" + u) || "null"),
  saveDesktopLayout: (u, l) => localStorage.setItem("vos_desktop_" + u, JSON.stringify(l)),
  getSession: () => JSON.parse(localStorage.getItem("vos_session") || "null"),
  saveSession: (s) => localStorage.setItem("vos_session", JSON.stringify(s)),
  clearSession: () => localStorage.removeItem("vos_session"),
};

function initStorage() {
  const users = Storage.getUsers();
  if (users.length === 0) {
    const u = { username: "user", passwordHash: djb2("user") };
    Storage.saveUsers([u]);
    Storage.saveFS(u.username, makeDefaultFS(u.username));
    Storage.savePrefs(u.username, { theme: "dark", wallpaper: "mesh", iconSize: "medium" });
  }
}

// ============================================================
// WALLPAPERS
// ============================================================
const WALLPAPERS = {
  mesh: `radial-gradient(ellipse at 20% 50%, #1a1f3c 0%, transparent 50%),radial-gradient(ellipse at 80% 20%, #0f2027 0%, transparent 50%),radial-gradient(ellipse at 60% 80%, #1a2a1a 0%, transparent 50%),linear-gradient(135deg, #0f1117 0%, #141828 50%, #0d1f0d 100%)`,
  aurora: `radial-gradient(ellipse at 30% 40%, #0d4f3c 0%, transparent 60%),radial-gradient(ellipse at 70% 60%, #1a0a3d 0%, transparent 60%),linear-gradient(160deg, #050a15 0%, #0a1628 100%)`,
  dusk: `radial-gradient(ellipse at 50% 0%, #2d1b4e 0%, transparent 60%),radial-gradient(ellipse at 80% 100%, #1a0a0a 0%, transparent 50%),linear-gradient(180deg, #1a0e2e 0%, #0f0a1a 50%, #1a1008 100%)`,
  ocean: `radial-gradient(ellipse at 20% 80%, #0a1f3d 0%, transparent 60%),radial-gradient(ellipse at 80% 20%, #0d2b3d 0%, transparent 60%),linear-gradient(135deg, #050f1f 0%, #0a1a2e 100%)`,
  forest: `radial-gradient(ellipse at 40% 60%, #0d2b1a 0%, transparent 60%),radial-gradient(ellipse at 70% 20%, #1a2b0d 0%, transparent 50%),linear-gradient(135deg, #070f08 0%, #0f1a0a 100%)`,
  crimson: `radial-gradient(ellipse at 30% 40%, #3d0d0d 0%, transparent 60%),radial-gradient(ellipse at 70% 70%, #1a0a1a 0%, transparent 60%),linear-gradient(135deg, #140505 0%, #1a0a0a 100%)`,
};

const ICON_SIZES = { small: 64, medium: 80, large: 100 };
const ICON_FONT = { small: 24, medium: 32, large: 42 };
const ICON_TEXT = { small: 10, medium: 11, large: 13 };

// ============================================================
// GLOBAL STYLES
// ============================================================
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { overflow: hidden; font-family: 'DM Sans', sans-serif; user-select: none; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--scrollbar); border-radius: 3px; }
    input, textarea { font-family: 'DM Sans', sans-serif; outline: none; border: none; background: none; color: var(--text-primary); }
    button { font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; background: none; color: var(--text-primary); }
    @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
    @keyframes windowOpen { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
    .window-open { animation: windowOpen 0.18s cubic-bezier(0.34,1.56,0.64,1); }
  `}</style>
);

// ============================================================
// SHARED CLIPBOARD
// ============================================================
const ClipboardCtx = { value: "", listeners: [] };
function setClipboard(text) {
  ClipboardCtx.value = text;
  ClipboardCtx.listeners.forEach((fn) => fn(text));
  try { navigator.clipboard.writeText(text); } catch (e) {}
}
function useClipboard() {
  const [val, setVal] = useState(ClipboardCtx.value);
  useEffect(() => {
    ClipboardCtx.listeners.push(setVal);
    return () => { ClipboardCtx.listeners = ClipboardCtx.listeners.filter((f) => f !== setVal); };
  }, []);
  return [val, setClipboard];
}

// ============================================================
// NOTIFICATIONS
// ============================================================
function NotificationSystem({ notifications }) {
  return (
    <div style={{ position: "fixed", bottom: 80, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {notifications.map((n) => (
        <div key={n.id} style={{
          background: "var(--bg-context)", border: "1px solid var(--border-strong)", borderRadius: 10,
          padding: "10px 14px", minWidth: 220, maxWidth: 300, boxShadow: "var(--shadow)",
          animation: "toastIn 0.2s ease", display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>{n.icon || "📋"}</span>
          <div>
            {n.title && <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{n.title}</div>}
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{n.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// LOGIN
// ============================================================
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "" });

  const handleLogin = () => {
    const users = Storage.getUsers();
    const user = users.find((u) => u.username === username && u.passwordHash === djb2(password));
    if (!user) { setError("Invalid username or password"); return; }
    Storage.saveSession({ currentUser: username, loginTime: Date.now() });
    onLogin(user);
  };

  const handleCreate = () => {
    if (!newUser.username || !newUser.password) { setError("Fill all fields"); return; }
    const users = Storage.getUsers();
    if (users.find((u) => u.username === newUser.username)) { setError("Username taken"); return; }
    const updated = [...users, { username: newUser.username, passwordHash: djb2(newUser.password) }];
    Storage.saveUsers(updated);
    Storage.saveFS(newUser.username, makeDefaultFS(newUser.username));
    Storage.savePrefs(newUser.username, { theme: "dark", wallpaper: "mesh", iconSize: "medium" });
    setShowCreate(false); setError(""); setUsername(newUser.username);
    setNewUser({ username: "", password: "" });
  };

  const inp = (extra) => ({
    style: {
      width: "100%", background: "var(--bg-input)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "var(--text-primary)", marginBottom: 10,
    }, ...extra
  });

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: WALLPAPERS.mesh }}>
      <div style={{ width: 340, background: "var(--bg-window)", border: "1px solid var(--border-strong)", borderRadius: 20, padding: 36, boxShadow: "var(--shadow)", animation: "slideUp 0.3s ease", backdropFilter: "blur(24px)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🖥️</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>VirtualOS</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{showCreate ? "Create account" : "Sign in to continue"}</div>
        </div>
        {!showCreate ? (
          <>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" onKeyDown={(e) => e.key === "Enter" && handleLogin()} {...inp({})} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" onKeyDown={(e) => e.key === "Enter" && handleLogin()} {...inp({ style: { width: "100%", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "var(--text-primary)", marginBottom: error ? 8 : 16 } })} />
            {error && <div style={{ fontSize: 12, color: "var(--accent-red)", marginBottom: 12, textAlign: "center" }}>{error}</div>}
            <button onClick={handleLogin} style={{ width: "100%", background: "var(--accent)", color: "#fff", borderRadius: 10, padding: 11, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Sign In</button>
            <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-secondary)" }}>Default: user / user</div>
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button onClick={() => { setShowCreate(true); setError(""); }} style={{ fontSize: 13, color: "var(--accent)", textDecoration: "underline" }}>Create new account</button>
            </div>
          </>
        ) : (
          <>
            <input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} placeholder="Choose a username" {...inp({})} />
            <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Choose a password" onKeyDown={(e) => e.key === "Enter" && handleCreate()} {...inp({ style: { width: "100%", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "var(--text-primary)", marginBottom: 14 } })} />
            {error && <div style={{ fontSize: 12, color: "var(--accent-red)", marginBottom: 10 }}>{error}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setShowCreate(false); setError(""); }} style={{ flex: 1, padding: 10, borderRadius: 10, background: "var(--bg-input)", border: "1px solid var(--border)", fontSize: 14 }}>Cancel</button>
              <button onClick={handleCreate} style={{ flex: 1, padding: 10, borderRadius: 10, background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 600 }}>Create</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MENUBAR
// ============================================================
function Menubar({ activeApp, currentUser, onLogout, clipboardVal }) {
  const [time, setTime] = useState(new Date());
  const [showCal, setShowCal] = useState(false);
  const [showClip, setShowClip] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const now = time;
  const year = now.getFullYear(), month = now.getMonth();
  const monthName = now.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleCopyClipboard = () => {
    try { navigator.clipboard.writeText(clipboardVal); } catch (e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ height: 28, background: "var(--bg-menubar)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", position: "relative", zIndex: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.3px" }}>VOS</span>
        {activeApp && <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{activeApp}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Clipboard indicator */}
        <div style={{ position: "relative" }}>
          <button onClick={() => { setShowClip(!showClip); setShowCal(false); }}
            title="Clipboard" style={{ fontSize: 12, padding: "2px 8px", borderRadius: 5, background: clipboardVal ? "var(--bg-selected)" : "var(--bg-hover)", color: clipboardVal ? "var(--accent)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            📋 {clipboardVal ? <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}>{clipboardVal}</span> : <span>empty</span>}
          </button>
          {showClip && (
            <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", right: 0, top: 32, width: 280, background: "var(--bg-context)", border: "1px solid var(--border-strong)", borderRadius: 12, padding: 14, boxShadow: "var(--shadow)", zIndex: 2000, animation: "fadeIn 0.15s ease" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Clipboard</div>
              {clipboardVal ? (
                <>
                  <div style={{ fontSize: 12, color: "var(--text-primary)", background: "var(--bg-input)", borderRadius: 8, padding: "8px 10px", maxHeight: 100, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>{clipboardVal}</div>
                  <button onClick={handleCopyClipboard} style={{ width: "100%", padding: "7px", borderRadius: 7, background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 600 }}>{copied ? "✅ Copied!" : "Copy to system clipboard"}</button>
                </>
              ) : (
                <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>Nothing copied yet</div>
              )}
            </div>
          )}
        </div>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>' {currentUser?.username}</span>
        <div style={{ position: "relative" }}>
          <button onClick={() => { setShowCal(!showCal); setShowClip(false); }} style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>
            {now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} &nbsp; {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </button>
          {showCal && (
            <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", right: 0, top: 30, width: 220, background: "var(--bg-context)", border: "1px solid var(--border-strong)", borderRadius: 12, padding: 14, boxShadow: "var(--shadow)", zIndex: 2000, animation: "fadeIn 0.15s ease" }}>
              <div style={{ textAlign: "center", fontWeight: 600, fontSize: 13, marginBottom: 10, color: "var(--text-primary)" }}>{monthName} {year}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => <div key={d} style={{ fontSize: 10, color: "var(--text-muted)", padding: 3, fontWeight: 600 }}>{d}</div>)}
                {days.map((d, i) => <div key={i} style={{ fontSize: 11, padding: 4, borderRadius: 5, background: d === now.getDate() ? "var(--accent)" : "transparent", color: d === now.getDate() ? "#fff" : d ? "var(--text-primary)" : "transparent", fontWeight: d === now.getDate() ? 700 : 400 }}>{d || ""}</div>)}
              </div>
            </div>
          )}
        </div>
        <button onClick={onLogout} style={{ fontSize: 11, color: "var(--text-muted)", padding: "2px 8px", borderRadius: 5, background: "var(--bg-hover)" }}>Logout</button>
      </div>
    </div>
  );
}

// ============================================================
// DOCK
// ============================================================
const DOCK_APPS = [
  { id: "terminal", icon: "⌨️", label: "Terminal" },
  { id: "files", icon: "📁", label: "Files" },
  { id: "editor", icon: "📝", label: "Editor" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

function Dock({ onOpen }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ position: "fixed", bottom: 10, left: "50%", transform: "translateX(-50%)", background: "var(--bg-dock)", backdropFilter: "blur(24px)", border: "1px solid var(--border-strong)", borderRadius: 18, padding: "8px 14px", display: "flex", gap: 8, zIndex: 500, boxShadow: "var(--shadow)" }}>
      {DOCK_APPS.map((app) => (
        <button key={app.id} onClick={() => onOpen(app.id)} onMouseEnter={() => setHovered(app.id)} onMouseLeave={() => setHovered(null)} title={app.label}
          style={{ width: hovered === app.id ? 54 : 44, height: hovered === app.id ? 54 : 44, fontSize: hovered === app.id ? 28 : 22, borderRadius: 12, background: "var(--bg-input)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", marginBottom: hovered === app.id ? -10 : 0 }}>
          {app.icon}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// DESKTOP ICONS
// ============================================================
function DesktopIcons({ fs, desktopPath, layout, onLayoutChange, onOpenFile, onOpenFolder, onDelete, iconSize }) {
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
            <div style={{ fontSize: FONT, lineHeight: 1, marginBottom: 5, pointerEvents: "none" }}>{item.isDir ? "📁" : "📝"}</div>
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

// ============================================================
// WINDOW FRAME
// ============================================================
function WindowFrame({ win, onClose, onMinimize, onMaximize, onFocus, onUpdatePos, onUpdateSize, children, isActive }) {
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

  if (win.minimized) return null;
  const isMax = win.maximized;
  const wStyle = isMax
    ? { position: "fixed", left: 0, top: 28, width: "100vw", height: "calc(100vh - 28px)", zIndex: win.zIndex }
    : { position: "absolute", left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <div style={{ ...wStyle, background: "var(--bg-window)", border: "1px solid " + (isActive ? "var(--border-strong)" : "var(--border)"), borderRadius: isMax ? 0 : 12, overflow: "hidden", boxShadow: isActive ? "var(--shadow)" : "var(--shadow-sm)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column" }}
      className="window-open" onMouseDown={() => onFocus(win.id)}>
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

// ============================================================
// TERMINAL
// ============================================================
function Terminal({ fs, setFs, cwd, setCwd, currentUser, notify, onCopy }) {
  const [lines, setLines] = useState([{ type: "info", text: "VirtualOS Terminal — type 'help' for commands.\nClick any output line to copy it." }]);
  const [input, setInput] = useState("");
  const [cmdHist, setCmdHist] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [copiedLine, setCopiedLine] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  const push = (text, type = "output") => setLines((h) => [...h, { type, text }]);

  const copyLine = (text, idx) => {
    onCopy(text);
    setCopiedLine(idx);
    setTimeout(() => setCopiedLine(null), 1200);
  };

  const exec = (raw) => {
    const line = raw.trim(); if (!line) return;
    push(cwd + " $ " + line, "prompt");
    setCmdHist((h) => [line, ...h]); setHistIdx(-1);
    const [cmd, ...args] = line.split(/\s+/); const arg = args.join(" ");
    const cmds = {
      help: () => push("ls, cd, cat, echo, mkdir, touch, rm, pwd, whoami, clear, eval", "info"),
      pwd: () => push(cwd),
      whoami: () => push(currentUser.username),
      clear: () => setLines([]),
      ls: () => { const t = arg ? resolvePath(cwd, arg) : cwd; const items = listDir(fs, t); push(items.length ? items.map((i) => (i.isDir ? "📁 " + i.name + "/" : "📄 " + i.name)).join("  ") : "(empty)"); },
      cd: () => { if (!arg) { setCwd("/home/" + currentUser.username); return; } const t = resolvePath(cwd, arg); const n = getNode(fs, t); if (n === null || typeof n !== "object") { push("cd: no such directory: " + arg, "error"); return; } setCwd(t); },
      cat: () => { if (!arg) { push("Usage: cat <file>", "error"); return; } const p = resolvePath(cwd, arg); const n = getNode(fs, p); if (n === null) { push("cat: No such file: " + arg, "error"); return; } if (typeof n === "object") { push("cat: Is a directory: " + arg, "error"); return; } push(n); },
      echo: () => push(arg),
      mkdir: () => { if (!arg) { push("Usage: mkdir <dir>", "error"); return; } setFs(setNode(fs, resolvePath(cwd, arg), {})); notify({ icon: "📁", message: "Created " + arg }); },
      touch: () => { if (!arg) { push("Usage: touch <file>", "error"); return; } setFs(setNode(fs, resolvePath(cwd, arg), "")); notify({ icon: "📄", message: "Created " + arg }); },
      rm: () => { if (!arg) { push("Usage: rm <file>", "error"); return; } const p = resolvePath(cwd, arg); if (getNode(fs, p) === null) { push("rm: No such file: " + arg, "error"); return; } setFs(deleteNode(fs, p)); push("Removed " + arg); },
      eval: () => {
        if (line === "sudo rm -rf /") { push("💥 SYSTEM DESTRUCTION INITIATED...", "error"); setTimeout(() => push("just kidding 😄", "info"), 800); return; }
        try { push(String(Function('"use strict"; return (' + arg + ')')())); } catch (e) { push("Error: " + e.message, "error"); }
      },
    };
    if (cmds[cmd]) cmds[cmd](); else push("Command not found: " + cmd, "error");
  };

  const colors = { prompt: "var(--accent)", output: "var(--terminal-text)", error: "var(--accent-red)", info: "var(--text-secondary)" };

  return (
    <div onClick={() => inputRef.current?.focus()} style={{ width: "100%", height: "100%", background: "var(--terminal-bg)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: 14, overflowY: "auto", cursor: "text" }}>
      {lines.map((h, i) => (
        <div key={i} onClick={(e) => { e.stopPropagation(); if (h.type !== "prompt") copyLine(h.text, i); }}
          title={h.type !== "prompt" ? "Click to copy" : ""}
          style={{ color: copiedLine === i ? "var(--accent-yellow)" : colors[h.type], lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all", cursor: h.type !== "prompt" ? "pointer" : "default", borderRadius: 4, padding: "1px 2px", transition: "color 0.2s" }}>
          {copiedLine === i ? "✅ copied!" : h.text}
        </div>
      ))}
      {suggestions.length > 0 && <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{suggestions.join("  ")}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "var(--accent)", flexShrink: 0 }}>{cwd} $</span>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { exec(input); setInput(""); setSuggestions([]); }
            else if (e.key === "ArrowUp") { const idx = Math.min(histIdx + 1, cmdHist.length - 1); setHistIdx(idx); setInput(cmdHist[idx] || ""); }
            else if (e.key === "ArrowDown") { const idx = Math.max(histIdx - 1, -1); setHistIdx(idx); setInput(idx === -1 ? "" : cmdHist[idx] || ""); }
            else if (e.key === "Tab") {
              e.preventDefault();
              const parts = input.split(" "); const last = parts[parts.length - 1]; if (!last) return;
              const matches = listDir(fs, cwd).filter((i) => i.name.startsWith(last));
              if (matches.length === 1) { parts[parts.length - 1] = matches[0].name + (matches[0].isDir ? "/" : ""); setInput(parts.join(" ")); setSuggestions([]); }
              else if (matches.length > 1) setSuggestions(matches.map((m) => m.name));
            }
          }}
          autoFocus spellCheck={false}
          style={{ flex: 1, background: "none", color: "var(--terminal-text)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, caretColor: "var(--accent-green)" }} />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}

// ============================================================
// FILE EXPLORER
// ============================================================
function FileExplorer({ fs, setFs, onOpenFile, currentUser, notify, initialPath }) {
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
              <div style={{ fontSize: 28, marginBottom: 4 }}>{item.isDir ? "📁" : "📝"}</div>
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

// ============================================================
// TEXT EDITOR " with copy button
// ============================================================
function TextEditor({ initialPath, initialContent, fs, setFs, notify, onCopy }) {
  const [content, setContent] = useState(initialContent || "");
  const [path] = useState(initialPath || "");
  const [saved, setSaved] = useState(true);
  const [selectionCopied, setSelectionCopied] = useState(false);
  const textareaRef = useRef(null);

  const save = () => {
    if (!path) return;
    setFs(setNode(fs, path, content));
    setSaved(true);
    notify({ icon: "💾", title: "Saved", message: path.split("/").pop() });
  };

  const copySelection = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const sel = ta.value.substring(ta.selectionStart, ta.selectionEnd);
    const textToCopy = sel || content;
    onCopy(textToCopy);
    setSelectionCopied(true);
    setTimeout(() => setSelectionCopied(false), 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-window)" }}>
      <div style={{ padding: "6px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{path || "Untitled"}{!saved ? " •" : ""}</span>
        <button onClick={copySelection} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "var(--bg-input)", border: "1px solid var(--border)", color: selectionCopied ? "var(--accent-green)" : "var(--text-secondary)" }}>
          {selectionCopied ? "✅ Copied" : "Copy"}
        </button>
        <button onClick={save} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, background: "var(--accent)", color: "#fff", fontWeight: 600 }}>Save</button>
      </div>
      <textarea ref={textareaRef} value={content} onChange={(e) => { setContent(e.target.value); setSaved(false); }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(); }
          if ((e.ctrlKey || e.metaKey) && e.key === "c") {
            const ta = textareaRef.current;
            if (ta) { const sel = ta.value.substring(ta.selectionStart, ta.selectionEnd); if (sel) onCopy(sel); }
          }
        }}
        style={{ flex: 1, resize: "none", background: "var(--bg-window)", color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: 16, lineHeight: 1.7, border: "none", outline: "none", userSelect: "text" }} />
      <div style={{ padding: "4px 14px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>
        Ctrl+S save · Ctrl+C copy selection · or use Copy button above
      </div>
    </div>
  );
}

// ============================================================
// SETTINGS APP
// ============================================================
function Settings({ prefs, setPrefs, currentUser, notify }) {
  const [tab, setTab] = useState("appearance");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [newUsername, setNewUsername] = useState(currentUser.username);
  const [pwMsg, setPwMsg] = useState(null);

  const changeCredentials = () => {
    const users = Storage.getUsers();
    const idx = users.findIndex((u) => u.username === currentUser.username);
    if (idx === -1) return;
    if (users[idx].passwordHash !== djb2(oldPw)) { setPwMsg({ ok: false, text: "Current password incorrect" }); return; }
    if (newPw && newPw !== newPw2) { setPwMsg({ ok: false, text: "New passwords don't match" }); return; }
    if (newUsername !== currentUser.username) {
      if (users.find((u, i) => u.username === newUsername && i !== idx)) { setPwMsg({ ok: false, text: "Username already taken" }); return; }
    }
    const updated = [...users];
    updated[idx] = { username: newUsername, passwordHash: newPw ? djb2(newPw) : updated[idx].passwordHash };
    Storage.saveUsers(updated);
    // migrate FS/prefs to new username
    if (newUsername !== currentUser.username) {
      const fs = Storage.getFS(currentUser.username);
      const p = Storage.getPrefs(currentUser.username);
      const dl = Storage.getDesktopLayout(currentUser.username);
      Storage.saveFS(newUsername, fs);
      Storage.savePrefs(newUsername, p);
      Storage.saveDesktopLayout(newUsername, dl);
    }
    Storage.saveSession({ currentUser: newUsername, loginTime: Date.now() });
    setPwMsg({ ok: true, text: "Saved! Reloading..." });
    setTimeout(() => window.location.reload(), 1200);
  };

  const inp = { style: { width: "100%", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--text-primary)", marginBottom: 10 } };
  const tabs = [{ id: "appearance", label: "Appearance", icon: "🎨" }, { id: "account", label: "Account", icon: "👤" }];

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg-window)" }}>
      {/* Sidebar */}
      <div style={{ width: 160, borderRight: "1px solid var(--border)", padding: "16px 8px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, padding: "0 8px", textTransform: "uppercase", letterSpacing: 1 }}>Settings</div>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", borderRadius: 8, fontSize: 13, color: tab === t.id ? "var(--accent)" : "var(--text-secondary)", background: tab === t.id ? "var(--bg-selected)" : "transparent", textAlign: "left", marginBottom: 2 }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {tab === "appearance" && (
          <>
            {/* Theme */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Theme</div>
              <div style={{ display: "flex", gap: 10 }}>
                {["dark", "light"].map((t) => (
                  <button key={t} onClick={() => setPrefs({ ...prefs, theme: t })}
                    style={{ flex: 1, padding: "14px", borderRadius: 12, background: t === "dark" ? "#0f1117" : "#e8ecf4", border: "2px solid " + (prefs.theme === t ? "var(--accent)" : "var(--border)"), cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 20 }}>{t === "dark" ? "🌙" : "☀️"}</span>
                    <span style={{ fontSize: 12, color: t === "dark" ? "#e8eaf0" : "#1a1d27", fontWeight: prefs.theme === t ? 600 : 400 }}>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallpaper */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Wallpaper</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {Object.keys(WALLPAPERS).map((name) => (
                  <button key={name} onClick={() => setPrefs({ ...prefs, wallpaper: name })}
                    style={{ height: 72, borderRadius: 10, background: WALLPAPERS[name], border: "2px solid " + (prefs.wallpaper === name ? "var(--accent)" : "transparent"), cursor: "pointer", overflow: "hidden", position: "relative" }}>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "3px 6px", background: "rgba(0,0,0,0.5)" }}>
                      <span style={{ fontSize: 10, color: "#fff", textTransform: "capitalize" }}>{name}</span>
                    </div>
                    {prefs.wallpaper === name && <div style={{ position: "absolute", top: 4, right: 4, fontSize: 12 }}>"</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon size */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Desktop Icon Size</div>
              <div style={{ display: "flex", gap: 10 }}>
                {["small", "medium", "large"].map((s) => (
                  <button key={s} onClick={() => setPrefs({ ...prefs, iconSize: s })}
                    style={{ flex: 1, padding: "12px 8px", borderRadius: 10, border: "2px solid " + ((prefs.iconSize || "medium") === s ? "var(--accent)" : "var(--border)"), background: (prefs.iconSize || "medium") === s ? "var(--bg-selected)" : "var(--bg-input)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: s === "small" ? 18 : s === "medium" ? 24 : 32 }}>"</span>
                    <span style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: (prefs.iconSize || "medium") === s ? 600 : 400 }}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "account" && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Change Username / Password</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Leave new password blank to keep current password.</div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>New username</label>
            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Username" {...inp} />
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Current password</label>
            <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="Required to save changes" {...inp} />
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>New password (optional)</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Leave blank to keep current" {...inp} />
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Confirm new password</label>
            <input type="password" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} placeholder="Repeat new password" {...inp} />
            {pwMsg && <div style={{ fontSize: 12, color: pwMsg.ok ? "var(--accent-green)" : "var(--accent-red)", marginBottom: 12 }}>{pwMsg.text}</div>}
            <button onClick={changeCredentials} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600 }}>Save Changes</button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SEARCH MODAL
// ============================================================
function SearchModal({ fs, onClose, onOpenApp, onOpenFile }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);

  const appResults = DOCK_APPS.filter((a) => fuzzyMatch(a.label, query));
  const fileResults = [];
  const walk = (node, path) => {
    if (typeof node !== "object") return;
    Object.keys(node).forEach((key) => {
      const fp = (path === "/" ? "" : path) + "/" + key;
      if (fuzzyMatch(key, query)) fileResults.push({ name: key, path: fp, isDir: typeof node[key] === "object" });
      if (typeof node[key] === "object") walk(node[key], fp);
    });
  };
  if (query.length > 0) walk(fs, "/");
  const hasResults = appResults.length > 0 || fileResults.length > 0;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 100, backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 520, background: "var(--bg-context)", border: "1px solid var(--border-strong)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)", animation: "slideUp 0.18s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: query ? "1px solid var(--border)" : "none" }}>
          <span style={{ fontSize: 16 }}>"</span>
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search apps and files..."
            style={{ flex: 1, fontSize: 16, color: "var(--text-primary)", background: "none" }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)", padding: "2px 6px", border: "1px solid var(--border)", borderRadius: 4 }}>Esc</span>
        </div>
        {query && (
          <div style={{ maxHeight: 360, overflowY: "auto", padding: "8px 0" }}>
            {!hasResults && <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No results for "{query}"</div>}
            {appResults.length > 0 && <>
              <div style={{ padding: "4px 18px 6px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Apps</div>
              {appResults.map((a) => (
                <button key={a.id} onClick={() => { onOpenApp(a.id); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "8px 18px", background: "transparent", textAlign: "left" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{a.label}</span>
                </button>
              ))}
            </>}
            {fileResults.length > 0 && <>
              <div style={{ padding: "4px 18px 6px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Files</div>
              {fileResults.slice(0, 8).map((f) => (
                <button key={f.path} onClick={() => { if (!f.isDir) { onOpenFile(f.path, getNode(fs, f.path), f.name); } onClose(); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "8px 18px", background: "transparent", textAlign: "left" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontSize: 16 }}>{f.isDir ? "📁" : "📝"}</span>
                  <div><div style={{ fontSize: 13, color: "var(--text-primary)" }}>{f.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.path}</div></div>
                </button>
              ))}
            </>}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CONTEXT MENU (desktop)
// ============================================================
function ContextMenu({ x, y, onClose, onNewFile, onNewFolder, onChangeWallpaper, onToggleTheme, theme }) {
  useEffect(() => { const h = () => onClose(); window.addEventListener("click", h); return () => window.removeEventListener("click", h); }, [onClose]);
  const items = [
    { label: "New File", icon: "📝", action: onNewFile },
    { label: "New Folder", icon: "📁", action: onNewFolder },
    { divider: true },
    { label: theme === "dark" ? "Light Mode" : "Dark Mode", icon: theme === "dark" ? "☀️" : "🌙", action: onToggleTheme },
  ];
  return (
    <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", left: x, top: y, zIndex: 4000, background: "var(--bg-context)", border: "1px solid var(--border-strong)", borderRadius: 10, overflow: "hidden", boxShadow: "var(--shadow)", minWidth: 180, animation: "fadeIn 0.12s ease" }}>
      {items.map((item, i) => item.divider
        ? <div key={i} style={{ height: 1, background: "var(--border)", margin: "3px 0" }} />
        : <button key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 14px", fontSize: 13, color: "var(--text-primary)", background: "transparent", textAlign: "left" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}><span>{item.icon}</span>{item.label}</button>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
let winIdCounter = 1;

export default function VirtualOS() {
  useEffect(() => { initStorage(); }, []);

  const [currentUser, setCurrentUser] = useState(() => {
    const s = Storage.getSession();
    if (s) { const users = Storage.getUsers(); return users.find((u) => u.username === s.currentUser) || null; }
    return null;
  });

  const [prefs, setPrefsState] = useState(() => {
    if (!currentUser) return { theme: "dark", wallpaper: "mesh", iconSize: "medium" };
    return Storage.getPrefs(currentUser.username) || { theme: "dark", wallpaper: "mesh", iconSize: "medium" };
  });

  const [fs, setFsState] = useState(() => {
    if (!currentUser) return makeDefaultFS("user");
    return Storage.getFS(currentUser.username) || makeDefaultFS(currentUser.username);
  });

  const [desktopLayout, setDesktopLayoutState] = useState(() => {
    if (!currentUser) return {};
    return Storage.getDesktopLayout(currentUser.username) || {};
  });

  const [cwd, setCwd] = useState(() => currentUser ? "/home/" + currentUser.username : "/");
  const [windows, setWindows] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [clipboardVal, setClipboardVal] = useClipboard();

  useEffect(() => {
    const vars = THEMES[prefs.theme] || THEMES.dark;
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [prefs.theme]);

  const setFs = useCallback((newFs) => { setFsState(newFs); if (currentUser) Storage.saveFS(currentUser.username, newFs); }, [currentUser]);
  const setPrefs = useCallback((newPrefs) => { setPrefsState(newPrefs); if (currentUser) Storage.savePrefs(currentUser.username, newPrefs); }, [currentUser]);
  const setDesktopLayout = useCallback((l) => { setDesktopLayoutState(l); if (currentUser) Storage.saveDesktopLayout(currentUser.username, l); }, [currentUser]);

  const notify = useCallback(({ icon, title, message }) => {
    const id = Date.now();
    setNotifications((n) => [...n, { id, icon, title, message }]);
    setTimeout(() => setNotifications((n) => n.filter((x) => x.id !== id)), 3000);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.altKey && e.key === "t") { e.preventDefault(); openApp("terminal"); }
      if ((e.ctrlKey || e.metaKey) && e.key === " ") { e.preventDefault(); setShowSearch((v) => !v); }
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        const top = [...windows].sort((a, b) => b.zIndex - a.zIndex)[0];
        if (top) closeWindow(top.id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [windows]);

  const openApp = useCallback((appId, extra = {}) => {
    const existing = windows.find((w) => w.appId === appId && !extra.forceNew);
    if (existing) { setWindows((ws) => ws.map((w) => w.id === existing.id ? { ...w, minimized: false, zIndex: winIdCounter++ } : w)); return; }
    const configs = {
      terminal: { title: "Terminal", width: 620, height: 400 },
      files: { title: "File Explorer", width: 700, height: 480 },
      editor: { title: extra.filename || "Text Editor", width: 560, height: 440 },
      settings: { title: "Settings", width: 580, height: 460 },
    };
    const cfg = configs[appId] || { title: appId, width: 500, height: 380 };
    const id = winIdCounter++;
    setWindows((ws) => [...ws, { id, appId, ...cfg, ...extra, x: 80 + (id % 6) * 30, y: 50 + (id % 5) * 25, zIndex: winIdCounter++, minimized: false, maximized: false }]);
  }, [windows]);

  const openFile = useCallback((path, content, filename) => {
    const id = winIdCounter++;
    setWindows((ws) => [...ws, { id, appId: "editor", title: filename, width: 560, height: 440, x: 100 + (id % 5) * 25, y: 60 + (id % 4) * 25, zIndex: winIdCounter++, minimized: false, maximized: false, initialPath: path, initialContent: content }]);
  }, []);

  const openFolder = useCallback((path, name) => {
    const id = winIdCounter++;
    setWindows((ws) => [...ws, { id, appId: "files", title: name, width: 700, height: 480, x: 120 + (id % 5) * 25, y: 70 + (id % 4) * 25, zIndex: winIdCounter++, minimized: false, maximized: false, initialPath: path }]);
  }, [windows]);

  const closeWindow = (id) => setWindows((ws) => ws.filter((w) => w.id !== id));
  const minimizeWindow = (id) => setWindows((ws) => ws.map((w) => w.id === id ? { ...w, minimized: true } : w));
  const maximizeWindow = (id) => setWindows((ws) => ws.map((w) => w.id === id ? { ...w, maximized: !w.maximized } : w));
  const focusWindow = (id) => setWindows((ws) => ws.map((w) => w.id === id ? { ...w, zIndex: winIdCounter++ } : w));
  const updateWindowPos = (id, x, y) => setWindows((ws) => ws.map((w) => w.id === id ? { ...w, x, y } : w));
  const updateWindowSize = (id, width, height) => setWindows((ws) => ws.map((w) => w.id === id ? { ...w, width, height } : w));

  const handleLogout = () => { Storage.clearSession(); setCurrentUser(null); setWindows([]); };
  const handleLogin = (user) => {
    setCurrentUser(user);
    setPrefsState(Storage.getPrefs(user.username) || { theme: "dark", wallpaper: "mesh", iconSize: "medium" });
    setFsState(Storage.getFS(user.username) || makeDefaultFS(user.username));
    setDesktopLayoutState(Storage.getDesktopLayout(user.username) || {});
    setCwd("/home/" + user.username);
  };

  const handleDesktopRightClick = (e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }); };
  const closeContextMenu = () => setContextMenu(null);
  const handleNewFile = () => {
    const name = "new_file_" + Date.now() + ".txt";
    const path = "/home/" + currentUser.username + "/desktop/" + name;
    setFs(setNode(fs, path, ""));
    notify({ icon: "📝", message: "Created " + name });
    closeContextMenu();
  };
  const handleNewFolder = () => {
    const name = "new_folder_" + Date.now();
    const path = "/home/" + currentUser.username + "/desktop/" + name;
    setFs(setNode(fs, path, {}));
    notify({ icon: "📁", message: "Created " + name });
    closeContextMenu();
  };
  const handleDeleteDesktopItem = (name) => {
    const path = "/home/" + currentUser.username + "/desktop/" + name;
    const trashPath = "/trash/" + name;
    const node = getNode(fs, path);
    if (node === null) return;
    let newFs = setNode(fs, trashPath, node);
    newFs = deleteNode(newFs, path);
    setFs(newFs);
    notify({ icon: "🗑️", message: "Moved to Trash: " + name });
  };

  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;

  const activeWindow = [...windows].sort((a, b) => b.zIndex - a.zIndex)[0];

  const appMap = {
    terminal: <Terminal fs={fs} setFs={setFs} cwd={cwd} setCwd={setCwd} currentUser={currentUser} notify={notify} onCopy={setClipboardVal} />,
    files: (win) => <FileExplorer fs={fs} setFs={setFs} onOpenFile={openFile} currentUser={currentUser} notify={notify} initialPath={win.initialPath} />,
    editor: (win) => <TextEditor initialPath={win.initialPath} initialContent={win.initialContent} fs={fs} setFs={setFs} notify={notify} onCopy={setClipboardVal} />,
    settings: <Settings prefs={prefs} setPrefs={setPrefs} currentUser={currentUser} notify={notify} />,
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: WALLPAPERS[prefs.wallpaper] || WALLPAPERS.mesh, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <GlobalStyle />
      <Menubar activeApp={activeWindow?.title} currentUser={currentUser} onLogout={handleLogout} clipboardVal={clipboardVal} />
      <main onContextMenu={handleDesktopRightClick} style={{ flex: 1, position: "relative" }}>
        <DesktopIcons
          fs={fs}
          desktopPath={"/home/" + currentUser.username + "/desktop"}
          layout={desktopLayout}
          onLayoutChange={setDesktopLayout}
          onOpenFile={openFile}
          onOpenFolder={openFolder}
          onDelete={handleDeleteDesktopItem}
          iconSize={prefs.iconSize || "medium"}
        />
        {windows.map((win) => (
          <WindowFrame key={win.id} win={win} onClose={closeWindow} onMinimize={minimizeWindow} onMaximize={maximizeWindow} onFocus={focusWindow} onUpdatePos={updateWindowPos} onUpdateSize={updateWindowSize} isActive={activeWindow?.id === win.id}>
            {typeof appMap[win.appId] === "function" ? appMap[win.appId](win) : appMap[win.appId]}
          </WindowFrame>
        ))}
      </main>
      <Dock onOpen={openApp} />
      <NotificationSystem notifications={notifications} />
      {contextMenu && <ContextMenu {...contextMenu} onClose={closeContextMenu} onNewFile={handleNewFile} onNewFolder={handleNewFolder} onToggleTheme={() => setPrefs({ ...prefs, theme: prefs.theme === "dark" ? "light" : "dark" })} theme={prefs.theme} />}
      {showSearch && <SearchModal fs={fs} onClose={() => setShowSearch(false)} onOpenApp={openApp} onOpenFile={openFile} />}
    </div>
  );
}