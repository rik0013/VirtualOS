import React, { useMemo, useState } from "react";
import {
  Accessibility,
  BellRing,
  Bluetooth,
  Globe,
  HardDrive,
  Keyboard,
  LayoutGrid,
  LockKeyhole,
  Monitor,
  MoonStar,
  Palette,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SunMedium,
  UserRound,
  Volume2,
  Wifi,
  Eye,
  MousePointer2,
  Languages,
  Info,
} from "lucide-react";
import { MacIcon } from "../components/MacIcon";
import { djb2 } from "../utils/fs";
import { Storage } from "../utils/storage";
import { WALLPAPERS } from "../constants/wallpapers";

const sections = [
  { id: "apple-id", label: "Apple ID", icon: UserRound, group: "Account" },
  { id: "general", label: "General", icon: Sparkles, group: "System" },
  { id: "appearance", label: "Appearance", icon: Palette, group: "Personal" },
  { id: "control-center", label: "Control Center", icon: LayoutGrid, group: "Personal" },
  { id: "desktop-dock", label: "Desktop & Dock", icon: Monitor, group: "Personal" },
  { id: "network", label: "Network", icon: Wifi, group: "Connectivity" },
  { id: "bluetooth", label: "Bluetooth", icon: Bluetooth, group: "Connectivity" },
  { id: "sound", label: "Sound", icon: Volume2, group: "Devices" },
  { id: "privacy", label: "Privacy & Security", icon: ShieldCheck, group: "Security" },
  { id: "accessibility", label: "Accessibility", icon: Accessibility, group: "Accessibility" },
  { id: "keyboard", label: "Keyboard", icon: Keyboard, group: "Devices" },
  { id: "display", label: "Displays", icon: Monitor, group: "Devices" },
  { id: "language", label: "Language & Region", icon: Languages, group: "System" },
  { id: "storage", label: "Storage", icon: HardDrive, group: "System" },
  { id: "about", label: "About", icon: Info, group: "System" },
];

const groupedSections = sections.reduce((groups, section) => {
  groups[section.group] = groups[section.group] || [];
  groups[section.group].push(section);
  return groups;
}, {});

function SettingRow({ title, description, right, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 16px",
        borderRadius: 18,
        border: active ? "1px solid rgba(59,130,246,0.35)" : "1px solid rgba(255,255,255,0.06)",
        background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
        color: "#fff",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        {description && <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.62)", lineHeight: 1.45 }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 54,
        height: 30,
        borderRadius: 999,
        border: "none",
        background: checked ? "linear-gradient(135deg, #22c55e, #16a34a)" : "rgba(255,255,255,0.12)",
        position: "relative",
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 4,
          left: checked ? 28 : 4,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
          transition: "left 0.18s ease",
        }}
      />
    </button>
  );
}

