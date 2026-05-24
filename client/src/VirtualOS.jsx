import { MacIcon } from "./components/MacIcon";
import React, { useState, useEffect, useCallback } from "react";
import { THEMES } from "./constants/theme";
import { getNode, setNode, deleteNode, makeDefaultFS } from "./utils/fs";
import { Storage, initStorage } from "./utils/storage";
import { WALLPAPERS } from "./constants/wallpapers";
import { GlobalStyle } from "./styles/GlobalStyle";
import { useClipboard } from "./hooks/useClipboard";
import { NotificationSystem } from "./hooks/useNotifications";
import { LoginScreen } from "./components/LoginScreen";
import { Menubar } from "./components/Menubar";
import { Dock } from "./components/Dock";
import { DesktopIcons } from "./components/DesktopIcons";
import { WindowFrame } from "./components/WindowFrame";
import { Terminal } from "./apps/Terminal";
import { FileExplorer } from "./apps/FileExplorer";
import { TextEditor } from "./apps/TextEditor";
import { Settings } from "./apps/Settings";
import { SearchModal } from "./components/SearchModal";
import { ContextMenu } from "./components/ContextMenu";

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
    notify({ icon: "file", message: "Created " + name });
    closeContextMenu();
  };
  const handleNewFolder = () => {
    const name = "new_folder_" + Date.now();
    const path = "/home/" + currentUser.username + "/desktop/" + name;
    setFs(setNode(fs, path, {}));
    notify({ icon: "folder", message: "Created " + name });
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
    notify({ icon: "trash", message: "Moved to Trash: " + name });
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
    <div style={{ width: "100vw", height: "100vh", background: prefs.customWallpaper ? `url(${prefs.customWallpaper}) center / cover no-repeat` : (WALLPAPERS[prefs.wallpaper] || WALLPAPERS.catalina), overflow: "hidden", display: "flex", flexDirection: "column" }}>
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

