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
import { Music } from "./apps/Music";
import { Browser } from "./apps/Browser";
import { Assistant } from "./apps/Assistant";
import { SearchModal } from "./components/SearchModal";
import { ContextMenu } from "./components/ContextMenu";
import { Launchpad } from "./components/Launchpad";

let winIdCounter = 1;
const DEFAULT_PREFS = { theme: "dark", wallpaper: "mesh", iconSize: "medium" };

export default function VirtualOS() {
  useEffect(() => { initStorage(); }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const [prefs, setPrefsState] = useState(DEFAULT_PREFS);
  const [fs, setFsState] = useState(makeDefaultFS("user"));
  const [desktopLayout, setDesktopLayoutState] = useState({});

  const [cwd, setCwd] = useState("/");
  const [windows, setWindows] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [clipboardVal, setClipboardVal] = useClipboard();
  const [authReady, setAuthReady] = useState(false);

  const applyUserData = useCallback((user) => {
    if (!user) return;
    setCurrentUser(user);
    setPrefsState(user.prefs || DEFAULT_PREFS);
    setFsState(user.fs || makeDefaultFS(user.username));
    setDesktopLayoutState(user.desktopLayout || {});
    setCwd("/home/" + user.username);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async () => {
      const session = Storage.getSession();
      if (!session?.currentUser) {
        if (!cancelled) setAuthReady(true);
        return;
      }

      try {
        const result = await Storage.getUser(session.currentUser);
        if (!cancelled && result?.user) {
          applyUserData(result.user);
        } else {
          Storage.clearSession();
        }
      } catch {
        Storage.clearSession();
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };

    bootstrapSession();
    return () => { cancelled = true; };
  }, [applyUserData]);

  useEffect(() => {
    const vars = THEMES[prefs.theme] || THEMES.dark;
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [prefs.theme]);

  const setFs = useCallback((newFs) => { setFsState(newFs); if (currentUser) void Storage.updateUser(currentUser.username, { fs: newFs }); }, [currentUser]);
  const setPrefs = useCallback((newPrefs) => { setPrefsState(newPrefs); if (currentUser) void Storage.updateUser(currentUser.username, { prefs: newPrefs }); }, [currentUser]);
  const setDesktopLayout = useCallback((layout) => { setDesktopLayoutState(layout); if (currentUser) void Storage.updateUser(currentUser.username, { desktopLayout: layout }); }, [currentUser]);

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
    if (appId === "launchpad") {
      setShowLaunchpad((value) => !value);
      return;
    }
    const existing = windows.find((w) => w.appId === appId && !extra.forceNew && !w.minimized);
    const minimizedExists = windows.find((w) => w.appId === appId && w.minimized);
    if (minimizedExists) {
      // Restore all minimized windows for this app
      setWindows((ws) => ws.map((w) => w.appId === appId && w.minimized ? { ...w, minimized: false, zIndex: winIdCounter++ } : w));
      return;
    }
    if (existing) { setWindows((ws) => ws.map((w) => w.id === existing.id ? { ...w, zIndex: winIdCounter++ } : w)); return; }
    const configs = {
      terminal: { title: "Terminal", width: 620, height: 400 },
      files: { title: "File Explorer", width: 700, height: 480 },
      editor: { title: extra.filename || "Text Editor", width: 560, height: 440 },
      music: { title: "Music", width: 520, height: 380 },
      browser: { title: "Browser", width: 980, height: 640 },
      assistant: { title: "Assistant", width: 860, height: 680 },
      settings: { title: "Settings", width: 580, height: 460 },
    };
    const cfg = configs[appId] || { title: appId, width: 500, height: 380 };
    const id = winIdCounter++;
    setWindows((ws) => [...ws, { id, appId, ...cfg, ...extra, x: 80 + (id % 6) * 30, y: 50 + (id % 5) * 25, zIndex: winIdCounter++, minimized: false, maximized: false }]);
  }, [windows]);

  const openFile = useCallback((path, content, filename) => {
    const id = winIdCounter++;
    setWindows((ws) => [...ws, { id, appId: "editor", title: filename, width: 560, height: 440, x: 100 + (id % 5) * 25, y: 60 + (id % 4) * 25, zIndex: winIdCounter++, minimized: false, maximized: false, appState: { initialPath: path }, initialContent: content }]);
  }, []);

  const openFolder = useCallback((path, name) => {
    const id = winIdCounter++;
    setWindows((ws) => [...ws, { id, appId: "files", title: name, width: 700, height: 480, x: 120 + (id % 5) * 25, y: 70 + (id % 4) * 25, zIndex: winIdCounter++, minimized: false, maximized: false, appState: { currentPath: path } }]);
  }, [windows]);

  const closeWindow = (id) => setWindows((ws) => ws.filter((w) => w.id !== id));
  const minimizeWindow = (id) => setWindows((ws) => ws.map((w) => w.id === id ? { ...w, minimized: true, minimizedAt: Date.now() } : w));
  const maximizeWindow = (id) => setWindows((ws) => ws.map((w) => w.id === id ? { ...w, maximized: !w.maximized } : w));
  const focusWindow = (id) => setWindows((ws) => ws.map((w) => w.id === id ? { ...w, zIndex: winIdCounter++ } : w));
  const updateWindowPos = (id, x, y) => setWindows((ws) => ws.map((w) => w.id === id ? { ...w, x, y } : w));
  const updateWindowSize = (id, width, height) => setWindows((ws) => ws.map((w) => w.id === id ? { ...w, width, height } : w));

  const restoreWindow = (id) => setWindows((ws) => ws.map((w) => w.id === id ? { ...w, minimized: false, zIndex: winIdCounter++ } : w));
  const restoreAllMinimized = (appId) => setWindows((ws) => ws.map((w) => w.appId === appId && w.minimized ? { ...w, minimized: false, zIndex: winIdCounter++ } : w));

  const updateWindowAppState = (id, patch) => setWindows((ws) => ws.map((w) => w.id === id ? { ...w, appState: { ...(w.appState || {}), ...patch } } : w));

  // Dock click behavior: if app has visible windows, minimize them; if only minimized, restore the most-recently-minimized; otherwise open app
  const onDockClick = (appId) => {
    if (appId === "launchpad") {
      setShowLaunchpad((value) => !value);
      return;
    }
    const openInstances = windows.filter((w) => w.appId === appId && !w.minimized);
    const minimizedInstances = windows.filter((w) => w.appId === appId && w.minimized);
    if (openInstances.length > 0) {
      // minimize all open instances
      setWindows((ws) => ws.map((w) => (w.appId === appId && !w.minimized) ? { ...w, minimized: true, minimizedAt: Date.now() } : w));
      return;
    }
    if (minimizedInstances.length > 0) {
      // restore the most recently minimized instance
      const latest = [...minimizedInstances].sort((a, b) => (b.minimizedAt || 0) - (a.minimizedAt || 0))[0];
      if (latest) restoreWindow(latest.id);
      return;
    }
    // no instances -> open app
    openApp(appId);
  };

  // Get list of currently open app IDs for dock indicator
  const openAppIds = windows.filter((w) => !w.minimized).map((w) => w.appId);

  const handleLogout = () => { Storage.clearSession(); setCurrentUser(null); setWindows([]); setPrefsState(DEFAULT_PREFS); setFsState(makeDefaultFS("user")); setDesktopLayoutState({}); setCwd("/"); };
  const handleLogin = (user) => {
    applyUserData(user);
    Storage.saveSession({ currentUser: user.username, loginTime: Date.now() });
  };
  const handleAccountChanged = (user) => {
    applyUserData(user);
    Storage.saveSession({ currentUser: user.username, loginTime: Date.now() });
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

  const createFileAtPath = useCallback((targetPath, content = "") => {
    if (!currentUser) return false;
    setFs(setNode(fs, targetPath, content));
    return true;
  }, [currentUser, fs, setFs]);

  const createFolderAtPath = useCallback((targetPath) => {
    if (!currentUser) return false;
    setFs(setNode(fs, targetPath, {}));
    return true;
  }, [currentUser, fs, setFs]);

  if (!authReady) return <div style={{ width: "100vw", height: "100vh", background: "#0b1020", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading VirtualOS…</div>;

  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;

  const activeWindow = [...windows].sort((a, b) => b.zIndex - a.zIndex)[0];

  const appMap = {
    terminal: <Terminal fs={fs} setFs={setFs} cwd={cwd} setCwd={setCwd} currentUser={currentUser} notify={notify} onCopy={setClipboardVal} />,
    files: (win) => <FileExplorer fs={fs} setFs={setFs} onOpenFile={openFile} currentUser={currentUser} notify={notify} winId={win.id} appState={win.appState} updateAppState={updateWindowAppState} initialPath={win.appState?.currentPath || win.appState?.initialPath} />,
    editor: (win) => <TextEditor initialPath={win.appState?.initialPath || win.initialPath} initialContent={win.initialContent} fs={fs} setFs={setFs} notify={notify} onCopy={setClipboardVal} />,
    music: (win) => <Music winId={win.id} appState={win.appState} updateAppState={updateWindowAppState} />, 
    browser: (win) => <Browser winId={win.id} appState={win.appState} updateAppState={updateWindowAppState} initialUrl={win.appState?.initialUrl || "https://www.google.com"} />, 
    assistant: (win) => <Assistant winId={win.id} appState={win.appState} updateAppState={updateWindowAppState} currentUser={currentUser} cwd={cwd} fs={fs} onOpenApp={openApp} onOpenFile={openFile} createFileAtPath={createFileAtPath} createFolderAtPath={createFolderAtPath} notify={notify} />, 
    settings: <Settings prefs={prefs} setPrefs={setPrefs} currentUser={currentUser} notify={notify} onAccountChanged={handleAccountChanged} />,
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: prefs.customWallpaper ? `url(${prefs.customWallpaper}) center / cover no-repeat` : (WALLPAPERS[prefs.wallpaper] || WALLPAPERS.catalina), overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <GlobalStyle />
      <Menubar activeApp={activeWindow?.title} currentUser={currentUser} onLogout={handleLogout} clipboardVal={clipboardVal} />
      <main onClick={(e) => {
        // Minimize all open windows when clicking on empty desktop area
        if (e.target === e.currentTarget) {
          const openWindows = windows.filter((w) => !w.minimized);
          openWindows.forEach((win) => minimizeWindow(win.id));
        }
      }} onContextMenu={handleDesktopRightClick} style={{ flex: 1, position: "relative" }}>
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
      <Dock onOpen={openApp} windows={windows} onFocusWindow={focusWindow} restoreWindow={restoreWindow} restoreAllMinimized={restoreAllMinimized} onDockClick={onDockClick} />
      <NotificationSystem notifications={notifications} />
      <Launchpad visible={showLaunchpad} onClose={() => setShowLaunchpad(false)} onOpenApp={openApp} />
      {contextMenu && <ContextMenu {...contextMenu} onClose={closeContextMenu} onNewFile={handleNewFile} onNewFolder={handleNewFolder} onToggleTheme={() => setPrefs({ ...prefs, theme: prefs.theme === "dark" ? "light" : "dark" })} theme={prefs.theme} />}
      {showSearch && <SearchModal fs={fs} onClose={() => setShowSearch(false)} onOpenApp={openApp} onOpenFile={openFile} />}
    </div>
  );
}

