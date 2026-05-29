import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DOCK_APPS } from "./Dock";
import { MacIcon } from "./MacIcon";

const APP_ITEMS = DOCK_APPS.filter((app) => app.id !== "launchpad");

export function Launchpad({ visible, onClose, onOpenApp }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!visible) setQuery("");
  }, [visible]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filteredApps = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return APP_ITEMS;
    return APP_ITEMS.filter((app) => app.label.toLowerCase().includes(value));
  }, [query]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 1.04, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.02, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3800,
            background: "radial-gradient(circle at top, rgba(255,255,255,0.14), transparent 34%), linear-gradient(135deg, rgba(10,10,12,0.88), rgba(20,20,26,0.94))",
            backdropFilter: "blur(24px) saturate(160%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(980px, 100%)",
              height: "min(720px, 100%)",
              borderRadius: 34,
              background: "rgba(16,16,20,0.72)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "26px 28px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255, 255, 255, 0.5)" }}>Launchpad</div>
                <div style={{ marginTop: 6, fontSize: 32, fontWeight: 900,color: "#fff" }}>All apps in one place</div>
              </div>
              <button onClick={onClose} style={closeButtonStyle}>Close</button>
            </div>

            <div style={{ padding: "16px 28px 0" }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search apps..."
                style={{
                  width: "100%",
                  maxWidth: 420,
                  padding: "12px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 18,
                }}
              >
                {filteredApps.map((app, index) => (
                  <motion.button
                    key={app.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.24) }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onOpenApp(app.id);
                      onClose();
                    }}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 24,
                      background: "rgba(255,255,255,0.04)",
                      color: "#fff",
                      padding: 18,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                      minHeight: 150,
                      boxShadow: "0 16px 28px rgba(0,0,0,0.22)",
                    }}
                  >
                    <div style={{ width: 76, height: 76, borderRadius: 22, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MacIcon type={app.icon} size={68} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, textAlign: "center" }}>{app.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const closeButtonStyle = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 999,
  padding: "10px 14px",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
