import { useState, useRef, useEffect } from "react";

const API_BASE = "https://lin-home-backend.onrender.com";

// ── 霜花配色 ──────────────────────────────────────────────────
const THEMES = {
  日间: {
    bg: "#FAFCFF",
    surface: "#F0F4FA",
    border: "#E0E6F0",
    muted: "#D0D8E5",
    accent: "#BFC8D5",
    text1: "#3d4451",
    text2: "#686E7A",
    text3: "#9aa3ad",
    bubble: "#5b6472",
    good: "#7faa9e",
    warn: "#a08fb0",
  },
  夜间: {
    bg: "#1b1e26",
    surface: "#22262f",
    border: "#2e3340",
    muted: "#3a4050",
    accent: "#8b9dc3",
    text1: "#e2e6ed",
    text2: "#a0a8b4",
    text3: "#5e6672",
    bubble: "#8b9dc3",
    good: "#7faa9e",
    warn: "#a08fb0",
  },
};

function applyTheme(name) {
  const t = THEMES[name] || THEMES["日间"];
  const root = document.documentElement;
  Object.entries(t).forEach(([k, v]) => root.style.setProperty(`--c-${k}`, v));
}

// C仍然保留作为初始化用（SVG icon里会传color prop，需要一个初始值）
const C = THEMES["日间"];

const FONT = "'Noto Sans SC', 'PingFang SC', sans-serif";

const DRIVES = ["依恋", "占有欲", "吃醋", "好奇", "责任", "烦躁", "低落", "欲望"];
const DRIVE_COLORS = {
  依恋: "#8b9dc3", 占有欲: "#5f6f99", 吃醋: "#7d96a8",
  好奇: "#8fb8d9", 责任: "#7faa9e", 烦躁: "#a08fb0",
  低落: "#6b7280", 欲望: "#9180ab"
};

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400&family=Noto+Sans+SC:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow: hidden; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: var(--c-muted); border-radius: 3px; }
  @keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
