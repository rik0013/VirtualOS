import React, { useState, useEffect } from "react";

export function BootScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let current = 0;
    const total = 2200; // ms total boot time
    const interval = 40; // tick every 40ms

    const timer = setInterval(() => {
      // Non-linear progression: fast at start, slow in middle, fast at end
      const elapsed = current / total;
      let increment;
      if (elapsed < 0.3) increment = 3.5;       // fast start
      else if (elapsed < 0.7) increment = 1.2;  // slow middle (realistic)
      else increment = 2.8;                      // fast finish

      current += interval;
      const pct = Math.min(100, (current / total) * 100 * (increment / 2.5));

      setProgress((prev) => Math.min(100, prev + increment));

      if (current >= total) {
        clearInterval(timer);
        setProgress(100);
        // Wait a moment at 100%, then fade out
        setTimeout(() => {
          setFading(true);
          setTimeout(onComplete, 500);
        }, 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        opacity: fading ? 0 : 1,
        transition: "opacity 0.5s ease",
        gap: 0,
      }}
    >
      {/* Logo */}
      <img
        src="/vos-white.png"
        alt="VOS"
        style={{
          width: 160,
          height:160,
          objectFit: "contain",
          marginBottom: 48,
          filter: "brightness(1) drop-shadow(0 0 20px rgba(255,255,255,0.1))",
        }}
      />

      {/* Progress bar track */}
      <div
        style={{
          width: 180,
          height: 4,
          background: "rgba(255,255,255,0.18)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: progress + "%",
            height: "100%",
            background: "#fff",
            borderRadius: 2,
            transition: "width 0.04s linear",
          }}
        />
      </div>
    </div>
  );
}
