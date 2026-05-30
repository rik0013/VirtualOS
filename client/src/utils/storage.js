const API_BASE = "/api";

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const raw = await response.text();
  const payload = raw ? (() => {
    try {
      return JSON.parse(raw);
    } catch {
      return { error: raw };
    }
  })() : null;

  if (!response.ok) {
    throw new Error(payload?.error || raw || "Request failed");
  }

  return payload;
}

export const Storage = {
  getSession: () => JSON.parse(localStorage.getItem("vos_session") || "null"),
  saveSession: (session) => localStorage.setItem("vos_session", JSON.stringify(session)),
  clearSession: () => localStorage.removeItem("vos_session"),

  login: async (username, password) => requestJson("/auth/login", {
    method: "POST",
    body: { username, password },
  }),

  register: async (username, password) => requestJson("/auth/register", {
    method: "POST",
    body: { username, password },
  }),

  getUser: async (username) => requestJson(`/users/${encodeURIComponent(username)}`),

  updateUser: async (username, patch) => requestJson(`/users/${encodeURIComponent(username)}`, {
    method: "PUT",
    body: patch,
  }),
};

export function initStorage() {
  // MongoDB now owns persistence for user accounts and desktop data.
}