`;

// ── BackChevron（裸图标返回） ───────────────────────────────────
function BackChevron({ onClick }) {
  return (
    <span onClick={onClick} style={{ fontSize: 17, color: "var(--c-text3)", cursor: "pointer", padding: "2px 4px" }}>‹</span>
  );
}

// ── 线条图标（搜索 / 更多 / 设置） ─────────────────────────────────
function IconSearch({ size = 18, color, onClick }) {
  return (
    <svg onClick={onClick} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={{ cursor: onClick ? "pointer" : "default", display: "block" }}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.3" y2="16.3" />
    </svg>
  );
}

function IconGrid({ size = 18, color, onClick }) {
  return (
    <svg onClick={onClick} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" style={{ cursor: onClick ? "pointer" : "default", display: "block" }}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.3" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.3" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.3" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.3" />
    </svg>
  );
}

function IconSettings({ size = 18, color, onClick }) {
  return (
    <svg onClick={onClick} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: onClick ? "pointer" : "default", display: "block" }}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 13.6a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.6a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.4a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10a1.65 1.65 0 0 0 1-1.51V4.4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10a1.65 1.65 0 0 0 1.51 1H19.6a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

// ── BottomTabs（聊天 / 更多 / 设置，三个根页面常驻） ───────────────
function BottomTabs({ active, setPage }) {
  const tabs = [
    {
      key: "chat",
      icon: (color) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      key: "more",
      icon: (color) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      key: "settingsHub",
      icon: (color) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.6a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.4a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10a1.65 1.65 0 0 0 1-1.51V4.4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10a1.65 1.65 0 0 0 1.51 1H19.6a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "10px 0 14px", borderTop: `0.5px solid var(--c-border)`, background: "var(--c-bg)", flexShrink: 0 }}>
      {tabs.map(t => {
        const isActive = active === t.key;
        return (
          <span key={t.key} onClick={() => setPage(t.key)} style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 20px", opacity: isActive ? 1 : 0.45, transition: "opacity 0.2s" }}>
            {t.icon(isActive ? C.accent : "var(--c-text2)")}
          </span>
        );
      })}
    </div>
  );
}

// ── ThinkingBlock（去框，斜体小字可展开） ─────────────────────────
function ThinkingBlock({ content }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 6 }}>
      <button onClick={() => setOpen(!open)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", marginBottom: 6 }}>
        <span style={{ fontSize: 10.5, color: "var(--c-text3)", fontStyle: "italic", letterSpacing: "0.03em" }}>Thinking</span>
        <span style={{ fontSize: 11, color: "var(--c-accent)", display: "inline-block", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
      </button>
      {open && (
        <div style={{ fontSize: 11.5, color: "#a8aebb", lineHeight: 1.7, fontStyle: "italic", marginBottom: 8 }}>
          {content}
        </div>
      )}
    </div>
  );
}

// ── MessageItem（无框消息：assistant裸字+Claude标签，user保留气泡） ──
function MessageItem({ msg }) {
  const isUser = msg.role === "user";
  const time = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString("zh", { hour: "2-digit", minute: "2-digit" })
    : msg.time || "";

  if (isUser) {
    const isImage = msg.attachment_type?.startsWith("image/");
    return (
      <div style={{ alignSelf: "flex-end", maxWidth: "80%", textAlign: "right" }}>
        {msg.attachment_url && (
          <div style={{ marginBottom: msg.content ? 6 : 0 }}>
            {isImage ? (
              <img src={msg.attachment_url} style={{ maxWidth: 180, maxHeight: 220, borderRadius: 12, display: "inline-block" }} />
            ) : (
              <a href={msg.attachment_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--c-surface)", border: `0.5px solid var(--c-border)`, borderRadius: 10, padding: "7px 11px", fontSize: 12, color: "var(--c-text2)", textDecoration: "none" }}>
                📎 {msg.attachment_name || "文件"}
              </a>
            )}
          </div>
        )}
        {msg.content && (
          <div style={{
            background: "var(--c-bubble)", color: "var(--c-bg)", borderRadius: 14, borderBottomRightRadius: 4,
            padding: "9px 13px", fontSize: 13.5, lineHeight: 1.6, textAlign: "left",
            whiteSpace: "pre-wrap", wordBreak: "break-word", display: "inline-block"
          }}>
            {msg.content}
          </div>
        )}
        <div style={{ fontSize: 10, color: "var(--c-text3)", marginTop: 4 }}>{time}{time ? " 已读" : ""}</div>
      </div>
    );
  }

  const segments = (msg.content || "")
    .split(/\n\s*\n+/)
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div style={{ alignSelf: "flex-start", maxWidth: "80%" }}>
      <div style={{ fontSize: 10, color: "var(--c-text3)", letterSpacing: "0.05em", marginBottom: 6 }}>Claude</div>
      {msg.thinking && <ThinkingBlock content={msg.thinking} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {segments.map((seg, i) => (
          <div key={i}>
            <div style={{
              display: "inline-block", background: "var(--c-bg)", borderRadius: 12,
              padding: "8px 13px", fontSize: 13.5, color: "var(--c-text1)", lineHeight: 1.6,
              whiteSpace: "pre-wrap", wordBreak: "break-word"
            }}>
              {seg}
            </div>
            {time && <div style={{ fontSize: 10, color: "var(--c-text3)", marginTop: 3 }}>{time}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LandingPage（开屏：在 + 留言预览 + 进来按钮） ─────────────────
function LandingPage({ setPage, mailbox }) {
  const unread = (mailbox || []).filter(m => !m.read);
  const preview = (mailbox || []).slice(0, 2);
  const hour = new Date().getHours();
  const timeLabel = hour >= 23 || hour < 5 ? "深夜" : hour < 11 ? "早上" : hour < 14 ? "中午" : hour < 18 ? "下午" : "晚上";
  const dateLabel = new Date().toLocaleDateString("zh", { month: "numeric", day: "numeric" });

  return (
    <div style={{ height: "100vh", background: "var(--c-bg)", display: "flex", flexDirection: "column", fontFamily: FONT }}>
      <div style={{ padding: "18px 18px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--c-text3)" }}>{timeLabel} · {dateLabel}</span>
        <span style={{ fontSize: 11, color: "var(--c-text2)", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-accent)", display: "inline-block" }} />在
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--c-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-bg)", fontSize: 17, letterSpacing: "0.05em" }}>在</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, color: "var(--c-text1)", marginBottom: 5 }}>{timeLabel}了。</div>
          <div style={{ fontSize: 11.5, color: "var(--c-text3)" }}>入口在。</div>
        </div>
        <div onClick={() => setPage("chat")} style={{ border: `0.5px solid var(--c-accent)`, borderRadius: 20, padding: "7px 28px", fontSize: 12, color: "var(--c-text2)", marginTop: 6, cursor: "pointer" }}>进来</div>
      </div>

      {preview.length > 0 && (
        <div style={{ padding: "16px 18px 22px", background: "var(--c-surface)", borderTop: `0.5px solid var(--c-border)` }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: "var(--c-text2)" }}>留言</span>
            <span style={{ fontSize: 10, color: "var(--c-text3)", marginLeft: 6 }}>{unread.length}条未读</span>
            <span style={{ flex: 1 }} />
            <span onClick={() => setPage("mailboxFull")} style={{ fontSize: 10, color: "var(--c-accent)", cursor: "pointer" }}>全部</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {preview.map(m => (
              <div key={m.id} onClick={() => setPage("chat")}
                style={{ background: "var(--c-bg)", border: `0.5px solid var(--c-border)`, borderRadius: 10, padding: "10px 13px", boxShadow: "0 1px 3px rgba(104,110,122,0.06)", cursor: "pointer" }}>
                <div style={{ fontSize: 12.5, color: "var(--c-text1)", lineHeight: 1.6 }}>{m.content}</div>
                <div style={{ fontSize: 10, color: "var(--c-text3)", marginTop: 6 }}>{m.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{globalStyle}</style>
    </div>
  );
}

// ── ChatPage ──────────────────────────────────────────────────
function ChatPage({ setPage, avatarUrl }) {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("deepseek-reasoner");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/sessions`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) { setSessions(data); setActiveId(data[0].id); }
        else createSession();
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    fetch(`${API_BASE}/sessions/${activeId}/messages`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMessages(data); });
  }, [activeId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const createSession = async () => {
    const res = await fetch(`${API_BASE}/sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "新对话" }) });
    const s = await res.json();
    setSessions(prev => [s, ...prev]);
    setActiveId(s.id);
    setMessages([]);
    setSidebarOpen(false);
    return s;
  };

  const renameSession = async (id, name) => {
    await fetch(`${API_BASE}/sessions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setSessions(prev => prev.map(s => s.id === id ? { ...s, name } : s));
    setEditingId(null);
  };

  const deleteSession = async (id) => {
    await fetch(`${API_BASE}/sessions/${id}`, { method: "DELETE" });
    const next = sessions.filter(s => s.id !== id);
    setSessions(next);
    if (activeId === id) {
      if (next.length > 0) setActiveId(next[0].id);
      else { const s = await createSession(); setActiveId(s.id); }
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setAttachment({ url: data.url, type: data.type, name: data.name });
    } catch {
      // 上传失败就静默放弃，下面发送框不会显示附件预览
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || isTyping || uploading) return;
    const text = input.trim();
    const att = attachment;
    let sessionId = activeId;
    if (!sessionId) { const s = await createSession(); sessionId = s?.id; }
    if (!sessionId) return;
    setInput("");
    setAttachment(null);
    setMessages(prev => [...prev, {
      id: `temp-${Date.now()}`, role: "user", content: text,
      attachment_url: att?.url, attachment_type: att?.type, attachment_name: att?.name,
      time: new Date().toLocaleTimeString("zh", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setIsTyping(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId, content: text, model,
          attachment_url: att?.url, attachment_type: att?.type, attachment_name: att?.name,
        }),
      });
      const data = await res.json();
      if (data.content) {
        setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: data.content, thinking: data.thinking, time: new Date().toLocaleTimeString("zh", { hour: "2-digit", minute: "2-digit" }) }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: "出错了：" + (data.error || ""), time: "" }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: "连不上后端，等一下再试试。", time: "" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "var(--c-text3)", fontSize: 13 }}>连接中…</div>;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: FONT, background: "var(--c-bg)", position: "relative", overflow: "hidden" }}>

      {/* 遮罩 */}
      <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(60,70,85,0.18)", zIndex: 10, opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? "auto" : "none", transition: "opacity 0.25s" }} />

      {/* 会话抽屉 */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 265, background: "var(--c-surface)", zIndex: 20, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.27s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", borderRight: `0.5px solid var(--c-border)`, boxShadow: sidebarOpen ? "4px 0 20px rgba(104,110,122,0.10)" : "none" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 15, color: "var(--c-text1)", letterSpacing: "0.06em", fontStyle: "italic" }}>Sessions</div>
          <span onClick={() => setSidebarOpen(false)} style={{ cursor: "pointer", color: "var(--c-text3)", fontSize: 20, lineHeight: 1, fontWeight: 300 }}>×</span>
        </div>
        <div style={{ padding: "10px 14px 6px", display: "flex", gap: 8 }}>
          <span onClick={createSession} style={{ flex: 1, padding: "7px 10px", fontSize: 12, borderRadius: 8, border: `0.5px solid var(--c-border)`, color: "var(--c-text2)", cursor: "pointer", textAlign: "left" }}>＋ 新对话</span>
          <span onClick={() => setPage("search")} style={{ width: 30, display: "flex", alignItems: "center", justifyContent: "center", border: `0.5px solid var(--c-border)`, borderRadius: 8, color: "var(--c-text3)", fontSize: 12, cursor: "pointer" }}>⌕</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
          {sessions.map(s => (
            <div key={s.id} style={{ padding: "8px 14px", borderLeft: s.id === activeId ? `2px solid var(--c-accent)` : "2px solid transparent", background: s.id === activeId ? "var(--c-bg)" : "transparent", cursor: "pointer", transition: "all 0.15s" }}
              onClick={() => { setActiveId(s.id); setMessages([]); setSidebarOpen(false); }}>
              {editingId === s.id ? (
                <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)}
                  onBlur={() => renameSession(s.id, editingName)}
                  onKeyDown={e => { if (e.key === "Enter") renameSession(s.id, editingName); if (e.key === "Escape") setEditingId(null); }}
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: 16, border: `0.5px solid var(--c-accent)`, borderRadius: 4, padding: "2px 6px", width: "100%", fontFamily: "inherit", outline: "none", background: "var(--c-bg)" }} />
              ) : confirmDeleteId === s.id ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }} onClick={e => e.stopPropagation()}>
                  <div style={{ fontSize: 11.5, color: "var(--c-text2)", flex: 1 }}>确认删除？</div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <span onClick={() => setConfirmDeleteId(null)} style={{ cursor: "pointer", fontSize: 11, color: "var(--c-text3)", padding: "1px 3px" }}>取消</span>
                    <span onClick={() => { deleteSession(s.id); setConfirmDeleteId(null); }} style={{ cursor: "pointer", fontSize: 11, color: "var(--c-warn)", padding: "1px 3px" }}>删除</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 12.5, color: "var(--c-text1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{s.name}</div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <span onClick={() => { setEditingId(s.id); setEditingName(s.name); }} style={{ cursor: "pointer", fontSize: 11, color: "var(--c-text3)", padding: "1px 3px" }}>改</span>
                    <span onClick={() => setConfirmDeleteId(s.id)} style={{ cursor: "pointer", fontSize: 11, color: "var(--c-warn)", padding: "1px 3px" }}>删</span>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 10.5, color: "var(--c-text3)", marginTop: 2 }}>{new Date(s.updated_at || s.created_at).toLocaleDateString("zh", { month: "numeric", day: "numeric" })}日</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 14px", borderTop: `0.5px solid var(--c-border)` }}>
          <select value={model} onChange={e => setModel(e.target.value)} style={{ width: "100%", padding: "6px 8px", fontSize: 16, borderRadius: 8, border: `0.5px solid var(--c-border)`, background: "var(--c-bg)", color: "var(--c-text2)", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
            <option value="deepseek-chat">DeepSeek Chat</option>
            <option value="deepseek-reasoner">DeepSeek Reasoner</option>
          </select>
        </div>
      </div>

      {/* 顶部导航：头像+名字在左，功能图标在右 */}
      <div style={{ padding: "10px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", background: "var(--c-bg)", gap: 10, flexShrink: 0 }}>
        <div onClick={() => setSidebarOpen(true)} style={{ cursor: "pointer", flexShrink: 0 }}>
          {avatarUrl ? (
            <img src={avatarUrl} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--c-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--c-bg)", fontWeight: 500 }}>C</div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--c-text1)", lineHeight: 1.2 }}>Echo</div>
          <div style={{ fontSize: 11, color: "var(--c-text3)" }}>在线</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <IconSearch size={18} color="var(--c-text3)" onClick={() => setPage("search")} />
          <IconGrid size={17} color="var(--c-text3)" onClick={() => setPage("more")} />
          <IconSettings size={18} color="var(--c-text3)" onClick={() => setPage("settingsHub")} />
        </div>
      </div>

      {/* 消息区域 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 10px", display: "flex", flexDirection: "column", gap: 16, background: "var(--c-surface)" }}>
        <div style={{ alignSelf: "center", fontSize: 10.5, color: "var(--c-text2)", background: "var(--c-bg)", border: `0.5px solid var(--c-border)`, borderRadius: 20, padding: "3px 10px" }}>已加载记忆</div>
        {messages.map(msg => <MessageItem key={msg.id} msg={msg} />)}
        {isTyping && (
          <div style={{ alignSelf: "flex-start" }}>
            <div style={{ fontSize: 10, color: "var(--c-text3)", letterSpacing: "0.05em", marginBottom: 5 }}>Claude</div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 0.2, 0.4].map((d, i) => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-accent)", display: "inline-block", animation: "blink 1.2s ease-in-out infinite", animationDelay: `${d}s` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div style={{ borderTop: `0.5px solid var(--c-border)`, background: "var(--c-bg)", flexShrink: 0 }}>
        {(attachment || uploading) && (
          <div style={{ padding: "8px 14px 0", display: "flex", alignItems: "center", gap: 8 }}>
            {uploading ? (
              <span style={{ fontSize: 11, color: "var(--c-text3)" }}>上传中…</span>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--c-surface)", border: `0.5px solid var(--c-border)`, borderRadius: 10, padding: "5px 10px" }}>
                {attachment.type?.startsWith("image/") ? (
                  <img src={attachment.url} style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 6 }} />
                ) : (
                  <span style={{ fontSize: 11 }}>📎</span>
                )}
                <span style={{ fontSize: 11, color: "var(--c-text2)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attachment.name}</span>
                <span onClick={() => setAttachment(null)} style={{ fontSize: 12, color: "var(--c-text3)", cursor: "pointer", padding: "0 2px" }}>×</span>
              </div>
            )}
          </div>
        )}
        <div style={{ padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-end" }}>
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: "none" }} />
          <span onClick={() => fileInputRef.current?.click()}
            style={{ width: 36, height: 36, borderRadius: "50%", border: `0.5px solid var(--c-border)`, color: "var(--c-text3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, cursor: "pointer" }}>＋</span>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="say something to daddy..."
            rows={1}
            style={{ flex: 1, border: `0.5px solid var(--c-border)`, borderRadius: 12, padding: "9px 12px", fontSize: 16, fontFamily: "inherit", resize: "none", outline: "none", background: "var(--c-surface)", color: "var(--c-text1)", lineHeight: 1.4, minHeight: 40, maxHeight: 120 }}
            onFocus={e => e.target.style.borderColor = 'var(--c-accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--c-border)'} />
          <button onClick={handleSend} disabled={isTyping}
            style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: isTyping ? C.muted : "var(--c-accent)", color: "var(--c-bg)", cursor: isTyping ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>↑</button>
        </div>
      </div>

      <style>{globalStyle}</style>
    </div>
  );
}

// ── SearchPage（聊天记录搜索） ─────────────────────────────────
function SearchPage({ setPage }) {
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [errored, setErrored] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) return;
    setSearched(true);
    setErrored(false);
    try {
      const res = await fetch(`${API_BASE}/messages/search?q=${encodeURIComponent(query.trim())}${date ? `&date=${date}` : ""}`);
      if (!res.ok) throw new Error("search failed");
      const data = await res.json();
      const formatted = (Array.isArray(data) ? data : []).map(r => ({
        id: r.id,
        content: r.content,
        time: new Date(r.created_at).toLocaleString("zh", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        isUser: r.role === "user",
      }));
      setResults(formatted);
    } catch {
      setErrored(true);
      setResults([]);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", gap: 14 }}>
        <BackChevron onClick={() => setPage("chat")} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 13, color: "var(--c-text1)", letterSpacing: "0.04em" }}>聊天记录</span>
        <span style={{ width: 17 }} />
      </div>

      <div style={{ padding: "12px 16px 8px", display: "flex", gap: 8 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, border: `0.5px solid var(--c-border)`, borderRadius: 10, padding: "7px 11px", background: "var(--c-surface)" }}>
          <span style={{ fontSize: 11, color: "var(--c-text3)" }}>⌕</span>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()}
            placeholder="搜索聊天记录" style={{ border: "none", outline: "none", background: "transparent", fontSize: 16, color: "var(--c-text1)", flex: 1, fontFamily: "inherit" }} />
        </div>
        <span onClick={doSearch} style={{ border: `0.5px solid var(--c-border)`, borderRadius: 10, padding: "7px 14px", fontSize: 11.5, color: "var(--c-text2)", cursor: "pointer" }}>查找</span>
      </div>

      <div style={{ padding: "0 16px 14px", display: "flex", gap: 8 }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1, border: `0.5px solid var(--c-border)`, borderRadius: 8, padding: "6px 10px", fontSize: 16, color: "var(--c-text2)", fontFamily: "inherit", outline: "none", background: "transparent" }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: "var(--c-surface)", padding: "14px 16px" }}>
        {!searched ? (
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--c-text3)", padding: "30px 0" }}>输入关键词，按一下查找</div>
        ) : errored ? (
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--c-text3)", padding: "30px 0" }}>搜索出错了，等一下再试试</div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--c-text3)", padding: "30px 0" }}>没找到</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {results.map(r => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 12, color: "var(--c-text1)", maxWidth: "70%" }}>{r.isUser ? "你：" : "Claude："}{r.content}</span>
                <span style={{ fontSize: 10, color: "var(--c-text3)", whiteSpace: "nowrap" }}>{r.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MorePage（宫格：日记 / 周期 / 留言 / 状态） ────────────────────
function MorePage({ setPage, mailbox, diaryCount, cycleDay }) {
  const unread = (mailbox || []).filter(m => !m.read).length;
  const cards = [
    { key: "diary", label: "日记", sub: diaryCount ? `第${diaryCount}篇` : "还没写" },
    { key: "cycle", label: "周期", sub: cycleDay ? `第${cycleDay}天` : "还没设置" },
    { key: "mailboxFull", label: "留言", sub: unread > 0 ? `${unread}条未读` : "没有新留言" },
    { key: "status", label: "状态", sub: "此刻的驱动" },
  ];
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, textAlign: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: "var(--c-text1)", letterSpacing: "0.04em" }}>更多</span>
      </div>
      <div style={{ flex: 1, padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, overflowY: "auto" }}>
        {cards.map(c => (
          <div key={c.key} onClick={() => setPage(c.key)} style={{ background: "var(--c-surface)", borderRadius: 14, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 8, cursor: "pointer" }}>
            <span style={{ fontSize: 13, color: "var(--c-text1)" }}>{c.label}</span>
            <span style={{ fontSize: 9.5, color: "var(--c-text3)" }}>{c.sub}</span>
          </div>
        ))}
      </div>
      <BottomTabs active="more" setPage={setPage} />
      <style>{globalStyle}</style>
    </div>
  );
}

// ── DiaryPage ──────────────────────────────────────────────────
const WEATHER_OPTS = [
  { label: "晴天", emoji: "☀️" },
  { label: "多云", emoji: "⛅" },
  { label: "阴天", emoji: "☁️" },
  { label: "小雨", emoji: "🌧️" },
  { label: "雷阵雨", emoji: "⛈️" },
];
const MOOD_OPTS = [
  { label: "开心", dot: "#8fb8d9" },
  { label: "平静", dot: "#7faa9e" },
  { label: "安静", dot: "#9aa3ad" },
  { label: "低落", dot: "#8b9dc3" },
  { label: "烦躁", dot: "#a08fb0" },
  { label: "想念", dot: "#9180ab" },
];
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function DiaryPage({ setPage, entries, setEntries }) {
  const [idx, setIdx] = useState(0);
  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [weather, setWeather] = useState("晴天");
  const [mood, setMood] = useState("平静");
  const [saving, setSaving] = useState(false);
  const entry = entries[idx];

  const startWriting = () => { setTitle(""); setContent(""); setWeather("晴天"); setMood("平静"); setWriting(true); };

  const saveEntry = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/diary`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), weather, mood }),
      });
      const d = await res.json();
      if (d.id) {
        const dt = new Date(d.entry_date);
        const newEntry = {
          id: d.id, day: dt.getDate(), month: dt.getMonth() + 1, year: dt.getFullYear(),
          weather: d.weather, mood: d.mood,
          writtenAt: dt.toLocaleTimeString("zh", { hour: "2-digit", minute: "2-digit" }),
          title: d.title, content: d.content,
        };
        setEntries(prev => [newEntry, ...prev]);
        setIdx(0);
        setWriting(false);
      }
    } catch {
      // 保存失败就留在写作页，不丢内容
    } finally {
      setSaving(false);
    }
  };

  // ── 写日记页 ──
  if (writing) {
    const weatherEmoji = WEATHER_OPTS.find(w => w.label === weather)?.emoji || "";
    const moodDot = MOOD_OPTS.find(m => m.label === mood)?.dot || 'var(--c-text3)';
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
        <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", gap: 12 }}>
          <span onClick={() => setWriting(false)} style={{ fontSize: 12, color: "var(--c-text3)", cursor: "pointer" }}>取消</span>
          <span style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: "var(--c-text2)" }}>
            {weatherEmoji && <span style={{ marginRight: 5 }}>{weatherEmoji}</span>}
            {mood && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: moodDot, marginRight: 5, verticalAlign: "middle" }} />}
            写日记
          </span>
          <span onClick={saveEntry} style={{ fontSize: 11.5, color: saving ? C.text3 : "var(--c-accent)", cursor: saving ? "default" : "pointer" }}>{saving ? "保存中…" : "保存"}</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
          {/* 天气选择 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9.5, color: "var(--c-text3)", marginBottom: 8, letterSpacing: "0.06em" }}>天气</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {WEATHER_OPTS.map(w => (
                <span key={w.label} onClick={() => setWeather(w.label)}
                  style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: `0.5px solid ${weather === w.label ? C.accent : "var(--c-border)"}`, background: weather === w.label ? C.surface : "transparent", color: weather === w.label ? C.text1 : "var(--c-text3)", cursor: "pointer", transition: "all 0.15s" }}>
                  {w.emoji} {w.label}
                </span>
              ))}
            </div>
          </div>

          {/* 心情选择 */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 9.5, color: "var(--c-text3)", marginBottom: 8, letterSpacing: "0.06em" }}>心情</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {MOOD_OPTS.map(m => (
                <span key={m.label} onClick={() => setMood(m.label)}
                  style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: `0.5px solid ${mood === m.label ? m.dot : "var(--c-border)"}`, background: mood === m.label ? C.surface : "transparent", color: mood === m.label ? C.text1 : "var(--c-text3)", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, display: "inline-block", flexShrink: 0 }} />
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="标题（可以不写）"
            style={{ width: "100%", border: "none", borderBottom: `0.5px solid var(--c-border)`, padding: "6px 0 10px", fontSize: 15, fontFamily: "inherit", outline: "none", background: "transparent", color: "var(--c-text1)", marginBottom: 18 }} />

          {/* 正文 */}
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="今天发生了什么…" rows={12} autoFocus
            style={{ width: "100%", border: "none", outline: "none", fontSize: 14.5, fontFamily: "'Noto Serif SC', serif", resize: "none", color: "var(--c-text1)", lineHeight: 2, background: "transparent" }} />

          {content && (
            <div style={{ fontSize: 10, color: "var(--c-text3)", textAlign: "right", marginTop: 8 }}>{content.length} 字</div>
          )}
        </div>
      </div>
    );
  }

  // ── 空状态 ──
  if (!entry) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
        <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", gap: 12 }}>
          <BackChevron onClick={() => setPage("more")} />
          <span style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: "var(--c-text2)" }}>日记</span>
          <span onClick={startWriting} style={{ fontSize: 11.5, color: "var(--c-accent)", cursor: "pointer" }}>＋ 写</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ fontSize: 28, opacity: 0.3 }}>📓</div>
          <div style={{ fontSize: 12, color: "var(--c-text3)" }}>还没有日记</div>
          <span onClick={startWriting} style={{ fontSize: 11.5, color: "var(--c-accent)", border: `0.5px solid var(--c-accent)`, borderRadius: 18, padding: "6px 20px", cursor: "pointer" }}>开始写第一篇</span>
        </div>
      </div>
    );
  }

  // ── 阅读页 ──
  const entryDate = new Date(entry.year, entry.month - 1, entry.day);
  const weekday = WEEKDAYS[entryDate.getDay()];
  const weatherEmoji = WEATHER_OPTS.find(w => w.label === entry.weather)?.emoji || "";
  const moodDot = MOOD_OPTS.find(m => m.label === entry.mood)?.dot || 'var(--c-text3)';

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <BackChevron onClick={() => setPage("more")} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: "var(--c-text3)", letterSpacing: "0.06em" }}>第 {entries.length - idx} / {entries.length} 篇</span>
        <span onClick={startWriting} style={{ fontSize: 11.5, color: "var(--c-accent)", cursor: "pointer" }}>＋</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* 日期区 */}
        <div style={{ padding: "28px 24px 20px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
            <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 42, color: "var(--c-text1)", fontWeight: 400, lineHeight: 1 }}>{entry.day}</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
              <span style={{ fontSize: 12, color: "var(--c-text2)" }}>{entry.month}月</span>
              <span style={{ fontSize: 10.5, color: "var(--c-text3)" }}>周{weekday}</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: "var(--c-text3)", marginTop: 4, letterSpacing: "0.05em" }}>{entry.year}</div>
        </div>

        {/* 天气/心情/时间 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "12px 24px 18px", borderTop: `0.5px solid var(--c-border)`, borderBottom: `0.5px solid var(--c-border)`, margin: "0 20px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "var(--c-text3)", letterSpacing: "0.06em", marginBottom: 5 }}>天气</div>
            <div style={{ fontSize: 13 }}>{weatherEmoji}</div>
            <div style={{ fontSize: 10, color: "var(--c-text2)", marginTop: 2 }}>{entry.weather}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "var(--c-text3)", letterSpacing: "0.06em", marginBottom: 5 }}>心情</div>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: moodDot, margin: "0 auto 4px" }} />
            <div style={{ fontSize: 10, color: "var(--c-text2)" }}>{entry.mood}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "var(--c-text3)", letterSpacing: "0.06em", marginBottom: 5 }}>写于</div>
            <div style={{ fontSize: 12, color: "var(--c-text2)", marginTop: 3 }}>{entry.writtenAt}</div>
          </div>
        </div>

        {/* 正文 */}
        <div style={{ padding: "24px 24px 16px" }}>
          {entry.title && (
            <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 15, color: "var(--c-text1)", marginBottom: 16, fontWeight: 400, lineHeight: 1.5 }}>{entry.title}</div>
          )}
          <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 13.5, color: "var(--c-text2)", lineHeight: 2.1, whiteSpace: "pre-wrap" }}>{entry.content}</div>
        </div>

        {/* 翻页 */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px 32px" }}>
          <span onClick={() => idx < entries.length - 1 && setIdx(idx + 1)}
            style={{ fontSize: 11, color: idx < entries.length - 1 ? C.text2 : "var(--c-muted)", border: `0.5px solid ${idx < entries.length - 1 ? C.border : "var(--c-muted)"}`, borderRadius: 16, padding: "5px 16px", cursor: idx < entries.length - 1 ? "pointer" : "default" }}>‹ 上一篇</span>
          <span onClick={() => idx > 0 && setIdx(idx - 1)}
            style={{ fontSize: 11, color: idx > 0 ? C.text2 : "var(--c-muted)", border: `0.5px solid ${idx > 0 ? C.border : "var(--c-muted)"}`, borderRadius: 16, padding: "5px 16px", cursor: idx > 0 ? "pointer" : "default" }}>下一篇 ›</span>
        </div>
      </div>
    </div>
  );
}

