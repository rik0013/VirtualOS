import { MacIcon } from "../components/MacIcon";
import React from "react";

export function NotificationSystem({ notifications }) {
  return (
    <div style={{ position: "fixed", bottom: 80, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {notifications.map((n) => (
        <div key={n.id} style={{
          background: "var(--bg-context)", border: "1px solid var(--border-strong)", borderRadius: 10,
          padding: "10px 14px", minWidth: 220, maxWidth: 300, boxShadow: "var(--shadow)",
          animation: "toastIn 0.2s ease", display: "flex", alignItems: "center", gap: 10,
        }}>
          <MacIcon type={n.icon || "copy"} size={24} />
          <div>
            {n.title && <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{n.title}</div>}
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{n.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}