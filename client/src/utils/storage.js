import { djb2, makeDefaultFS } from "./fs";

export const Storage = {
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

export function initStorage() {
  const users = Storage.getUsers();
  if (users.length === 0) {
    const u = { username: "user", passwordHash: djb2("user") };
    Storage.saveUsers([u]);
    Storage.saveFS(u.username, makeDefaultFS(u.username));
    Storage.savePrefs(u.username, { theme: "dark", wallpaper: "mesh", iconSize: "medium" });
  }
}