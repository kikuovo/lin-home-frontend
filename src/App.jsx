import { useState, useRef, useEffect } from "react";

const API_BASE = "https://lin-home-backend.onrender.com";
const DRIVES = ["依恋", "占有欲", "吃醋", "好奇", "责任", "烦躁", "低落", "欲望"];
const DRIVE_COLORS = {
  依恋: "#c4948a", 占有欲: "#b08080", 吃醋: "#a07878",
  好奇: "#8a9cb0", 责任: "#9ab09a", 烦躁: "#c0a060",
  低落: "#a0a0b0", 欲望: "#c08898"
};

// ── ThinkingBlock ─────────────────────────────────────────────
function ThinkingBlock({ content }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "0.5px solid #e8e8e8", borderRadius: 10, overflow: "hidden", marginBottom: 6, background: "#fafafa", maxWidth: "82%" }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", cursor: "pointer", border: "none", background: "transparent", width: "100%", textAlign: "left", fontFamily: "inherit" }}>
        <span style={{ fontSize: 11, color: "#aaaaaa", fontStyle: "italic", letterSpacing: "0.03em" }}>Thinking</span>
        <span style={{ fontSize: 12, color: "#cccccc", marginLeft: "auto", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>›</span>
      </button>
      {open && (
        <div style={{ padding: "8px 14px 10px", borderTop: "0.5px solid #eeeeee", fontSize: 12, color: "#aaaaaa", lineHeight: 1.7, fontStyle: "italic" }}>
          {content}
        </div>
      )}
    </div>
  );
}

// ── MessageItem ───────────────────────────────────────────────
function MessageItem({ msg }) {
  const isUser = msg.role === "user";
  const time = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString("zh", { hour: "2-digit", minute: "2-digit" })
    : msg.time || "";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", maxWidth: "82%", alignSelf: isUser ? "flex-end" : "flex-start" }}>
      {!isUser && msg.thinking && <ThinkingBlock content={msg.thinking} />}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: isUser ? "row-reverse" : "row" }}>
        <div style={{
          padding: "10px 14px", borderRadius: 14,
          borderBottomLeftRadius: isUser ? 14 : 4,
          borderBottomRightRadius: isUser ? 4 : 14,
          fontSize: 13.5, lineHeight: 1.68, whiteSpace: "pre-wrap", wordBreak: "break-word",
          ...(isUser
            ? { background: "#3d3d3d", color: "#ffffff" }
            : { background: "#ffffff", color: "#333333", border: "0.5px solid #e8e8e8" })
        }}>
          {msg.content}
        </div>
        {time && <div style={{ fontSize: 10.5, color: "#b8b8b8", whiteSpace: "nowrap", paddingBottom: 2 }}>{time}</div>}
      </div>
    </div>
  );
}

