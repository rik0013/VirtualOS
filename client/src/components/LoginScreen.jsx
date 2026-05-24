import React, { useState, useEffect } from "react";
import { djb2, makeDefaultFS } from "../utils/fs";
import { Storage } from "../utils/storage";
import { WALLPAPERS } from "../constants/wallpapers";
import wp5 from "../assets/wallpapers/wallpaper5.jpg";

export function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("user");
  const [password, setPassword] = useState("user");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  
  // Real Loading progress bar states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);

  // preloader and progress interval
  useEffect(() => {
    if (isLoggingIn) {
      // 1. Asynchronously preload all desktop wallpapers to browser cache to eliminate rendering delays
      Object.keys(WALLPAPERS).forEach((key) => {
        const match = WALLPAPERS[key].match(/url\((.*?)\)/);
        if (match && match[1]) {
          const img = new Image();
          img.src = match[1];
        }
      });

      // 2. Incremental loading animation mimicking real apple booting progression
      const interval = setInterval(() => {
        setLoginProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            const users = Storage.getUsers();
            const user = users.find((u) => u.username === username && u.passwordHash === djb2(password));
            onLogin(user);
            return 100;
          }
          // Dynamic random increment steps
          const increment = Math.floor(Math.random() * 8) + 4;
          return Math.min(100, prev + increment);
        });
      }, 90);

      return () => clearInterval(interval);
    }
  }, [isLoggingIn, username, password, onLogin]);

  const handleLoginSubmit = () => {
    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }
    const users = Storage.getUsers();
    const user = users.find((u) => u.username === username && u.passwordHash === djb2(password));
    
    if (!user) {
      setError("Invalid username or password");
      return;
    }

    setError("");
    setIsLoggingIn(true);
    setLoginProgress(0);
    Storage.saveSession({ currentUser: username, loginTime: Date.now() });
  };

  const handleCreate = () => {
    if (!newUser.username || !newUser.password) {
      setError("Fill all fields");
      return;
    }
    const users = Storage.getUsers();
    if (users.find((u) => u.username === newUser.username)) {
      setError("Username taken");
      return;
    }
    const updated = [...users, { username: newUser.username, passwordHash: djb2(newUser.password) }];
    Storage.saveUsers(updated);
    Storage.saveFS(newUser.username, makeDefaultFS(newUser.username));
    Storage.savePrefs(newUser.username, { theme: "dark", wallpaper: "sequoia", iconSize: "medium" });
    setShowCreate(false);
    setError("");
    setUsername(newUser.username);
    setPassword(newUser.password);
    setNewUser({ username: "", password: "" });
  };

  return (
    <div style={{ 
      width: "100vw", 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "space-between", 
      color: "#fff", 
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
      padding: "50px 20px", 
      position: "relative", 
      overflow: "hidden" 
    }}>
      {/* 1. Frosted Blurred macOS-Style Background Lockscreen Wallpaper */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${wp5})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(0.75) blur(12px)",
        transform: "scale(1.06)", // scale up to mask edge blur bleed
        zIndex: -1,
        transition: "filter 0.5s ease"
      }} />

      {/* Top Header Placeholder (Keeps Flex Balance) */}
      <div style={{ height: 20 }} />

      {/* 2. Middle Content Grid */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
        {isLoggingIn ? (
          /* Apple-Style Boot / Login Loader Panel */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "fadeIn 0.3s ease" }}>
            <img 
              src="/favicon.png" 
              style={{ 
                width: 90, 
                height: 90, 
                marginBottom: 36, 
                objectFit: "contain",
                filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.3))" 
              }} 
              alt="Logo" 
            />
            
            <div style={{ 
              width: 200, 
              height: 4, 
              background: "rgba(255, 255, 255, 0.25)", 
              borderRadius: 2, 
              overflow: "hidden", 
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)" 
            }}>
              <div style={{ 
                width: `${loginProgress}%`, 
                height: "100%", 
                background: "#ffffff", 
                transition: "width 0.1s linear" 
              }} />
            </div>
            
            <div style={{ 
              marginTop: 16, 
              fontSize: 12, 
              color: "rgba(255, 255, 255, 0.75)", 
              fontWeight: 500,
              textShadow: "0 1px 3px rgba(0,0,0,0.35)",
              letterSpacing: "0.2px"
            }}>
              Loading desktop... {loginProgress}%
            </div>
          </div>
        ) : !showCreate ? (
          /* macOS lockscreen avatar and capsule form */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "fadeIn 0.4s ease" }}>
            <img 
              src="/favicon.png" 
              style={{ 
                width: 88, 
                height: 88, 
                borderRadius: "50%", 
                border: "3px solid rgba(255, 255, 255, 0.45)", 
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)", 
                marginBottom: 16,
                objectFit: "contain",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)"
              }} 
              alt="User" 
            />
            
            <div style={{ 
              fontSize: 20, 
              fontWeight: 600, 
              color: "#ffffff", 
              letterSpacing: "-0.5px", 
              marginBottom: 18,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)"
            }}>
              {username || "User"}
            </div>

            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              background: "rgba(255, 255, 255, 0.16)", 
              border: "1px solid rgba(255, 255, 255, 0.22)", 
              borderRadius: 20, 
              padding: "4px 6px 4px 14px", 
              width: 240, 
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              backdropFilter: "blur(20px)",
              transition: "all 0.3s ease"
            }}>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter Password" 
                onKeyDown={(e) => e.key === "Enter" && handleLoginSubmit()}
                style={{ 
                  border: "none", 
                  background: "none", 
                  color: "#fff", 
                  outline: "none", 
                  fontSize: 13, 
                  width: "80%",
                  fontFamily: "system-ui, sans-serif"
                }} 
              />
              <button 
                onClick={handleLoginSubmit} 
                style={{ 
                  width: 26, 
                  height: 26, 
                  borderRadius: "50%", 
                  background: "rgba(255, 255, 255, 0.25)", 
                  border: "none", 
                  color: "#fff", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.45)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              >
                →
              </button>
            </div>

            {error && (
              <div style={{ 
                fontSize: 12, 
                color: "#ff5f56", 
                marginTop: 12, 
                textShadow: "0 1px 4px rgba(0,0,0,0.6)", 
                fontWeight: 600,
                background: "rgba(0,0,0,0.35)",
                padding: "4px 12px",
                borderRadius: 8,
                backdropFilter: "blur(4px)"
              }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>Default credentials: user / user</span>
              <button 
                onClick={() => { setShowCreate(true); setError(""); }} 
                style={{ 
                  fontSize: 12, 
                  color: "rgba(255,255,255,0.9)", 
                  background: "rgba(0,0,0,0.25)", 
                  border: "1px solid rgba(255,255,255,0.15)", 
                  borderRadius: 12, 
                  padding: "5px 14px", 
                  cursor: "pointer", 
                  backdropFilter: "blur(6px)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.25)"}
              >
                Create account
              </button>
            </div>
          </div>
        ) : (
          /* Glassmorphic Account Creation Panel */
          <div style={{ 
            width: 320, 
            background: "rgba(255, 255, 255, 0.12)", 
            border: "1px solid rgba(255, 255, 255, 0.18)", 
            borderRadius: 20, 
            padding: 28, 
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)", 
            backdropFilter: "blur(30px)", 
            animation: "fadeIn 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <img 
              src="/favicon.png" 
              style={{ width: 44, height: 44, marginBottom: 12, objectFit: "contain" }} 
              alt="Logo" 
            />
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 18, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>Create Account</div>
            
            <input 
              value={newUser.username} 
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} 
              placeholder="Choose a username" 
              style={{ 
                width: "100%", 
                background: "rgba(0,0,0,0.3)", 
                border: "1px solid rgba(255,255,255,0.15)", 
                borderRadius: 10, 
                padding: "10px 14px", 
                fontSize: 13, 
                color: "#fff", 
                marginBottom: 10,
                outline: "none"
              }} 
            />
            <input 
              type="password" 
              value={newUser.password} 
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} 
              placeholder="Choose a password" 
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              style={{ 
                width: "100%", 
                background: "rgba(0,0,0,0.3)", 
                border: "1px solid rgba(255,255,255,0.15)", 
                borderRadius: 10, 
                padding: "10px 14px", 
                fontSize: 13, 
                color: "#fff", 
                marginBottom: 14,
                outline: "none"
              }} 
            />
            
            {error && <div style={{ fontSize: 12, color: "#ff5f56", marginBottom: 12, textAlign: "center", fontWeight: 600 }}>{error}</div>}
            
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button 
                onClick={() => { setShowCreate(false); setError(""); }} 
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: "#fff", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate} 
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Create
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Action Buttons matching real macOS (Sleep, Restart, Shut Down) */}
      {!isLoggingIn && (
        <div style={{ display: "flex", gap: 40, justifyContent: "center", marginBottom: 10, animation: "fadeIn 0.5s ease" }}>
          {[
            { label: "Sleep", icon: "☾" },
            { label: "Restart", icon: "↻" },
            { label: "Shut Down", icon: "⏻" }
          ].map((act) => (
            <button 
              key={act.label} 
              onClick={() => {
                if (act.label === "Restart") {
                  window.location.reload();
                } else {
                  alert(`${act.label} state activated.`);
                }
              }}
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                background: "none", 
                border: "none", 
                color: "rgba(255, 255, 255, 0.8)", 
                cursor: "pointer",
                gap: 6
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)"}
            >
              <div style={{ 
                width: 38, 
                height: 38, 
                borderRadius: "50%", 
                background: "rgba(0,0,0,0.35)", 
                border: "1px solid rgba(255,255,255,0.15)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                fontSize: 16,
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
              }}>
                {act.icon}
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>{act.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