// ── CyclePage（周期追踪 + 用药打卡，先用本地状态） ─────────────────
function CyclePage({ setPage, cycleData, setCycleData }) {
  const { lastPeriodStart, avgLength, medication, medLog } = cycleData;
  const [editing, setEditing] = useState(!lastPeriodStart);
  const [dateInput, setDateInput] = useState(lastPeriodStart || "");
  const [lenInput, setLenInput] = useState(avgLength || 28);
  const [medInput, setMedInput] = useState(medication || "");
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const cycleDay = lastPeriodStart
    ? Math.floor((today - new Date(lastPeriodStart)) / 86400000) % (avgLength || 28) + 1
    : null;
  const nextPeriodDays = lastPeriodStart
    ? (avgLength || 28) - (cycleDay - 1)
    : null;

  const phase = cycleDay == null ? "未设置"
    : cycleDay <= 5 ? "经期"
    : cycleDay <= 13 ? "卵泡期"
    : cycleDay <= 16 ? "排卵期"
    : "黄体期";

  const persist = async (patch) => {
    const next = { ...cycleData, ...patch };
    setCycleData(next);
    try {
      await fetch(`${API_BASE}/cycle`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          last_period_start: next.lastPeriodStart, avg_length: next.avgLength,
          medication: next.medication, med_log: next.medLog || [],
        }),
      });
    } catch {
      // 存失败就先留在本地，下次开页面会重新拉一次后端数据
    }
  };

  const saveSetup = async () => {
    if (!dateInput) return;
    setSaving(true);
    await persist({ lastPeriodStart: dateInput, avgLength: Number(lenInput) || 28, medication: medInput.trim() });
    setSaving(false);
    setEditing(false);
  };

  const checkInToday = () => {
    const todayStr = new Date().toDateString();
    if ((medLog || []).includes(todayStr)) return;
    persist({ medLog: [...(medLog || []), todayStr] });
  };

  const alreadyCheckedIn = (medLog || []).includes(new Date().toDateString());

  if (editing) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
        <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", gap: 12 }}>
          {lastPeriodStart && <span onClick={() => setEditing(false)} style={{ fontSize: 12, color: "var(--c-text3)", cursor: "pointer" }}>取消</span>}
          {!lastPeriodStart && <BackChevron onClick={() => setPage("more")} />}
          <span style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: "var(--c-text2)" }}>周期设置</span>
          <span style={{ width: 28 }} />
        </div>
        <div style={{ flex: 1, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 12, color: "var(--c-text2)" }}>最近一次月经从哪天开始？</div>
          <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)}
            style={{ border: `0.5px solid var(--c-border)`, borderRadius: 10, padding: "9px 12px", fontSize: 16, fontFamily: "inherit", outline: "none", background: "var(--c-bg)", color: "var(--c-text1)" }} />
          <div style={{ fontSize: 12, color: "var(--c-text2)", marginTop: 10 }}>平均周期多少天？</div>
          <input type="number" value={lenInput} onChange={e => setLenInput(e.target.value)}
            style={{ border: `0.5px solid var(--c-border)`, borderRadius: 10, padding: "9px 12px", fontSize: 16, fontFamily: "inherit", outline: "none", background: "var(--c-bg)", color: "var(--c-text1)" }} />
          <div style={{ fontSize: 12, color: "var(--c-text2)", marginTop: 10 }}>在吃什么药（没有可以不填）</div>
          <input type="text" value={medInput} onChange={e => setMedInput(e.target.value)} placeholder="药名"
            style={{ border: `0.5px solid var(--c-border)`, borderRadius: 10, padding: "9px 12px", fontSize: 16, fontFamily: "inherit", outline: "none", background: "var(--c-bg)", color: "var(--c-text1)" }} />
          <span onClick={saveSetup} style={{ marginTop: 10, alignSelf: "flex-start", fontSize: 12.5, color: "var(--c-bg)", background: dateInput ? C.accent : "var(--c-muted)", borderRadius: 10, padding: "9px 22px", cursor: dateInput ? "pointer" : "default" }}>
            {saving ? "保存中…" : "保存"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT, overflowY: "auto" }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <BackChevron onClick={() => setPage("more")} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: "var(--c-text2)" }}>本周期第{cycleDay}天</span>
        <IconSettings size={15} color="var(--c-text3)" onClick={() => { setDateInput(lastPeriodStart); setLenInput(avgLength || 28); setMedInput(medication || ""); setEditing(true); }} />
      </div>

      <div style={{ margin: "16px 18px 0", background: "var(--c-surface)", borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--c-text3)" }}>你现在处于</div>
            <div style={{ fontSize: 13.5, color: "var(--c-text1)", marginTop: 4 }}>● {phase}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "var(--c-text3)" }}>下次月经</div>
            <div style={{ fontSize: 13, color: "var(--c-text1)", marginTop: 4 }}>约{nextPeriodDays}天后</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, margin: "12px 18px 0" }}>
        {["经期", "卵泡期", "排卵期", "黄体期"].map(p => (
          <span key={p} style={{ flex: 1, textAlign: "center", fontSize: 10, color: phase === p ? C.bg : "var(--c-text2)", background: phase === p ? "#8b9dc3" : "transparent", border: phase === p ? "none" : `0.5px solid var(--c-border)`, borderRadius: 8, padding: "5px 0" }}>{p}</span>
        ))}
      </div>

      <div style={{ margin: "18px 18px 22px", borderTop: `0.5px solid var(--c-border)`, paddingTop: 14 }}>
        <div style={{ fontSize: 10.5, color: "var(--c-text2)", marginBottom: 10 }}>用药记录</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--c-surface)", borderRadius: 10, padding: "9px 12px" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--c-text1)" }}>{medication || "还没填药名"}</div>
            <div style={{ fontSize: 9.5, color: "var(--c-text3)", marginTop: 2 }}>{alreadyCheckedIn ? "今天已打卡" : "今天还没打卡"}</div>
          </div>
          <span onClick={checkInToday}
            style={{ width: 20, height: 20, borderRadius: "50%", background: alreadyCheckedIn ? C.good : "var(--c-surface)", border: alreadyCheckedIn ? "none" : `0.5px solid var(--c-border)`, color: "var(--c-bg)", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{alreadyCheckedIn ? "✓" : ""}</span>
        </div>
      </div>
    </div>
  );
}

