import React, { useEffect, useMemo, useRef, useState } from "react";

const FREE_TRACKS = [
  { id: 1, title: "SoundHelix Song 1", artist: "SoundHelix", album: "Free Stream", duration: "06:13", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "SoundHelix Song 2", artist: "SoundHelix", album: "Free Stream", duration: "05:14", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "SoundHelix Song 3", artist: "SoundHelix", album: "Free Stream", duration: "05:02", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: 4, title: "SoundHelix Song 4", artist: "SoundHelix", album: "Free Stream", duration: "06:25", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: 5, title: "SoundHelix Song 5", artist: "SoundHelix", album: "Free Stream", duration: "05:35", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
];

const formatTime = (seconds = 0) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = String(safe % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};

export function Music({ winId, appState = {}, updateAppState }) {
  const [queue] = useState(appState.queue || FREE_TRACKS);
  const [index, setIndex] = useState(appState.index ?? 0);
  const [playing, setPlaying] = useState(appState.playing ?? false);
  const [progress, setProgress] = useState(appState.progress ?? 0);
  const [duration, setDuration] = useState(appState.duration ?? 0);
  const [volume, setVolume] = useState(appState.volume ?? 0.82);
  const [shuffled, setShuffled] = useState(appState.shuffled ?? false);
  const [repeat, setRepeat] = useState(appState.repeat ?? "off");
  const audioRef = useRef(null);
  
  const currentTrack = queue[index] || queue[0];

  useEffect(() => {
    updateAppState?.(winId, {
      queue,
      index,
      playing,
      progress,
      duration,
      volume,
      shuffled,
      repeat,
    });
  }, [winId, queue, index, playing, progress, duration, volume, shuffled, repeat, updateAppState]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.play().catch(() => setPlaying(false));
    else audioRef.current.pause();
  }, [playing, index]);

  useEffect(() => {
    if (!audioRef.current) return;
    // Set progress when track changes
    audioRef.current.currentTime = progress;
  }, [index]);

  const selectTrack = (trackIndex, autoPlay = true) => {
    setIndex(trackIndex);
    setProgress(0);
    if (autoPlay) setPlaying(true);
  };

  const nextTrack = () => {
    if (repeat === "one") {
      setProgress(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
      audioRef.current?.play();
      return;
    }

    if (shuffled) {
      const choices = queue.map((_, i) => i).filter((i) => i !== index);
      const next = choices[Math.floor(Math.random() * choices.length)] ?? index;
      selectTrack(next, true);
      return;
    }

    if (index + 1 < queue.length) selectTrack(index + 1, true);
    else if (repeat === "all") selectTrack(0, true);
    else setPlaying(false);
  };

  const prevTrack = () => {
    if (progress > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }
    if (index > 0) selectTrack(index - 1, true);
    else if (repeat === "all") selectTrack(queue.length - 1, true);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime || 0);
    setDuration(audioRef.current.duration || 0);
  };

  // Progress percentage for visual fill
  const progressPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="music-shell" style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#000", color: "#fff", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', overflow: "hidden" }}>
      <audio ref={audioRef} src={currentTrack.src} preload="metadata" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} onEnded={nextTrack} />

      {/* Global CSS overrides for Spotify range inputs and lists */}
      <style>{`
        .spotify-range {
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          cursor: pointer;
          transition: background 0.1s ease;
        }
        .spotify-range-container:hover .spotify-range {
          background: rgba(255, 255, 255, 0.25);
        }
        .spotify-range::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          opacity: 0;
          transition: opacity 0.1s ease;
        }
        .spotify-range-container:hover .spotify-range::-webkit-slider-thumb {
          opacity: 1;
        }
        .spotify-range::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          border: none;
          opacity: 0;
          transition: opacity 0.1s ease;
        }
        .spotify-range-container:hover .spotify-range::-moz-range-thumb {
          opacity: 1;
        }
        .track-row {
          transition: background-color 0.2s ease;
        }
        .track-row:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
        }
        .track-row:hover .track-play-btn {
          display: block !important;
        }
        .track-row:hover .track-index {
          display: none !important;
        }
        .control-icon {
          color: #b3b3b3;
          transition: color 0.2s ease, transform 0.1s ease;
        }
        .control-icon:hover {
          color: #fff;
        }
        .control-icon:active {
          transform: scale(0.95);
        }
        .active-green {
          color: #1ed760 !important;
        }
        .active-green:hover {
          color: #1fdf64 !important;
        }
      `}</style>

      {/* Main Container Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", flex: 1, minHeight: 0, padding: "8px 8px 0 8px", gap: 8 }}>
        
        {/* Left Side Navigation Panel */}
        <aside style={{ background: "#121212", borderRadius: 8, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Library Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#b3b3b3", padding: "0 4px" }}>
            <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 1 16 3v18a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3a1 1 0 0 1 .5.134zM7.87 2.134a1 1 0 0 1 .5-.134h3a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V3a1 1 0 0 1 .5-.866z"></path></svg>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Your Library</span>
          </div>

          {/* Current Art Display Grid */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 12 }}>
            <div style={{ width: "100%", aspectRatio: "1", borderRadius: 6, background: "linear-gradient(135deg, #282828 0%, #121212 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
              {/* Minimal vinyl disc core design */}
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#121212" }} />
              </div>
              <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#1ed760", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Now Playing</div>
                <div style={{ fontSize: 22, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentTrack.title}</div>
                <div style={{ fontSize: 14, color: "#b3b3b3", marginTop: 2 }}>{currentTrack.artist}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Section / Playlist Viewer */}
        <section style={{ background: "linear-gradient(180deg, #1e1e1e 0%, #121212 30%)", borderRadius: 8, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
          {/* Header Banner view */}
          <div style={{ padding: "40px 32px 24px 32px", display: "flex", alignItems: "flex-end", gap: 24, background: "linear-gradient(transparent, rgba(0,0,0,0.3))" }}>
            <div style={{ width: 192, height: 192, background: "linear-gradient(135deg, #450e4b 0%, #1e2056 100%)", borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg role="img" height="64" width="64" aria-hidden="true" viewBox="0 0 24 24" fill="#fff"><path d="M6 3h15v15.106a3.5 3.5 0 1 1-2-3.106V7H8v11.106a3.5 3.5 0 1 1-2-3.106V3zm2 4h11V5H8v2z"></path></svg>
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Playlist</span>
              <h1 style={{ fontSize: 72, fontWeight: 900, margin: "8px 0 16px 0", letterSpacing: "-2px", lineHeight: 0.8 }}>Virtual Stream</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, color: "#fff" }}>
                <span style={{ fontWeight: 700 }}>SpotifyOS</span>
                <span style={{ color: "#b3b3b3" }}>• {queue.length} songs,</span>
                <span style={{ color: "#b3b3b3" }}>about 28 min</span>
              </div>
            </div>
          </div>

          {/* Controls bar below banner */}
          <div style={{ padding: "24px 32px", display: "flex", alignItems: "center", gap: 32 }}>
            <button onClick={() => setPlaying(!playing)} style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#1ed760", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.1s ease, background-color 0.1s ease", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1fdf64"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1ed760"} onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"} onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}>
              {playing ? (
                <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" fill="#000"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm9 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
              ) : (
                <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" fill="#000"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
              )}
            </button>
          </div>

          {/* Track Table Header */}
          <div style={{ padding: "0 32px", marginContent: "none" }}>
            <div style={{ display: "grid", gridTemplateColumns: "42px 4fr 3fr auto", gap: 16, padding: "0 16px 8px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#b3b3b3", fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>
              <div>#</div>
              <div>Title</div>
              <div>Album</div>
              <div style={{ paddingRight: 16 }}><svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8.5-4.75a.75.75 0 0 0-1.5 0V8.5a.75.75 0 0 0 .4.66l3.25 1.63a.75.75 0 0 0 .67-1.34L8.5 8.04V3.25z"></path></svg></div>
            </div>
          </div>

          {/* Interactive tracklist content */}
          <div style={{ padding: "12px 32px", flex: 1, overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {queue.map((track, trackIndex) => {
                const active = trackIndex === index;
                return (
                  <div
                    key={track.id}
                    className="track-row"
                    onClick={() => selectTrack(trackIndex, true)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "42px 4fr 3fr auto",
                      gap: 16,
                      padding: "8px 16px",
                      borderRadius: 4,
                      alignItems: "center",
                      cursor: "pointer",
                      background: active ? "rgba(255,255,255,0.05)" : "transparent",
                    }}
                  >
                    {/* Index or instant Play trigger display logic */}
                    <div style={{ fontSize: 15, color: active ? "#1ed760" : "#b3b3b3", position: "relative" }}>
                      <span className="track-index" style={{ display: "block" }}>
                        {active && playing ? (
                          <span style={{ fontSize: 13, letterSpacing: -1 }}>█║</span>
                        ) : trackIndex + 1}
                      </span>
                      <span className="track-play-btn" style={{ display: "none", color: "#fff" }}>▶</span>
                    </div>

                    {/* Metadata Content definitions */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: 16, fontWeight: 500, color: active ? "#1ed760" : "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</div>
                      <div style={{ fontSize: 14, color: "#b3b3b3", marginTop: 4 }}>{track.artist}</div>
                    </div>
                    
                    <div style={{ fontSize: 14, color: "#b3b3b3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.album}</div>
                    
                    <div style={{ fontSize: 14, color: "#b3b3b3", paddingRight: 16, textAlign: "right" }}>{track.duration}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Persistent Spotify Bottom Dock Media Player Bar */}
      <footer style={{ height: 90, background: "#181818", borderTop: "1px solid #282828", display: "grid", gridTemplateColumns: "1fr 2fr 1fr", alignItems: "center", padding: "0 16px", zIndex: 10 }}>
        
        {/* Left Section: Active Media block item metadata */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, background: "#282828", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎵</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#fff", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{currentTrack.title}</div>
            <div style={{ fontSize: 12, color: "#b3b3b3", marginTop: 4, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{currentTrack.artist}</div>
          </div>
        </div>

        {/* Center Section: Primary Track Timelines & Processing actions wrapper */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {/* Deck Action buttons row */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Shuffle Toggle */}
            <button onClick={() => setShuffled(!shuffled)} style={{ background: "none", border: "none", cursor: "pointer" }} className={`control-icon ${shuffled ? "active-green" : ""}`}>
              <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .4 12.5H0V14h.4a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.714-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06l2.3-2.29a.75.75 0 0 0 0-1.06L13.15 1zM11.16 10.5a2.25 2.25 0 0 1-1.714-.804l-.862-1.027-1.129 1.346.858.981A3.75 3.75 0 0 0 11.16 12.5h1.947l-1.017 1.018a.75.75 0 1 0 1.06 1.06l2.3-2.29a.75.75 0 0 0 0-1.06l-2.3-2.29a.75.75 0 1 0-1.06 1.06L13.11 11h-1.95zM4.582 4.887L3.273 3.33A3.75 3.75 0 0 0 .4 2H0v1.5h.4c.66 0 1.28.31 1.674.834l1.31 1.546 1.2-.993z"></path></svg>
            </button>
            
            {/* Back Trigger */}
            <button onClick={prevTrack} style={{ background: "none", border: "none", cursor: "pointer" }} className="control-icon">
              <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"></path></svg>
            </button>

            {/* Play/Pause Core toggle switcher */}
            <button onClick={() => setPlaying(!playing)} style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.1s ease" }} onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.93)"} onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}>
              {playing ? (
                <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="#000"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm7 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
              ) : (
                <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="#000"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path></svg>
              )}
            </button>

            {/* Skip Trigger */}
            <button onClick={nextTrack} style={{ background: "none", border: "none", cursor: "pointer" }} className="control-icon">
              <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"></path></svg>
            </button>

            {/* Loop Controls */}
            <button onClick={() => setRepeat(repeat === "off" ? "all" : repeat === "all" ? "one" : "off")} style={{ background: "none", border: "none", cursor: "pointer" }} className={`control-icon ${repeat !== "off" ? "active-green" : ""}`}>
              <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 4.75A.75.75 0 0 1 .75 4h10a2.25 2.25 0 0 1 2.25 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 0-.75-.75H3.78l1.72 1.72a.75.75 0 1 1-1.06 1.06L1.19 4.56a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 1.06L3.78 2.5h6.97A3.75 3.75 0 0 1 14.5 6.25v2.5a.75.75 0 0 1-1.5 0v-2.5a2.25 2.25 0 0 0-2.25-2.25H1.75A.75.75 0 0 1 0 4.75zM16 11.25a.75.75 0 0 1-.75.75H5.25a2.25 2.25 0 0 1-2.25-2.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .414.336.75.75.75h9.22l-1.72-1.72a.75.75 0 1 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06l1.72-1.72H5.25a3.75 3.75 0 0 1-3.75-3.75v-2.5a.75.75 0 0 1 1.5 0v2.5a2.25 2.25 0 0 0 2.25 2.25h10a.75.75 0 0 1 .75.75z"></path>
              </svg>
              {repeat === "one" && <span style={{ fontSize: 9, position: "absolute", transform: "translate(-6px, 10px)", fontWeight: "bold" }}>1</span>}
            </button>
          </div>

          {/* Scrub timeline tracking elements container layout */}
          <div style={{ width: "100%", maxWidth: 620, display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#a7a7a7" }} className="spotify-range-container">
            <span>{formatTime(progress)}</span>
            <div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative" }}>
              <input
                className="spotify-range"
                type="range"
                min="0"
                max={Number.isFinite(duration) ? duration : 0}
                step="0.1"
                value={Math.min(progress, duration || 0)}
                onChange={(e) => {
                  const nextTime = Number(e.target.value);
                  setProgress(nextTime);
                  if (audioRef.current) audioRef.current.currentTime = nextTime;
                }}
                style={{
                  width: "100%",
                  background: `linear-gradient(to right, #1ed760 0%, #1ed760 ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Section: Volume parameters configuration layout settings option slider */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", paddingRight: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, width: 125 }} className="spotify-range-container">
            <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="#b3b3b3"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.92-4H.75A.75.75 0 0 1 0 10.4V5.6a.75.75 0 0 1 .75-.75h1.321l6.92-4a.75.75 0 0 1 .75 0zm-1.5 2.186L2.92 6H1.5v4h1.42l5.321 3.064V3.036z"></path></svg>
            <input 
              className="spotify-range" 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => setVolume(Number(e.target.value))} 
              style={{
                width: "100%",
                background: `linear-gradient(to right, #1ed760 0%, #1ed760 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}