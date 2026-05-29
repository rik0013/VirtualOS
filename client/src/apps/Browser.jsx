import React, { useEffect, useMemo, useRef, useState } from "react";

const SEARCH_ENGINES = [
  { label: "Google", buildUrl: (q) => `https://www.google.com/search?igu=1&q=${encodeURIComponent(q)}` },
  { label: "DuckDuckGo", buildUrl: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  { label: "Bing", buildUrl: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
];

const DEFAULT_ENGINE = SEARCH_ENGINES[0];

export function Browser({ winId, appState = {}, updateAppState }) {
  const [query, setQuery] = useState(appState.query || "");
  const [engine, setEngine] = useState(appState.engine || DEFAULT_ENGINE.label);
  const [iframeUrl, setIframeUrl] = useState(appState.iframeUrl || DEFAULT_ENGINE.buildUrl(appState.query || ""));
  const [blocked, setBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef(null);

  const selectedEngine = useMemo(
    () => SEARCH_ENGINES.find((item) => item.label === engine) || DEFAULT_ENGINE,
    [engine]
  );

  const submitSearch = (searchText = query) => {
    const normalized = String(searchText).trim();
    if (!normalized) return;
    const nextUrl = selectedEngine.buildUrl(normalized);
    setIframeUrl(nextUrl);
    setIsLoading(true);
    setBlocked(false);
  };

  useEffect(() => {
    updateAppState(winId, {
      query,
      engine,
      iframeUrl,
    });
  }, [winId, query, engine, iframeUrl, updateAppState]);

  useEffect(() => {
    if (!iframeUrl) return;
    setIsLoading(true);
  }, [iframeUrl]);

  const handleLoad = () => {
    try {
      const doc = iframeRef.current?.contentWindow?.document;
      if (doc) setBlocked(false);
      setIsLoading(false);
    } catch {
      setBlocked(true);
      setIsLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    submitSearch();
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0f172a", color: "#fff" }}>
      <div style={{ padding: 14, borderBottom: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(180deg, rgba(30,41,59,0.9), rgba(15,23,42,0.92))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 0.2 }}>Search Engine</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Search only mode</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SEARCH_ENGINES.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setEngine(item.label);
                  if (query.trim()) setIframeUrl(item.buildUrl(query));
                }}
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: engine === item.label ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.06)",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web"
            style={{
              flex: 1,
              minWidth: 220,
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 999,
              padding: "12px 16px",
              outline: "none",
            }}
          />
          <button type="submit" style={searchButtonStyle}>Search</button>
          <button
            type="button"
            onClick={() => {
              const next = query.trim() || "music";
              setQuery(next);
              submitSearch(next);
            }}
            style={searchButtonSecondary}
          >
            I’m Feeling Lucky
          </button>
        </form>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", fontSize: 12, color: "rgba(255,255,255,0.62)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>Showing search results only</div>
        <div>{isLoading ? "Loading…" : blocked ? "Search page blocked by iframe rules" : "Ready"}</div>
      </div>

      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <iframe
          ref={iframeRef}
          key={iframeUrl}
          src={iframeUrl}
          onLoad={handleLoad}
          title="Search engine"
          referrerPolicy="no-referrer"
          sandbox="allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox allow-modals"
          style={{ width: "100%", height: "100%", border: "none", background: "white" }}
        />

        {blocked && (
          <div style={overlayStyle}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Search page blocked in this browser shell</div>
            <div style={{ marginTop: 8, color: "rgba(255,255,255,0.72)", lineHeight: 1.5, maxWidth: 520 }}>
              This site does not allow iframe embedding. The app still behaves as a search-only browser, and the query can be changed from the bar above.
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => submitSearch()} style={overlayButtonPrimary}>Retry Search</button>
              <button onClick={() => window.open(iframeUrl, "_blank", "noopener,noreferrer")} style={overlayButtonSecondary}>Open search results in tab</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const searchButtonStyle = {
  border: "none",
  borderRadius: 999,
  padding: "12px 18px",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const searchButtonSecondary = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 999,
  padding: "12px 18px",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const overlayStyle = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: 24,
  textAlign: "center",
  background: "linear-gradient(180deg, rgba(6,10,18,0.48), rgba(6,10,18,0.86))",
  backdropFilter: "blur(18px)",
};

const overlayButtonPrimary = {
  border: "none",
  borderRadius: 999,
  padding: "12px 16px",
  background: "#1d4ed8",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const overlayButtonSecondary = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 999,
  padding: "12px 16px",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};