// ── HomePage ──────────────────────────────────────────────────
function HomePage({ setPage, driveState, driveLoading }) {
  return (
    <div style={{ height: "100vh", background: "#faf8f6", display: "flex", flexDirection: "column", fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif", overflowY: "auto" }}>
      <div style={{ padding: "56px 28px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Noto Serif SC', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#3d3531", letterSpacing: "0.1em" }}>Echo</div>
        <div style={{ fontSize: 11, color: "#c4948a", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c4948a", display: "inline-block" }} />
          在线
        </div>
      </div>

      <div style={{ margin: "8px 20px 16px", background: "#fff", borderRadius: 18, padding: "20px 20px 16px", border: "0.5px solid #ede8e4", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 10, color: "#c4b0a8", letterSpacing: "0.08em", marginBottom: 16, textTransform: "uppercase" }}>此刻的驱动</div>
        {driveLoading ? (
          <div style={{ fontSize: 12, color: "#c4b0a8", textAlign: "center", padding: "12px 0" }}>加载中…</div>
        ) : DRIVES.map(key => (
          <div key={key} style={{ marginBottom: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#5a4a44" }}>{key}</span>
              <span style={{ fontSize: 11, color: "#c4b0a8" }}>{driveState[key] ?? 0}</span>
            </div>
            <div style={{ height: 4, background: "#f0ece8", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${driveState[key] ?? 0}%`, background: DRIVE_COLORS[key] || "#c4948a", borderRadius: 2, transition: "width 0.8s ease" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        <button onClick={() => setPage("chat")} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "#3d3531", color: "#fff", fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.04em" }}>
          开始对话
        </button>
      </div>
      <div style={{ textAlign: "center", paddingBottom: 32 }}>
        <button onClick={() => setPage("usage")} style={{ fontSize: 11, color: "#c4b0a8", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>Console</button>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400&family=Noto+Sans+SC:wght@300;400;500&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } body { overflow: hidden; }`}</style>
    </div>
  );
}

// ── ChatPage ──────────────────────────────────────────────────
function ChatPage({ setPage }) {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const messagesEndRef = useRef(null);

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

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const text = input.trim();
    let sessionId = activeId;
    if (!sessionId) { const s = await createSession(); sessionId = s?.id; }
    if (!sessionId) return;
    setInput("");
    setMessages(prev => [...prev, { id: `temp-${Date.now()}`, role: "user", content: text, time: new Date().toLocaleTimeString("zh", { hour: "2-digit", minute: "2-digit" }) }]);
    setIsTyping(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, content: text, model }) });
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
  const activeSession = sessions.find(s => s.id === activeId);

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans SC', sans-serif", color: "#b8a89e", fontSize: 13 }}>连接中…</div>;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif", background: "#faf8f6", position: "relative", overflow: "hidden" }}>

      {/* 遮罩 */}
      <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.22)", zIndex: 10, opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? "auto" : "none", transition: "opacity 0.25s" }} />

      {/* 会话抽屉 */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 265, background: "#f4f0ec", zIndex: 20, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.27s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", borderRight: "0.5px solid #e8e0da", boxShadow: sidebarOpen ? "4px 0 20px rgba(0,0,0,0.07)" : "none" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "0.5px solid #e8e0da", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 15, color: "#3d3531", letterSpacing: "0.06em", fontStyle: "italic" }}>Sessions</div>
          <button onClick={() => setSidebarOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#b8a89e", fontSize: 22, lineHeight: 1, fontWeight: 300 }}>×</button>
        </div>
        <div style={{ padding: "10px 14px 6px" }}>
          <button onClick={createSession} style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 8, border: "0.5px solid #d8cec8", background: "transparent", color: "#8c7a74", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>＋ 新对话</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
          {sessions.map(s => (
            <div key={s.id} style={{ padding: "8px 14px", borderLeft: s.id === activeId ? "2px solid #c4948a" : "2px solid transparent", background: s.id === activeId ? "#faf8f6" : "transparent", cursor: "pointer", transition: "all 0.15s" }}
              onClick={() => { setActiveId(s.id); setMessages([]); setSidebarOpen(false); }}>
              {editingId === s.id ? (
                <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)}
                  onBlur={() => renameSession(s.id, editingName)}
                  onKeyDown={e => { if (e.key === "Enter") renameSession(s.id, editingName); if (e.key === "Escape") setEditingId(null); }}
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: 12.5, border: "0.5px solid #c4948a", borderRadius: 4, padding: "2px 6px", width: "100%", fontFamily: "inherit", outline: "none", background: "#fff" }} />
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 12.5, color: "#3d3531", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{s.name}</div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditingId(s.id); setEditingName(s.name); }} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 11, color: "#b8a89e", padding: "1px 3px" }}>改</button>
                    <button onClick={() => deleteSession(s.id)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 11, color: "#e0a0a0", padding: "1px 3px" }}>删</button>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 10.5, color: "#b8a89e", marginTop: 2 }}>{new Date(s.updated_at || s.created_at).toLocaleDateString("zh", { month: "numeric", day: "numeric" })}日</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 14px", borderTop: "0.5px solid #e8e0da" }}>
          <select value={model} onChange={e => setModel(e.target.value)} style={{ width: "100%", padding: "6px 8px", fontSize: 11.5, borderRadius: 8, border: "0.5px solid #d8cec8", background: "#faf8f6", color: "#8c7a74", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
            <option value="deepseek-chat">DeepSeek Chat</option>
            <option value="deepseek-reasoner">DeepSeek Reasoner</option>
          </select>
        </div>
      </div>

      {/* 顶部导航 */}
      <div style={{ padding: "12px 16px", borderBottom: "0.5px solid #e8e0da", display: "flex", alignItems: "center", background: "#faf8f6", gap: 8 }}>
        <button onClick={() => setPage("home")} style={{ border: "0.5px solid #e8e0da", background: "transparent", borderRadius: 7, cursor: "pointer", color: "#8c7a74", fontSize: 12, padding: "4px 10px", fontFamily: "inherit" }}>Home</button>
        <button onClick={() => setSidebarOpen(true)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: "5px 6px", display: "flex", flexDirection: "column", gap: 3.5, alignItems: "center" }}>
          <span style={{ display: "block", width: 16, height: 1.5, background: "#8c7a74", borderRadius: 1 }} />
          <span style={{ display: "block", width: 16, height: 1.5, background: "#8c7a74", borderRadius: 1 }} />
          <span style={{ display: "block", width: 16, height: 1.5, background: "#8c7a74", borderRadius: 1 }} />
        </button>
        <div style={{ flex: 1, textAlign: "center", fontFamily: "'Noto Serif SC', serif", fontSize: 15, color: "#3d3531", letterSpacing: "0.08em" }}>Echo</div>
        <button onClick={() => setPage("memory")} style={{ border: "0.5px solid #e8e0da", background: "transparent", borderRadius: 7, cursor: "pointer", color: "#8c7a74", fontSize: 12, padding: "4px 10px", fontFamily: "inherit" }}>Memory</button>
        <button onClick={() => setPage("settings")} style={{ border: "0.5px solid #e8e0da", background: "transparent", borderRadius: 7, cursor: "pointer", color: "#8c7a74", fontSize: 12, padding: "4px 10px", fontFamily: "inherit" }}>Settings</button>
      </div>

      {/* 消息区域 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px 10px", display: "flex", flexDirection: "column", gap: 12, background: "#f8f7f5" }}>
        <div style={{ alignSelf: "center", fontSize: 11, color: "#c4948a", background: "#f9ecea", border: "0.5px solid #e8cec9", borderRadius: 20, padding: "3px 10px" }}>✦ 已加载记忆</div>
        {messages.map(msg => <MessageItem key={msg.id} msg={msg} />)}
        {isTyping && (
          <div style={{ alignSelf: "flex-start" }}>
            <div style={{ padding: "10px 14px", borderRadius: 14, borderBottomLeftRadius: 4, background: "#ffffff", border: "0.5px solid #e8e8e8", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 0.2, 0.4].map((d, i) => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#b8b8b8", display: "inline-block", animation: "blink 1.2s ease-in-out infinite", animationDelay: `${d}s` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div style={{ padding: "12px 20px 24px", borderTop: "0.5px solid #e8e0da", display: "flex", gap: 10, alignItems: "flex-end", background: "#faf8f6" }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="say something to daddy..."
          rows={1}
          style={{ flex: 1, border: "0.5px solid #d8cec8", borderRadius: 12, padding: "10px 14px", fontSize: 13.5, fontFamily: "inherit", resize: "none", outline: "none", background: "#f4f0ec", color: "#3d3531", lineHeight: 1.55, minHeight: 42, maxHeight: 120 }}
          onFocus={e => e.target.style.borderColor = "#c4948a"}
          onBlur={e => e.target.style.borderColor = "#d8cec8"} />
        <button onClick={handleSend} disabled={isTyping}
          style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: isTyping ? "#d8cec8" : "#c4948a", color: "white", cursor: isTyping ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, marginBottom: 1 }}>↑</button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400&family=Noto+Sans+SC:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #e0d5cf; border-radius: 3px; }
        @keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
      `}</style>
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#faf8f6", fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
      <div style={{ padding: "16px 18px", borderBottom: "0.5px solid #e8e0da", display: "flex", alignItems: "center", gap: 10, background: "#faf8f6" }}>
        <button onClick={() => setPage("chat")} style={{ border: "0.5px solid #e8e0da", background: "transparent", borderRadius: 7, cursor: "pointer", color: "#8c7a74", fontSize: 12, padding: "4px 10px", fontFamily: "inherit" }}>← 返回</button>
        <div style={{ flex: 1, textAlign: "center", fontFamily: "'Noto Serif SC', serif", fontSize: 15, color: "#3d3531" }}>Memory</div>
        <button onClick={() => setAdding(true)} style={{ border: "0.5px solid #c4948a", background: "transparent", borderRadius: 7, cursor: "pointer", color: "#c4948a", fontSize: 12, padding: "4px 10px", fontFamily: "inherit" }}>＋ 添加</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {adding && (
          <div style={{ background: "#fff", borderRadius: 12, padding: "14px", border: "0.5px solid #c4948a" }}>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="写下要记住的内容…" rows={3}
              autoFocus
              style={{ width: "100%", border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", resize: "none", color: "#3d3531", lineHeight: 1.65, background: "transparent" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => { setAdding(false); setNewText(""); }} style={{ fontSize: 12, border: "none", background: "transparent", cursor: "pointer", color: "#b8a89e", fontFamily: "inherit" }}>取消</button>
              <button onClick={addMemory} style={{ fontSize: 12, border: "none", background: "#c4948a", color: "#fff", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit" }}>保存</button>
            </div>
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: "center", fontSize: 13, color: "#b8a89e", padding: "30px 0" }}>加载中…</div>
        ) : memories.length === 0 ? (
          <div style={{ textAlign: "center", fontSize: 13, color: "#c4b0a8", padding: "40px 0" }}>还没有记忆</div>
        ) : memories.map(m => (
          <div key={m.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "0.5px solid #ede8e4" }}>
            {editingId === m.id ? (
              <>
                <textarea value={editingText} onChange={e => setEditingText(e.target.value)} rows={3}
                  style={{ width: "100%", border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", resize: "none", color: "#3d3531", lineHeight: 1.65, background: "transparent" }} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                  <button onClick={() => setEditingId(null)} style={{ fontSize: 12, border: "none", background: "transparent", cursor: "pointer", color: "#b8a89e", fontFamily: "inherit" }}>取消</button>
                  <button onClick={() => saveEdit(m.id)} style={{ fontSize: 12, border: "none", background: "#c4948a", color: "#fff", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit" }}>保存</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "#3d3531", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{m.summary}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: "#c4b0a8" }}>{m.timestamp ? new Date(m.timestamp).toLocaleDateString("zh") : "手动"}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => { setEditingId(m.id); setEditingText(m.summary); }} style={{ fontSize: 11, border: "none", background: "transparent", cursor: "pointer", color: "#b8a89e", fontFamily: "inherit" }}>编辑</button>
                    <button onClick={() => deleteMemory(m.id)} style={{ fontSize: 11, border: "none", background: "transparent", cursor: "pointer", color: "#e0a0a0", fontFamily: "inherit" }}>删除</button>
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

// ── SettingsPage ──────────────────────────────────────────────
function SettingsPage({ setPage }) {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/settings`).then(r => r.json()).then(data => { setSystemPrompt(data.system_prompt || ""); setLoading(false); });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch(`${API_BASE}/settings`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system_prompt: systemPrompt }) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#faf8f6", fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
      <div style={{ padding: "16px 18px", borderBottom: "0.5px solid #e8e0da", display: "flex", alignItems: "center", gap: 10, background: "#faf8f6" }}>
        <button onClick={() => setPage("chat")} style={{ border: "0.5px solid #e8e0da", background: "transparent", borderRadius: 7, cursor: "pointer", color: "#8c7a74", fontSize: 12, padding: "4px 10px", fontFamily: "inherit" }}>← 返回</button>
        <div style={{ flex: 1, textAlign: "center", fontFamily: "'Noto Serif SC', serif", fontSize: 15, color: "#3d3531" }}>Settings</div>
        <button onClick={save} disabled={saving} style={{ border: "none", background: saved ? "#a8c4a0" : "#c4948a", color: "#fff", borderRadius: 7, cursor: "pointer", fontSize: 12, padding: "4px 12px", fontFamily: "inherit", transition: "background 0.2s" }}>
          {saved ? "已保存 ✓" : saving ? "保存中…" : "保存"}
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "18px" }}>
        <div style={{ fontSize: 10, color: "#b8a89e", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>角色设定</div>
        {loading ? (
          <div style={{ fontSize: 13, color: "#b8a89e" }}>加载中…</div>
        ) : (
          <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
            rows={18}
            style={{ width: "100%", border: "0.5px solid #d8cec8", borderRadius: 12, padding: "14px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", background: "#fff", color: "#3d3531", lineHeight: 1.65 }}
            onFocus={e => e.target.style.borderColor = "#c4948a"}
            onBlur={e => e.target.style.borderColor = "#d8cec8"} />
        )}
        <div style={{ fontSize: 11, color: "#c4b0a8", marginTop: 10 }}>修改后点保存，下次对话生效。</div>
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#faf8f6", fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
      <div style={{ padding: "16px 18px", borderBottom: "0.5px solid #e8e0da", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setPage("home")} style={{ border: "0.5px solid #e8e0da", background: "transparent", borderRadius: 7, cursor: "pointer", color: "#8c7a74", fontSize: 12, padding: "4px 10px", fontFamily: "inherit" }}>← 返回</button>
        <div style={{ flex: 1, textAlign: "center", fontFamily: "'Noto Serif SC', serif", fontSize: 15, color: "#3d3531" }}>Console</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
        {loading ? (
          <div style={{ textAlign: "center", fontSize: 13, color: "#b8a89e", padding: "40px 0" }}>加载中…</div>
        ) : !usage ? null : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[["TODAY", usage.today], ["TOTAL", usage.total]].map(([label, data]) => (
                <div key={label} style={{ background: "#fff", borderRadius: 14, padding: "16px 14px", border: "0.5px solid #ede8e4" }}>
                  <div style={{ fontSize: 10, color: "#b8a89e", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#5a4a44", lineHeight: 1.7 }}>
                    <div>{fmt(data.input)} in · {fmt(data.output)} out</div>
                    <div style={{ color: "#c4b0a8", fontSize: 11 }}>{data.turns} turns</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#b8a89e", marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>By Session</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(usage.bySession || []).map(s => (
                <div key={s.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", border: "0.5px solid #ede8e4" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontSize: 12.5, color: "#3d3531" }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: "#c4948a" }}>{fmt(s.input + s.output)} tokens</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#b8a89e" }}>{fmt(s.input)} in · {fmt(s.output)} out · {s.turns} turns</div>
                  <div style={{ height: 3, background: "#f0ece8", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (s.input + s.output) / Math.max(1, usage.total.input + usage.total.output) * 100)}%`, background: "#c4948a", borderRadius: 2 }} />
                  </div>
                </div>
              ))}
              {(usage.bySession || []).length === 0 && <div style={{ textAlign: "center", fontSize: 13, color: "#c4b0a8", padding: "20px 0" }}>暂无记录</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── App（主入口）─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [driveState, setDriveState] = useState({});
  const [driveLoading, setDriveLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/drive-state`)
      .then(r => r.json())
      .then(data => { setDriveState(data); setDriveLoading(false); })
      .catch(() => setDriveLoading(false));
  }, []);

  // 每30秒刷新欲望状态
  useEffect(() => {
    const timer = setInterval(() => {
      fetch(`${API_BASE}/drive-state`).then(r => r.json()).then(setDriveState).catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  if (page === "home") return <HomePage setPage={setPage} driveState={driveState} driveLoading={driveLoading} />;
  if (page === "chat") return <ChatPage setPage={setPage} />;
  if (page === "memory") return <MemoryPage setPage={setPage} />;
  if (page === "settings") return <SettingsPage setPage={setPage} />;
  if (page === "usage") return <UsagePage setPage={setPage} />;
  return null;
}
