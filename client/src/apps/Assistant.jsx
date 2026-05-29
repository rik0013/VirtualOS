import React, { useMemo, useRef, useState } from "react";
import { chatWithGroq, GROQ_DEFAULT_MODEL } from "../utils/ai";
import { getNode, resolvePath } from "../utils/fs";

const SYSTEM_PROMPT = `You are VirtualOS Assistant, a desktop agent inside a macOS-like environment.
Be concise, practical, and helpful.
You may either answer normally or return strict JSON only in this format:
{"reply":"short answer","actions":[{"type":"open_app","appId":"terminal"},{"type":"open_file","path":"/absolute/path"},{"type":"create_file","path":"/absolute/path","content":"..."},{"type":"create_folder","path":"/absolute/path"}]}
Rules:
- Use actions when the user asks to open an app or file, create a file, or create a folder.
- If no action is needed, set actions to an empty array.
- Keep reply short.
- Do not wrap the JSON in markdown fences.`;

const QUICK_ACTIONS = [
  { label: "Open Terminal", prompt: "Open the Terminal app." },
  { label: "Open Settings", prompt: "Open the Settings app." },
  { label: "Open Music", prompt: "Open the Music app." },
  { label: "Find README", prompt: "Find and open README.md if it exists." },
];

const parseAgentPayload = (content) => {
  const text = String(content || "").trim();
  const tryParse = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  let parsed = tryParse(text);
  if (!parsed) {
    const fenceMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
    if (fenceMatch) parsed = tryParse(fenceMatch[1].trim());
  }
  if (!parsed) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) parsed = tryParse(text.slice(start, end + 1));
  }

  if (parsed && typeof parsed === "object") {
    return {
      reply: typeof parsed.reply === "string" ? parsed.reply : text,
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    };
  }

  return { reply: text || "I’m here.", actions: [] };
};