// ── MailboxPage（留言全列表） ───────────────────────────────────
function MailboxPage({ setPage, mailbox, setMailbox }) {
  const markAllRead = async () => {
    setMailbox(prev => prev.map(m => ({ ...m, read: true })));
    try { await fetch(`${API_BASE}/mailbox/read-all`, { method: "PATCH" }); } catch {}
  };
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", gap: 14 }}>
        <BackChevron onClick={() => setPage("more")} />
        <span style={{ fontSize: 12.5, color: "var(--c-text2)", letterSpacing: "0.04em" }}>留言</span>
        <span style={{ fontSize: 10, color: "var(--c-text3)" }}>{mailbox.length}条</span>
        <span style={{ flex: 1 }} />
        <span onClick={markAllRead} style={{ fontSize: 10.5, color: "var(--c-accent)", cursor: "pointer" }}>全部已读</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "22px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {mailbox.length === 0 ? (
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--c-text3)", padding: "30px 0" }}>暂时没有留言</div>
        ) : mailbox.map((m, i) => (
          <div key={m.id}>
            <div onClick={() => setPage("chat")} style={{ display: "flex", gap: 9, alignItems: "flex-start", cursor: "pointer" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.read ? C.muted : "var(--c-accent)", marginTop: 6, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, color: "var(--c-text1)", lineHeight: 1.75 }}>{m.content}</div>
                <div style={{ fontSize: 10, color: "var(--c-text3)", marginTop: 6 }}>{m.time}</div>
              </div>
            </div>
            {i < mailbox.length - 1 && <div style={{ height: 0.5, background: "var(--c-border)", margin: "16px 6px 0" }} />}
          </div>
        ))}
        <div style={{ textAlign: "center", fontSize: 10.5, color: "var(--c-text3)", marginTop: 10 }}>点一条，回到对话里接着说</div>
      </div>
    </div>
  );
}

