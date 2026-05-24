

export function djb2(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) hash = (hash * 33) ^ str.charCodeAt(i);
  return (hash >>> 0).toString(16);
}
export function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
export function getNode(fs, path) {
  const parts = path.replace(/^\//, "").split("/").filter(Boolean);
  let node = fs;
  for (const p of parts) { if (node[p] === undefined) return null; node = node[p]; }
  return node;
}
export function setNode(fs, path, value) {
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
export function deleteNode(fs, path) {
  const clone = deepClone(fs);
  const parts = path.replace(/^\//, "").split("/").filter(Boolean);
  let node = clone;
  for (let i = 0; i < parts.length - 1; i++) { if (!node[parts[i]]) return clone; node = node[parts[i]]; }
  delete node[parts[parts.length - 1]];
  return clone;
}
export function listDir(fs, path) {
  const node = getNode(fs, path);
  if (!node || typeof node !== "object") return [];
  return Object.keys(node).map((name) => ({ name, isDir: typeof node[name] === "object" }));
}
export function fuzzyMatch(str, query) { return str.toLowerCase().includes(query.toLowerCase()); }
export function resolvePath(cwd, input) {
  if (input.startsWith("/")) return input;
  if (input === "..") { const parts = cwd.replace(/\/$/, "").split("/"); parts.pop(); return parts.join("/") || "/"; }
  if (input === ".") return cwd;
  return (cwd === "/" ? "" : cwd) + "/" + input;
}

export function makeDefaultFS(username) {
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