export function Assistant({
  winId,
  appState = {},
  updateAppState,
  currentUser,
  cwd = "/",
  fs,
  onOpenApp,
  onOpenFile,
  createFileAtPath,
  createFolderAtPath,
  notify,
}) {
  const [messages, setMessages] = useState(appState.messages || [
    { role: "assistant", content: "Hi, I’m your VirtualOS assistant. Ask me to open apps, open files, or create folders/files." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const contextLabel = useMemo(() => currentUser?.username || "guest", [currentUser]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  const pushMessage = (message) => {
    setMessages((prev) => {
      const next = [...prev, message].slice(-16);
      updateAppState?.(winId, { messages: next });
      return next;
    });
    scrollToBottom();
  };

  const runAction = (action) => {
    if (!action || typeof action !== "object") return;

    if (action.type === "open_app" && action.appId) {
      onOpenApp?.(action.appId);
      return;
    }

    if (action.type === "open_file" && action.path) {
      const targetPath = resolvePath(cwd, action.path);
      const fileName = targetPath.split("/").filter(Boolean).pop() || "file";
      const existingNode = getNode(fs, targetPath);
      const fileContent = typeof action.content === "string" ? action.content : (typeof existingNode === "string" ? existingNode : "");
      onOpenFile?.(targetPath, fileContent, fileName);
      return;
    }

    if (action.type === "create_file" && action.path) {
      const targetPath = resolvePath(cwd, action.path);
      const created = createFileAtPath?.(targetPath, typeof action.content === "string" ? action.content : "");
      if (created) notify?.({ icon: "file", message: `Created ${targetPath}` });
      return;
    }

    if (action.type === "create_folder" && action.path) {
      const targetPath = resolvePath(cwd, action.path);
      const created = createFolderAtPath?.(targetPath);
      if (created) notify?.({ icon: "folder", message: `Created ${targetPath}` });
    }
  };

  const sendPrompt = async (value = input) => {
    const prompt = String(value).trim();
    if (!prompt || sending) return;

    const userMessage = { role: "user", content: prompt };
    const nextMessages = [...messages, userMessage].slice(-16);
    setMessages(nextMessages);
    updateAppState?.(winId, { messages: nextMessages });
    setInput("");
    setSending(true);

    try {
      const response = await chatWithGroq(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: `Current user: ${contextLabel}. Current working directory: ${cwd}.` },
          ...nextMessages,
        ],
        {
          model: GROQ_DEFAULT_MODEL,
          temperature: 0.35,
          max_tokens: 900,
        }
      );

      const content = response?.choices?.[0]?.message?.content || "";
      const payload = parseAgentPayload(content);
      pushMessage({ role: "assistant", content: payload.reply });
      payload.actions.forEach(runAction);
    } catch (error) {
      const message = error?.message || "Groq request failed";
      pushMessage({ role: "assistant", content: `Error: ${message}` });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>Groq Llama Agent</div>
          <div style={titleStyle}>VirtualOS Assistant</div>
        </div>
        <div style={statusStyle}>{sending ? "Thinking…" : `Ready • ${contextLabel}`}</div>
      </div>

      <div style={messagesStyle}>
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            style={{
              ...bubbleStyle,
              alignSelf: message.role === "user" ? "flex-end" : "flex-start",
              background: message.role === "user" ? "linear-gradient(135deg, rgba(37,99,235,0.88), rgba(124,58,237,0.82))" : "rgba(255,255,255,0.07)",
              borderColor: message.role === "user" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)",
            }}
          >
            <div style={roleStyle}>{message.role === "user" ? "You" : "Assistant"}</div>
            <div style={contentStyle}>{message.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={quickRowStyle}>
        {QUICK_ACTIONS.map((item) => (
          <button key={item.label} onClick={() => sendPrompt(item.prompt)} style={quickButtonStyle}>
            {item.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendPrompt();
        }}
        style={composerStyle}
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendPrompt();
            }
          }}
          placeholder='Try: "Open Terminal", "Create a notes folder", or "Open README.md"'
          rows={3}
          style={textareaStyle}
        />
        <div style={composerActionsStyle}>
          <div style={hintStyle}>Enter to send • Shift+Enter for a new line</div>
          <button type="submit" disabled={sending} style={sendButtonStyle}>
            {sending ? "Working…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

const containerStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: "radial-gradient(circle at top, rgba(124,58,237,0.16), transparent 38%), linear-gradient(180deg, rgba(10,12,20,0.98), rgba(14,18,28,0.98))",
  color: "#fff",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "16px 18px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const eyebrowStyle = {
  fontSize: 11,
  letterSpacing: 1.8,
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.55)",
};

const titleStyle = {
  marginTop: 4,
  fontSize: 24,
  fontWeight: 900,
};

const statusStyle = {
  fontSize: 12,
  color: "rgba(255,255,255,0.64)",
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const messagesStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: 18,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const bubbleStyle = {
  maxWidth: "84%",
  padding: "12px 14px",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 14px 28px rgba(0,0,0,0.18)",
};

const roleStyle = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "rgba(255,255,255,0.62)",
  marginBottom: 8,
};

const contentStyle = {
  whiteSpace: "pre-wrap",
  lineHeight: 1.55,
  fontSize: 14,
  color: "#fff",
};

const quickRowStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  padding: "0 18px 14px",
};

const quickButtonStyle = {
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const composerStyle = {
  padding: 18,
  borderTop: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
};

const textareaStyle = {
  width: "100%",
  resize: "none",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  borderRadius: 18,
  padding: 14,
  outline: "none",
  fontFamily: "inherit",
  fontSize: 14,
  lineHeight: 1.5,
};

const composerActionsStyle = {
  marginTop: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const hintStyle = {
  fontSize: 12,
  color: "rgba(255,255,255,0.56)",
};

const sendButtonStyle = {
  border: "none",
  borderRadius: 999,
  padding: "10px 16px",
  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  minWidth: 92,
};