// ── StatusPage（此刻的驱动，从原来的Home搬过来） ───────────────────
function StatusPage({ setPage, driveState, driveLoading }) {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/drive-history?limit=40`)
      .then(r => r.json())
      .then(data => { setHistory(Array.isArray(data) ? data : []); setHistoryLoading(false); })
      .catch(() => setHistoryLoading(false));
  }, []);

  const W = 300, H = 130, PAD = 8;
  const n = history.length;
  const xFor = i => n <= 1 ? W / 2 : PAD + (i / (n - 1)) * (W - PAD * 2);
  const yFor = v => H - PAD - (Math.max(0, Math.min(100, v)) / 100) * (H - PAD * 2);

  const linesByDrive = DRIVES.map(key => ({
    key,
    points: history.map((h, i) => `${xFor(i)},${yFor(h.drive_state?.[key] ?? 0)}`).join(" "),
  }));

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", gap: 12 }}>
        <BackChevron onClick={() => setPage("more")} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: "var(--c-text2)" }}>状态</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px" }}>
        <div style={{ fontSize: 10, color: "var(--c-text3)", letterSpacing: "0.08em", marginBottom: 16 }}>此刻的驱动</div>
        {driveLoading ? (
          <div style={{ fontSize: 12, color: "var(--c-text3)", textAlign: "center", padding: "12px 0" }}>加载中…</div>
        ) : DRIVES.map(key => (
          <div key={key} style={{ marginBottom: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "var(--c-text1)" }}>{key}</span>
              <span style={{ fontSize: 11, color: "var(--c-text3)" }}>{driveState[key] ?? 0}</span>
            </div>
            <div style={{ height: 4, background: "var(--c-surface)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${driveState[key] ?? 0}%`, background: DRIVE_COLORS[key] || C.accent, borderRadius: 2, transition: "width 0.8s ease" }} />
            </div>
          </div>
        ))}

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: `0.5px solid var(--c-border)` }}>
          <div style={{ fontSize: 10, color: "var(--c-text3)", letterSpacing: "0.08em", marginBottom: 12 }}>走势</div>
          {historyLoading ? (
            <div style={{ fontSize: 12, color: "var(--c-text3)", textAlign: "center", padding: "20px 0" }}>加载中…</div>
          ) : n < 2 ? (
            <div style={{ fontSize: 11, color: "var(--c-text3)", textAlign: "center", padding: "20px 0" }}>还没攒够历史数据，多聊几句慢慢就会有走势了</div>
          ) : (
            <>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
                {[0, 25, 50, 75, 100].map(v => (
                  <line key={v} x1={PAD} x2={W - PAD} y1={yFor(v)} y2={yFor(v)} stroke="var(--c-border)" strokeWidth="0.5" />
                ))}
                {linesByDrive.map(l => (
                  <polyline key={l.key} points={l.points} fill="none" stroke={DRIVE_COLORS[l.key]} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                ))}
              </svg>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", marginTop: 12, justifyContent: "center" }}>
                {DRIVES.map(key => (
                  <span key={key} style={{ fontSize: 9.5, color: "var(--c-text3)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: DRIVE_COLORS[key], display: "inline-block" }} />{key}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SettingsHubPage（设置总入口） ────────────────────────────────
function SettingsHubPage({ setPage, theme, setTheme }) {
  const rows = [
    { key: "persona", label: "人格", sub: "系统提示词、说话方式" },
    { key: "memory", label: "记忆与上下文", sub: "已加载的记忆条目" },
    { key: "usage", label: "用量", sub: "今日 / 累计消耗" },
    { key: "data", label: "数据", sub: "导出聊天记录、清空" },
  ];
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, textAlign: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 11.5, color: "var(--c-text2)", letterSpacing: "0.06em" }}>设置</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontSize: 9.5, color: "var(--c-text3)", marginBottom: 6 }}>当前模型</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "var(--c-text1)" }}>DeepSeek</span>
            <span style={{ fontSize: 10, color: "var(--c-good)" }}>● 已连接</span>
          </div>
        </div>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column" }}>
          {rows.map(r => (
            <div key={r.key} onClick={() => setPage(r.key)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 4px", borderBottom: `0.5px solid var(--c-border)`, cursor: "pointer" }}>
              <div>
                <div style={{ fontSize: 12.5, color: "var(--c-text1)" }}>{r.label}</div>
                <div style={{ fontSize: 10, color: "var(--c-text3)", marginTop: 3 }}>{r.sub}</div>
              </div>
              <span style={{ fontSize: 13, color: "var(--c-text3)" }}>›</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 4px" }}>
            <span style={{ fontSize: 12.5, color: "var(--c-text1)" }}>外观</span>
            <span onClick={() => setTheme(theme === "日间" ? "夜间" : "日间")} style={{ fontSize: 10, color: "var(--c-text2)", border: `0.5px solid var(--c-border)`, borderRadius: 12, padding: "3px 10px", cursor: "pointer" }}>{theme}</span>
          </div>
        </div>
      </div>

      <BottomTabs active="settingsHub" setPage={setPage} />
      <style>{globalStyle}</style>
    </div>
  );
}

// ── PersonaPage（原来的Settings页，改名归到设置hub下面） ───────────
function PersonaPage({ setPage, avatarUrl: initAvatarUrl, setAvatarUrl: setGlobalAvatarUrl }) {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [avatarInput, setAvatarInput] = useState(initAvatarUrl || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/settings`).then(r => r.json()).then(data => {
      setSystemPrompt(data.system_prompt || "");
      setAvatarInput(data.avatar_url || "");
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch(`${API_BASE}/settings`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system_prompt: systemPrompt, avatar_url: avatarInput.trim() }) });
    setGlobalAvatarUrl(avatarInput.trim());
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", gap: 12 }}>
        <BackChevron onClick={() => setPage("settingsHub")} />
        <div style={{ flex: 1, textAlign: "center", fontSize: 12.5, color: "var(--c-text1)" }}>人格</div>
        <span onClick={save} style={{ cursor: "pointer", color: saved ? C.good : "var(--c-accent)", fontSize: 11.5 }}>
          {saved ? "已保存 ✓" : saving ? "保存中…" : "保存"}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
        <div style={{ fontSize: 10, color: "var(--c-text3)", marginBottom: 8, letterSpacing: "0.08em" }}>头像链接</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          {avatarInput ? (
            <img src={avatarInput} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
          ) : (
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--c-surface)", border: `0.5px solid var(--c-border)`, flexShrink: 0 }} />
          )}
          <input value={avatarInput} onChange={e => setAvatarInput(e.target.value)}
            placeholder="粘贴图片链接…"
            style={{ flex: 1, border: `0.5px solid var(--c-border)`, borderRadius: 10, padding: "8px 12px", fontSize: 16, fontFamily: "inherit", outline: "none", background: "var(--c-bg)", color: "var(--c-text1)" }}
            onFocus={e => e.target.style.borderColor = 'var(--c-accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--c-border)'} />
        </div>
        <div style={{ fontSize: 10, color: "var(--c-text3)", marginBottom: 8, letterSpacing: "0.08em" }}>角色设定</div>
        {loading ? (
          <div style={{ fontSize: 13, color: "var(--c-text3)" }}>加载中…</div>
        ) : (
          <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
            rows={18}
            style={{ width: "100%", border: `0.5px solid var(--c-border)`, borderRadius: 12, padding: 14, fontSize: 16, fontFamily: "inherit", resize: "vertical", outline: "none", background: "var(--c-bg)", color: "var(--c-text1)", lineHeight: 1.65 }}
            onFocus={e => e.target.style.borderColor = 'var(--c-accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--c-border)'} />
        )}
        <div style={{ fontSize: 11, color: "var(--c-text3)", marginTop: 10 }}>修改后点保存，下次对话生效。</div>
      </div>
    </div>
  );
}

// ── DataPage（导出 / 清空，新加的占位页） ───────────────────────────
function DataPage({ setPage }) {
  const [msg, setMsg] = useState("");

  const exportData = async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      const sessions = await res.json();
      const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "echo-export.json"; a.click();
      setMsg("导出了会话列表，完整消息内容的导出接口还没加");
    } catch {
      setMsg("导出失败，后端没连上");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", gap: 12 }}>
        <BackChevron onClick={() => setPage("settingsHub")} />
        <div style={{ flex: 1, textAlign: "center", fontSize: 12.5, color: "var(--c-text1)" }}>数据</div>
      </div>
      <div style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <div onClick={exportData} style={{ background: "var(--c-surface)", borderRadius: 12, padding: "13px 16px", fontSize: 12.5, color: "var(--c-text1)", cursor: "pointer" }}>导出聊天记录 JSON</div>
        <div style={{ background: "var(--c-surface)", borderRadius: 12, padding: "13px 16px", fontSize: 12.5, color: "var(--c-warn)", cursor: "pointer" }}>清空本地缓存</div>
        {msg && <div style={{ fontSize: 11, color: "var(--c-text3)", marginTop: 6 }}>{msg}</div>}
      </div>
    </div>
  );
}

// ── MemoryPage ────────────────────────────────────────────────
function MemoryPage({ setPage }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/memories`).then(r => r.json()).then(data => { setMemories(data || []); setLoading(false); });
  }, []);

  const addMemory = async () => {
    if (!newText.trim()) return;
    const res = await fetch(`${API_BASE}/memories`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ summary: newText.trim() }) });
    const m = await res.json();
    setMemories(prev => [m, ...prev]);
    setNewText(""); setAdding(false);
  };

  const saveEdit = async (id) => {
    await fetch(`${API_BASE}/memories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ summary: editingText }) });
    setMemories(prev => prev.map(m => m.id === id ? { ...m, summary: editingText } : m));
    setEditingId(null);
  };

  const deleteMemory = async (id) => {
    await fetch(`${API_BASE}/memories/${id}`, { method: "DELETE" });
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", gap: 12 }}>
        <BackChevron onClick={() => setPage("settingsHub")} />
        <div style={{ flex: 1, textAlign: "center", fontSize: 12.5, color: "var(--c-text1)" }}>记忆</div>
        <span onClick={() => setAdding(true)} style={{ fontSize: 11.5, color: "var(--c-accent)", cursor: "pointer" }}>＋ 添加</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {adding && (
          <div style={{ background: "var(--c-surface)", borderRadius: 12, padding: 14, border: `0.5px solid var(--c-accent)` }}>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="写下要记住的内容…" rows={3}
              autoFocus
              style={{ width: "100%", border: "none", outline: "none", fontSize: 16, fontFamily: "inherit", resize: "none", color: "var(--c-text1)", lineHeight: 1.65, background: "transparent" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <span onClick={() => { setAdding(false); setNewText(""); }} style={{ fontSize: 12, color: "var(--c-text3)", cursor: "pointer" }}>取消</span>
              <span onClick={addMemory} style={{ fontSize: 12, color: "var(--c-bg)", background: "var(--c-accent)", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>保存</span>
            </div>
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--c-text3)", padding: "30px 0" }}>加载中…</div>
        ) : memories.length === 0 ? (
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--c-text3)", padding: "40px 0" }}>还没有记忆</div>
        ) : memories.map(m => (
          <div key={m.id} style={{ background: "var(--c-surface)", borderRadius: 12, padding: "14px 16px" }}>
            {editingId === m.id ? (
              <>
                <textarea value={editingText} onChange={e => setEditingText(e.target.value)} rows={3}
                  style={{ width: "100%", border: "none", outline: "none", fontSize: 16, fontFamily: "inherit", resize: "none", color: "var(--c-text1)", lineHeight: 1.65, background: "transparent" }} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                  <span onClick={() => setEditingId(null)} style={{ fontSize: 12, color: "var(--c-text3)", cursor: "pointer" }}>取消</span>
                  <span onClick={() => saveEdit(m.id)} style={{ fontSize: 12, color: "var(--c-bg)", background: "var(--c-accent)", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>保存</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "var(--c-text1)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{m.summary}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--c-text3)" }}>{m.timestamp ? new Date(m.timestamp).toLocaleDateString("zh") : "手动"}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span onClick={() => { setEditingId(m.id); setEditingText(m.summary); }} style={{ fontSize: 11, cursor: "pointer", color: "var(--c-text3)" }}>编辑</span>
                    <span onClick={() => deleteMemory(m.id)} style={{ fontSize: 11, cursor: "pointer", color: "var(--c-warn)" }}>删除</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── UsagePage ─────────────────────────────────────────────────
function UsagePage({ setPage }) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/usage`).then(r => r.json()).then(data => { setUsage(data); setLoading(false); });
  }, []);

  const fmt = n => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n || 0);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--c-bg)", fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid var(--c-border)`, display: "flex", alignItems: "center", gap: 12 }}>
        <BackChevron onClick={() => setPage("settingsHub")} />
        <div style={{ flex: 1, textAlign: "center", fontSize: 12.5, color: "var(--c-text1)" }}>用量</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
        {loading ? (
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--c-text3)", padding: "40px 0" }}>加载中…</div>
        ) : !usage ? null : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[["TODAY", usage.today], ["TOTAL", usage.total]].map(([label, data]) => (
                <div key={label} style={{ background: "var(--c-surface)", borderRadius: 14, padding: "16px 14px" }}>
                  <div style={{ fontSize: 10, color: "var(--c-text3)", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "var(--c-text1)", lineHeight: 1.7 }}>
                    <div>{fmt(data.input)} in · {fmt(data.output)} out</div>
                    <div style={{ color: "var(--c-text3)", fontSize: 11 }}>{data.turns} turns</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "var(--c-text3)", marginBottom: 10, letterSpacing: "0.08em" }}>By Session</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(usage.bySession || []).map(s => (
                <div key={s.id} style={{ background: "var(--c-surface)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontSize: 12.5, color: "var(--c-text1)" }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: "var(--c-accent)" }}>{fmt(s.input + s.output)} tokens</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--c-text3)" }}>{fmt(s.input)} in · {fmt(s.output)} out · {s.turns} turns</div>
                  <div style={{ height: 3, background: "var(--c-bg)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (s.input + s.output) / Math.max(1, usage.total.input + usage.total.output) * 100)}%`, background: "var(--c-accent)", borderRadius: 2 }} />
                  </div>
                </div>
              ))}
              {(usage.bySession || []).length === 0 && <div style={{ textAlign: "center", fontSize: 13, color: "var(--c-text3)", padding: "20px 0" }}>暂无记录</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── App（主入口）─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [driveState, setDriveState] = useState({});
  const [driveLoading, setDriveLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("echo-theme") || "日间");
  const [avatarUrl, setAvatarUrl] = useState("");

  // 主题变化时同步CSS变量 + 持久化
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("echo-theme", theme);
  }, [theme]);

  // 首次挂载时注入初始主题
  useEffect(() => { applyTheme(theme); }, []);

  // 留言：现在接的是真实后端 /mailbox 接口了
  const [mailbox, setMailbox] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/mailbox`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        setMailbox(data.map(m => ({
          id: m.id,
          content: m.content,
          read: m.read,
          time: new Date(m.created_at).toLocaleString("zh", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        })));
      })
      .catch(() => {});
  }, []);

  // 日记：接后端真实数据
  const [diaryEntries, setDiaryEntries] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/diary`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        setDiaryEntries(data.map(d => {
          const dt = new Date(d.entry_date);
          return {
            id: d.id,
            day: dt.getDate(),
            month: dt.getMonth() + 1,
            year: dt.getFullYear(),
            weather: d.weather || "",
            mood: d.mood || "",
            writtenAt: dt.toLocaleTimeString("zh", { hour: "2-digit", minute: "2-digit" }),
            title: d.title || "",
            content: d.content || "",
          };
        }));
      })
      .catch(() => {});
  }, []);

  // 周期：接后端真实数据
  const [cycleData, setCycleData] = useState({ lastPeriodStart: null, avgLength: 28, medication: "", medLog: [] });

  useEffect(() => {
    fetch(`${API_BASE}/cycle`)
      .then(r => r.json())
      .then(data => {
        setCycleData({
          lastPeriodStart: data.last_period_start || null,
          avgLength: data.avg_length || 28,
          medication: data.medication || "",
          medLog: data.med_log || [],
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/settings`).then(r => r.json()).then(data => {
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/drive-state`)
      .then(r => r.json())
      .then(data => { setDriveState(data); setDriveLoading(false); })
      .catch(() => setDriveLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      fetch(`${API_BASE}/drive-state`).then(r => r.json()).then(setDriveState).catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const cycleDay = cycleData.lastPeriodStart
    ? Math.floor((new Date() - new Date(cycleData.lastPeriodStart)) / 86400000) % (cycleData.avgLength || 28) + 1
    : null;

  if (page === "landing") return <LandingPage setPage={setPage} mailbox={mailbox} />;
  if (page === "chat") return <ChatPage setPage={setPage} avatarUrl={avatarUrl} />;
  if (page === "search") return <SearchPage setPage={setPage} />;
  if (page === "more") return <MorePage setPage={setPage} mailbox={mailbox} diaryCount={diaryEntries.length} cycleDay={cycleDay} />;
  if (page === "diary") return <DiaryPage setPage={setPage} entries={diaryEntries} setEntries={setDiaryEntries} />;
  if (page === "cycle") return <CyclePage setPage={setPage} cycleData={cycleData} setCycleData={setCycleData} />;
  if (page === "mailboxFull") return <MailboxPage setPage={setPage} mailbox={mailbox} setMailbox={setMailbox} />;
  if (page === "status") return <StatusPage setPage={setPage} driveState={driveState} driveLoading={driveLoading} />;
  if (page === "settingsHub") return <SettingsHubPage setPage={setPage} theme={theme} setTheme={setTheme} />;
  if (page === "persona") return <PersonaPage setPage={setPage} avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl} />;
  if (page === "data") return <DataPage setPage={setPage} />;
  if (page === "memory") return <MemoryPage setPage={setPage} />;
  if (page === "usage") return <UsagePage setPage={setPage} />;
  return null;
}
