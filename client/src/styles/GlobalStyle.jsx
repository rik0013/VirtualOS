import React from "react";

export const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { overflow: hidden; font-family: 'DM Sans', sans-serif; user-select: none; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--scrollbar); border-radius: 3px; }
    input, textarea { font-family: 'DM Sans', sans-serif; outline: none; border: none; background: none; color: var(--text-primary); }
    button { font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; background: none; color: var(--text-primary); }
    @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
    @keyframes windowOpen { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
    .window-open { animation: windowOpen 0.18s cubic-bezier(0.34,1.56,0.64,1); }
  `}</style>
);