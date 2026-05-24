import React, { useState } from "react";
import { djb2, makeDefaultFS } from "../utils/fs";
import { Storage } from "../utils/storage";
import { WALLPAPERS } from "../constants/wallpapers";


export function LoginScreen({ onLogin }) {
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
