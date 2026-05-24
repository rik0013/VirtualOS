import { MacIcon } from "../components/MacIcon";
import React, { useState } from "react";
import { djb2 } from "../utils/fs";
import { Storage } from "../utils/storage";
import { WALLPAPERS } from "../constants/wallpapers";

export function Settings({ prefs, setPrefs, currentUser, notify }) {
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
  const tabs = [{ id: "appearance", label: "Appearance", icon: "theme" }, { id: "account", label: "Account", icon: "user" }];

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg-window)" }}>
      {/* Sidebar */}
      <div style={{ width: 160, borderRight: "1px solid var(--border)", padding: "16px 8px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, padding: "0 8px", textTransform: "uppercase", letterSpacing: 1 }}>Settings</div>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", borderRadius: 8, fontSize: 13, color: tab === t.id ? "var(--accent)" : "var(--text-secondary)", background: tab === t.id ? "var(--bg-selected)" : "transparent", textAlign: "left", marginBottom: 2 }}>
            <MacIcon type={t.icon} size={16} />{t.label}
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
                    <MacIcon type={t === "dark" ? "moon" : "sun"} size={20} />
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