function PaddedCard({ children, title, subtitle }) {
  return (
    <div style={{ padding: 18, borderRadius: 24, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 14px 28px rgba(0,0,0,0.12)" }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: 14 }}>
          {title && <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>}
          {subtitle && <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.45 }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Settings({ prefs, setPrefs, currentUser, notify }) {
  const [tab, setTab] = useState("appearance");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [newUsername, setNewUsername] = useState(currentUser.username);
  const [pwMsg, setPwMsg] = useState(null);
  const [search, setSearch] = useState("");
  const [controlCenter, setControlCenter] = useState({ dock: true, menuBar: true, notifications: true, spotLight: true });
  const [privacy, setPrivacy] = useState({ analytics: false, location: true, fileAccess: true, passwordAutofill: true });
  const [accessibility, setAccessibility] = useState({ reduceMotion: false, increaseContrast: false, reduceTransparency: false });
  const [sound, setSound] = useState({ playUiSounds: true, showVolumeOnMenuBar: true, spatialAudio: false });
  const [network, setNetwork] = useState({ wifi: true, bluetooth: true, vpn: false });

  const visibleSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter((section) => section.label.toLowerCase().includes(q));
  }, [search]);

  const changeCredentials = () => {
    const users = Storage.getUsers();
    const idx = users.findIndex((u) => u.username === currentUser.username);
    if (idx === -1) return;
    if (users[idx].passwordHash !== djb2(oldPw)) {
      setPwMsg({ ok: false, text: "Current password incorrect" });
      return;
    }
    if (newPw && newPw !== newPw2) {
      setPwMsg({ ok: false, text: "New passwords don't match" });
      return;
    }
    if (newUsername !== currentUser.username) {
      if (users.find((u, i) => u.username === newUsername && i !== idx)) {
        setPwMsg({ ok: false, text: "Username already taken" });
        return;
      }
    }

    const updated = [...users];
    updated[idx] = { username: newUsername, passwordHash: newPw ? djb2(newPw) : updated[idx].passwordHash };
    Storage.saveUsers(updated);

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

  const sidebarGroups = Object.keys(groupedSections);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "100%", background: "linear-gradient(135deg, rgba(14,14,16,0.96), rgba(28,28,34,0.95))", color: "#fff" }}>
      <aside style={{ borderRight: "1px solid rgba(255,255,255,0.06)", padding: 18, display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
        <div style={{ padding: 14, borderRadius: 22, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg, #dbeafe, #60a5fa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MacIcon type="settings" size={34} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>{currentUser.username}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Apple ID • VirtualOS</div>
            </div>
          </div>
          <div style={{ marginTop: 12, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: 11, color: "rgba(255,255,255,0.45)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Settings"
              style={{ width: "100%", padding: "10px 14px 10px 34px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gap: 6, overflow: "auto", paddingRight: 2 }}>
          {sidebarGroups.map((group) => (
            <div key={group} style={{ display: "grid", gap: 6 }}>
              <div style={{ padding: "10px 10px 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: "rgba(255,255,255,0.45)" }}>{group}</div>
              {visibleSections.filter((section) => section.group === group).map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      padding: "11px 12px",
                      borderRadius: 14,
                      background: isActive ? "rgba(59,130,246,0.16)" : "transparent",
                      border: isActive ? "1px solid rgba(59,130,246,0.32)" : "1px solid transparent",
                      color: isActive ? "#fff" : "rgba(255,255,255,0.82)",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={14} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      <div style={{ padding: 22, overflowY: "auto" }}>
        {tab === "appearance" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Appearance</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Personalize the look of VirtualOS.</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
              <PaddedCard title="Theme" subtitle="Switch between light and dark system themes.">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {[{ key: "dark", label: "Dark", icon: MoonStar }, { key: "light", label: "Light", icon: SunMedium }].map((item) => {
                    const Icon = item.icon;
                    const active = prefs.theme === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setPrefs({ ...prefs, theme: item.key })}
                        style={{
                          padding: 16,
                          borderRadius: 18,
                          border: active ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.07)",
                          background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
                          color: "#fff",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 10,
                          cursor: "pointer",
                        }}
                      >
                        <Icon size={22} />
                        <div style={{ fontWeight: 800 }}>{item.label}</div>
                      </button>
                    );
                  })}
                </div>
              </PaddedCard>

              <PaddedCard title="Wallpaper" subtitle="Choose a system wallpaper or set a custom image URL.">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {Object.keys(WALLPAPERS).map((name) => (
                    <button
                      key={name}
                      onClick={() => setPrefs({ ...prefs, wallpaper: name, customWallpaper: null })}
                      style={{
                        minHeight: 74,
                        borderRadius: 16,
                        background: WALLPAPERS[name],
                        border: prefs.wallpaper === name && !prefs.customWallpaper ? "2px solid rgba(255,255,255,0.8)" : "1px solid rgba(255,255,255,0.08)",
                        cursor: "pointer",
                        overflow: "hidden",
                        position: "relative",
                        boxShadow: "0 12px 22px rgba(0,0,0,0.18)",
                      }}
                    >
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.5))" }} />
                      <div style={{ position: "absolute", bottom: 8, left: 10, right: 10, fontSize: 11, fontWeight: 700, textTransform: "capitalize", textAlign: "left" }}>{name}</div>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Custom Wallpaper URL</div>
                  <input
                    type="text"
                    value={prefs.customWallpaper || ""}
                    onChange={(e) => setPrefs({ ...prefs, customWallpaper: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
                  />
                </div>
              </PaddedCard>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
              <PaddedCard title="Desktop Icon Size" subtitle="Set the scale for desktop icons.">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {["small", "medium", "large"].map((size) => {
                    const active = (prefs.iconSize || "medium") === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setPrefs({ ...prefs, iconSize: size })}
                        style={{
                          padding: 12,
                          borderRadius: 16,
                          border: active ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.08)",
                          background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: size === "small" ? 16 : size === "medium" ? 22 : 28 }}>◉</div>
                        <div style={{ marginTop: 8, fontSize: 13, fontWeight: 800, textTransform: "capitalize" }}>{size}</div>
                      </button>
                    );
                  })}
                </div>
              </PaddedCard>

              <PaddedCard title="Dock" subtitle="Adjust dock visibility and animation behavior.">
                <div style={{ display: "grid", gap: 12 }}>
                  <SettingRow title="Auto-hide Dock" description="Hide the dock until you move the pointer to the bottom edge." right={<Toggle checked={controlCenter.dock} onChange={(value) => setControlCenter((prev) => ({ ...prev, dock: value }))} />} />
                  <SettingRow title="Magnification" description="Animate dock icons on hover for a more fluid feel." right={<Toggle checked={controlCenter.menuBar} onChange={(value) => setControlCenter((prev) => ({ ...prev, menuBar: value }))} />} />
                </div>
              </PaddedCard>

              <PaddedCard title="Motion" subtitle="Reduce animations if you prefer a calmer interface.">
                <div style={{ display: "grid", gap: 12 }}>
                  <SettingRow title="Reduce motion" description="Tone down motion in the interface." right={<Toggle checked={accessibility.reduceMotion} onChange={(value) => setAccessibility((prev) => ({ ...prev, reduceMotion: value }))} />} />
                  <SettingRow title="Reduce transparency" description="Replace glass effects with flatter surfaces." right={<Toggle checked={accessibility.reduceTransparency} onChange={(value) => setAccessibility((prev) => ({ ...prev, reduceTransparency: value }))} />} />
                </div>
              </PaddedCard>
            </div>
          </div>
        )}

        {tab === "apple-id" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Apple ID</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Account settings and device info.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <PaddedCard title="Account" subtitle="Manage your username and password.">
                <label style={labelStyle}>New username</label>
                <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Username" style={inputStyle} />
                <label style={labelStyle}>Current password</label>
                <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="Required to save changes" style={inputStyle} />
                <label style={labelStyle}>New password</label>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Leave blank to keep current" style={inputStyle} />
                <label style={labelStyle}>Confirm password</label>
                <input type="password" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} placeholder="Repeat new password" style={inputStyle} />
                {pwMsg && <div style={{ marginTop: 6, color: pwMsg.ok ? "#22c55e" : "#f87171", fontSize: 12 }}>{pwMsg.text}</div>}
                <button onClick={changeCredentials} style={primaryButton}>Save Changes</button>
              </PaddedCard>

              <PaddedCard title="Device" subtitle="This is your VirtualOS instance.">
                <div style={{ display: "grid", gap: 12 }}>
                  <SettingRow title="System name" description="Your current account and desktop identity." right={<div style={pillStyle}>{currentUser.username}</div>} />
                  <SettingRow title="Operating System" description="VirtualOS desktop environment." right={<div style={pillStyle}>v1.0</div>} />
                  <SettingRow title="Updates" description="Keep the desktop shell updated." right={<div style={pillStyle}>Up to date</div>} />
                </div>
              </PaddedCard>
            </div>
          </div>
        )}

        {tab === "general" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>General</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>System preferences and defaults.</div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <PaddedCard title="Startup behavior">
                <div style={{ display: "grid", gap: 12 }}>
                  <SettingRow title="Open last workspace on login" description="Restore your last desktop state after login." right={<Toggle checked />} />
                  <SettingRow title="Show welcome screen" description="Display helpful tips when VirtualOS starts." right={<Toggle checked={controlCenter.notifications} onChange={(value) => setControlCenter((prev) => ({ ...prev, notifications: value }))} />} />
                  <SettingRow title="Default file app" description="Choose the default app for file previews." right={<div style={pillStyle}>Text Editor</div>} />
                </div>
              </PaddedCard>
              <PaddedCard title="Language & region">
                <div style={{ display: "grid", gap: 12 }}>
                  <SettingRow title="Language" description="English (United States)" right={<div style={pillStyle}>English</div>} />
                  <SettingRow title="Region" description="Date, time, and formatting preferences." right={<div style={pillStyle}>US</div>} />
                </div>
              </PaddedCard>
            </div>
          </div>
        )}

        {tab === "control-center" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Control Center</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Quick-access toggles and menu bar visibility.</div>
            </div>
            <PaddedCard title="Modules" subtitle="Choose what appears in the quick controls area.">
              <div style={{ display: "grid", gap: 12 }}>
                <SettingRow title="Dock" description="Show the dock shortcut in quick controls." right={<Toggle checked={controlCenter.dock} onChange={(value) => setControlCenter((prev) => ({ ...prev, dock: value }))} />} />
                <SettingRow title="Menu bar" description="Show system controls in the top bar." right={<Toggle checked={controlCenter.menuBar} onChange={(value) => setControlCenter((prev) => ({ ...prev, menuBar: value }))} />} />
                <SettingRow title="Notifications" description="Allow system notifications to appear." right={<Toggle checked={controlCenter.notifications} onChange={(value) => setControlCenter((prev) => ({ ...prev, notifications: value }))} />} />
                <SettingRow title="Spotlight" description="Enable quick search from the keyboard." right={<Toggle checked={controlCenter.spotLight} onChange={(value) => setControlCenter((prev) => ({ ...prev, spotLight: value }))} />} />
              </div>
            </PaddedCard>
          </div>
        )}

        {tab === "desktop-dock" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Desktop & Dock</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Tweak desktop behavior and icon density.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <PaddedCard title="Desktop items">
                <div style={{ display: "grid", gap: 12 }}>
                  <SettingRow title="Show desktop files" description="Keep files and folders visible on the desktop." right={<Toggle checked />} />
                  <SettingRow title="Snap to grid" description="Align desktop items neatly when moved." right={<Toggle checked />} />
                  <SettingRow title="Show item info" description="Display file details under desktop icons." right={<Toggle checked={controlCenter.notifications} onChange={(value) => setControlCenter((prev) => ({ ...prev, notifications: value }))} />} />
                </div>
              </PaddedCard>
              <PaddedCard title="Dock behavior">
                <div style={{ display: "grid", gap: 12 }}>
                  <SettingRow title="Auto-hide and show Dock" description="Hide the dock until needed." right={<Toggle checked={controlCenter.dock} onChange={(value) => setControlCenter((prev) => ({ ...prev, dock: value }))} />} />
                  <SettingRow title="Minimize windows into app icon" description="Match standard macOS minimize behavior." right={<Toggle checked />} />
                  <SettingRow title="Show running indicators" description="Display dots beneath active apps." right={<Toggle checked />} />
                </div>
              </PaddedCard>
            </div>
          </div>
        )}

        {tab === "network" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Network</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Connections and online services.</div>
            </div>
            <PaddedCard title="Connections">
              <div style={{ display: "grid", gap: 12 }}>
                <SettingRow title="Wi-Fi" description="Connected to VirtualOS Network" right={<Toggle checked={network.wifi} onChange={(value) => setNetwork((prev) => ({ ...prev, wifi: value }))} />} />
                <SettingRow title="Bluetooth" description="Discover nearby accessories." right={<Toggle checked={network.bluetooth} onChange={(value) => setNetwork((prev) => ({ ...prev, bluetooth: value }))} />} />
                <SettingRow title="VPN" description="Private network tunnel." right={<Toggle checked={network.vpn} onChange={(value) => setNetwork((prev) => ({ ...prev, vpn: value }))} />} />
                <SettingRow title="AirDrop" description="Share files with nearby devices." right={<div style={pillStyle}>Contacts Only</div>} />
              </div>
            </PaddedCard>
          </div>
        )}

        {tab === "bluetooth" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Bluetooth</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Paired devices and audio accessories.</div>
            </div>
            <PaddedCard title="Devices">
              <div style={{ display: "grid", gap: 12 }}>
                <SettingRow title="VirtualOS AirPods" description="Connected • Battery 82%" right={<div style={pillStyle}>Connected</div>} />
                <SettingRow title="Magic Keyboard" description="Available nearby" right={<div style={pillStyle}>Pair</div>} />
                <SettingRow title="Magic Mouse" description="Available nearby" right={<div style={pillStyle}>Pair</div>} />
              </div>
            </PaddedCard>
          </div>
        )}

        {tab === "sound" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Sound</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Audio output and interface sounds.</div>
            </div>
            <PaddedCard title="Output">
              <div style={{ display: "grid", gap: 12 }}>
                <SettingRow title="Output device" description="VirtualOS Speakers" right={<div style={pillStyle}>Speakers</div>} />
                <SettingRow title="Play UI sounds" description="Enable click and system feedback sounds." right={<Toggle checked={sound.playUiSounds} onChange={(value) => setSound((prev) => ({ ...prev, playUiSounds: value }))} />} />
                <SettingRow title="Show volume control in menu bar" description="Quickly change volume from the top bar." right={<Toggle checked={sound.showVolumeOnMenuBar} onChange={(value) => setSound((prev) => ({ ...prev, showVolumeOnMenuBar: value }))} />} />
                <SettingRow title="Spatial audio" description="Simulate a wider stereo image." right={<Toggle checked={sound.spatialAudio} onChange={(value) => setSound((prev) => ({ ...prev, spatialAudio: value }))} />} />
              </div>
            </PaddedCard>
          </div>
        )}

        {tab === "privacy" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Privacy & Security</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Protect your data and app permissions.</div>
            </div>
            <PaddedCard title="Privacy controls">
              <div style={{ display: "grid", gap: 12 }}>
                <SettingRow title="Analytics sharing" description="Help improve the OS with anonymous usage data." right={<Toggle checked={privacy.analytics} onChange={(value) => setPrivacy((prev) => ({ ...prev, analytics: value }))} />} />
                <SettingRow title="Location services" description="Allow apps to request location data." right={<Toggle checked={privacy.location} onChange={(value) => setPrivacy((prev) => ({ ...prev, location: value }))} />} />
                <SettingRow title="File access permissions" description="Let apps browse your files." right={<Toggle checked={privacy.fileAccess} onChange={(value) => setPrivacy((prev) => ({ ...prev, fileAccess: value }))} />} />
                <SettingRow title="Password Autofill" description="Store passwords for quicker sign-ins." right={<Toggle checked={privacy.passwordAutofill} onChange={(value) => setPrivacy((prev) => ({ ...prev, passwordAutofill: value }))} />} />
              </div>
            </PaddedCard>
          </div>
        )}

        {tab === "accessibility" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Accessibility</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Visual and motion adjustments.</div>
            </div>
            <PaddedCard title="Display & motion">
              <div style={{ display: "grid", gap: 12 }}>
                <SettingRow title="Reduce motion" description="Minimize animated transitions." right={<Toggle checked={accessibility.reduceMotion} onChange={(value) => setAccessibility((prev) => ({ ...prev, reduceMotion: value }))} />} />
                <SettingRow title="Increase contrast" description="Boost the contrast of important UI elements." right={<Toggle checked={accessibility.increaseContrast} onChange={(value) => setAccessibility((prev) => ({ ...prev, increaseContrast: value }))} />} />
                <SettingRow title="Reduce transparency" description="Replace glass effects with simpler surfaces." right={<Toggle checked={accessibility.reduceTransparency} onChange={(value) => setAccessibility((prev) => ({ ...prev, reduceTransparency: value }))} />} />
                <SettingRow title="Pointer size" description="Larger pointer and cursor indicators." right={<div style={pillStyle}>Default</div>} />
              </div>
            </PaddedCard>
          </div>
        )}

        {tab === "keyboard" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Keyboard</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Shortcuts, repeat rate, and input source.</div>
            </div>
            <PaddedCard title="Typing">
              <div style={{ display: "grid", gap: 12 }}>
                <SettingRow title="Key repeat" description="Fast" right={<div style={pillStyle}>Fast</div>} />
                <SettingRow title="Delay until repeat" description="Short" right={<div style={pillStyle}>Short</div>} />
                <SettingRow title="Text replacement" description="Expand shortcuts into full phrases." right={<Toggle checked />} />
              </div>
            </PaddedCard>
          </div>
        )}

        {tab === "display" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Displays</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Screen layout and appearance.
              </div>
            </div>
            <PaddedCard title="Display options">
              <div style={{ display: "grid", gap: 12 }}>
                <SettingRow title="Resolution" description="1920 × 1080" right={<div style={pillStyle}>Retina</div>} />
                <SettingRow title="Night Shift" description="Warmer colors after sunset." right={<Toggle checked={accessibility.reduceMotion} onChange={(value) => setAccessibility((prev) => ({ ...prev, reduceMotion: value }))} />} />
                <SettingRow title="True Tone" description="Automatically adapt display colors." right={<Toggle checked />} />
              </div>
            </PaddedCard>
          </div>
        )}

        {tab === "language" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Language & Region</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Formatting and language preferences.</div>
            </div>
            <PaddedCard title="Regional settings">
              <div style={{ display: "grid", gap: 12 }}>
                <SettingRow title="Language" description="English (United States)" right={<div style={pillStyle}>English</div>} />
                <SettingRow title="Region" description="Date and number formatting" right={<div style={pillStyle}>United States</div>} />
                <SettingRow title="Calendar" description="Gregorian" right={<div style={pillStyle}>Gregorian</div>} />
              </div>
            </PaddedCard>
          </div>
        )}

        {tab === "storage" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Storage</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Manage local data usage.</div>
            </div>
            <PaddedCard title="Disk usage">
              <div style={{ display: "grid", gap: 12 }}>
                <SettingRow title="VirtualOS files" description="9.1 GB used" right={<div style={pillStyle}>9.1 GB</div>} />
                <SettingRow title="Cache" description="Clear temporary assets and thumbnails." right={<button style={secondaryButton}>Clear</button>} />
                <SettingRow title="Downloads" description="Manage downloaded items." right={<button style={secondaryButton}>Open</button>} />
              </div>
            </PaddedCard>
          </div>
        )}

        {tab === "about" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>About</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.62)" }}>Device information and system version.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <PaddedCard title="VirtualOS" subtitle="A macOS-inspired desktop running in the browser.">
                <div style={{ display: "grid", gap: 12 }}>
                  <SettingRow title="Version" description="Current build" right={<div style={pillStyle}>1.0</div>} />
                  <SettingRow title="Kernel" description="React / Vite desktop shell" right={<div style={pillStyle}>Web runtime</div>} />
                </div>
              </PaddedCard>
              <PaddedCard title="Storage & privacy" subtitle="Your data stays in the local browser storage for this workspace.">
                <div style={{ display: "grid", gap: 12 }}>
                  <SettingRow title="Local data" description="Managed by your browser" right={<div style={pillStyle}>Local</div>} />
                  <SettingRow title="Restore settings" description="Saved automatically on change" right={<Toggle checked />} />
                </div>
              </PaddedCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "10px 12px",
  fontSize: 13,
  color: "#fff",
  marginBottom: 12,
  outline: "none",
};

const labelStyle = {
  fontSize: 12,
  color: "rgba(255,255,255,0.7)",
  display: "block",
  marginBottom: 6,
  marginTop: 4,
};

const primaryButton = {
  marginTop: 8,
  padding: "10px 16px",
  borderRadius: 14,
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
};

const secondaryButton = {
  padding: "10px 14px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 700,
  border: "1px solid rgba(255,255,255,0.08)",
  cursor: "pointer",
};

const pillStyle = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
};
