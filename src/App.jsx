import { useState, useRef, useEffect } from "react";

const API_BASE = "https://lin-home-backend.onrender.com";

// ── Thinking 可折叠组件 ────────────────────────────────────────────
function ThinkingBlock({ content }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "0.5px solid #e8e0da", borderRadius: 10, overflow: "hidden", marginBottom: 6, background: "#f8f5f2" }}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", cursor: "pointer", border: "none", background: "transparent", width: "100%", textAlign: "left", fontFamily: "inherit" }}>
        <span style={{ fontSize: 13, color: "#b8a89e" }}>✦</span>
        <span style={{ fontSize: 11.5, color: "#a89890", letterSpacing: "0.03em" }}>thinking...</span>
        <span style={{ fontSize: 13, color: "#c4b0a8", marginLeft: "auto", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>›</span>
      </button>
      {open && (
        <div style={{ padding: "10px 14px 12px", borderTop: "0.5px solid #e8e0da", fontSize: 12.5, color: "#a89890", lineHeight: 1.75, fontStyle: "italic" }}>
          {content}
        </div>
      )}
    </div>
  );
}

// ── 消息气泡 ──────────────────────────────────────────────────────
function MessageItem({ msg }) {
  const isUser = msg.role === "user";
  const time = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString("zh", { hour: "2-digit", minute: "2-digit" })
    : msg.time || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", maxWidth: "82%", alignSelf: isUser ? "flex-end" : "flex-start" }}>
      {!isUser && msg.thinking && <ThinkingBlock content={msg.thinking} />}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: isUser ? "row-reverse" : "row" }}>
        <div style={{ padding: "10px 14px", borderRadius: 14, borderBottomLeftRadius: isUser ? 14 : 4, borderBottomRightRadius: isUser ? 4 : 14, fontSize: 13.5, lineHeight: 1.68, whiteSpace: "pre-wrap", wordBreak: "break-word", ...(isUser ? { background: "#f5e6e3", color: "#5a3530", border: "0.5px solid #e8cec9" } : { background: "#f0ece8", color: "#3d3531", border: "0.5px solid #e8e0da" }) }}>
          {msg.content}
        </div>
        {time && <div style={{ fontSize: 10.5, color: "#c4b0a8", whiteSpace: "nowrap", paddingBottom: 2 }}>{time}</div>}
      </div>
    </div>
  );
}

// ── 主应用 ────────────────────────────────────────────────────────
export default function App() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("claude-sonnet-4-20250514");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // 加载会话列表
  useEffect(() => {
    fetch(`${API_BASE}/sessions`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSessions(data);
          setActiveId(data[0].id);
        } else {
          // 没有会话，自动新建一个
          createSession();
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 切换会话时加载消息
  useEffect(() => {
    if (!activeId) return;
    fetch(`${API_BASE}/sessions/${activeId}/messages`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      });
  }, [activeId]);

  // 滚到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const createSession = async () => {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "新对话" }),
    });
    const newSession = await res.json();
    setSessions((prev) => [newSession, ...prev]);
    setActiveId(newSession.id);
    setMessages([]);
    return newSession;
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const text = input.trim();

    // 如果没有 session，先创建一个
    let sessionId = activeId;
    if (!sessionId) {
      const newSession = await createSession();
      sessionId = newSession?.id;
    }
    if (!sessionId) return;

    setInput("");

    // 乐观更新：先把用户消息显示出来
    const tempUserMsg = { id: `temp-${Date.now()}`, role: "user", content: text, time: new Date().toLocaleTimeString("zh", { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, content: text, model }),
      });
      const data = await res.json();
      if (data.content) {
        const aiMsg = { id: Date.now(), role: "assistant", content: data.content, time: new Date().toLocaleTimeString("zh", { hour: "2-digit", minute: "2-digit" }) };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [...prev, { id: Date.now(), role: "assistant", content: "出错了：" + (data.error || "未知错误"), time: "" }]);
      }
    } catch {
      setMessages((prev) => [...prev, { id: Date.now(), role: "assistant", content: "连不上后端，等一下再试试。", time: "" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const activeSession = sessions.find((s) => s.id === activeId);

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans SC', sans-serif", color: "#b8a89e", fontSize: 13 }}>
        连接中…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif", background: "#faf8f6", overflow: "hidden" }}>
      {/* ── 侧边栏 ── */}
      <div style={{ width: 200, minWidth: 200, borderRight: "0.5px solid #e8e0da", display: "flex", flexDirection: "column", background: "#f4f0ec" }}>
        <div style={{ padding: "22px 16px 14px", borderBottom: "0.5px solid #e8e0da" }}>
          <div style={{ fontFamily: "'Noto Serif SC', Georgia, serif", fontSize: 16, fontWeight: 400, color: "#3d3531", letterSpacing: "0.06em" }}>Lin's Home</div>
          <div style={{ fontSize: 11, color: "#b8a89e", marginTop: 3 }}>你的专属空间</div>
          <button onClick={createSession} style={{ width: "100%", marginTop: 12, padding: "7px 10px", fontSize: 12, borderRadius: 8, border: "0.5px solid #d8cec8", background: "transparent", color: "#8c7a74", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            ＋ 新对话
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {sessions.map((s) => (
            <div key={s.id} onClick={() => setActiveId(s.id)} style={{ padding: "9px 16px", cursor: "pointer", borderLeft: s.id === activeId ? "2px solid #c4948a" : "2px solid transparent", background: s.id === activeId ? "#faf8f6" : "transparent", transition: "all 0.15s" }}>
              <div style={{ fontSize: 12.5, color: "#3d3531", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
              <div style={{ fontSize: 11, color: "#b8a89e", marginTop: 2 }}>
                {new Date(s.updated_at || s.created_at).toLocaleDateString("zh", { month: "numeric", day: "numeric" })}日
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "0.5px solid #e8e0da" }}>
          <select value={model} onChange={(e) => setModel(e.target.value)} style={{ width: "100%", padding: "6px 8px", fontSize: 11.5, borderRadius: 8, border: "0.5px solid #d8cec8", background: "#faf8f6", color: "#8c7a74", fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
            <option value="claude-sonnet-4-20250514">Claude Sonnet</option>
            <option value="claude-opus-4-20250514">Claude Opus</option>
          </select>
        </div>
      </div>

      {/* ── 主对话区域 ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px 14px", borderBottom: "0.5px solid #e8e0da", display: "flex", alignItems: "center", gap: 10, background: "#faf8f6" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#c4948a" }} />
          <div style={{ fontSize: 13.5, color: "#8c7a74", letterSpacing: "0.04em" }}>{activeSession?.name || "新对话"}</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 12px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ alignSelf: "center", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#c4948a", background: "#f9ecea", border: "0.5px solid #e8cec9", borderRadius: 20, padding: "3px 10px" }}>
            ✦ 已加载记忆
          </div>
          {messages.map((msg) => <MessageItem key={msg.id} msg={msg} />)}
          {isTyping && (
            <div style={{ alignSelf: "flex-start" }}>
              <div style={{ padding: "10px 16px", borderRadius: 14, borderBottomLeftRadius: 4, background: "#f0ece8", border: "0.5px solid #e8e0da", display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#c4b0a8", display: "inline-block", animation: "blink 1.2s ease-in-out infinite", animationDelay: `${delay}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ padding: "14px 28px 22px", borderTop: "0.5px solid #e8e0da", display: "flex", gap: 10, alignItems: "flex-end", background: "#faf8f6" }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="说点什么…" rows={1} style={{ flex: 1, border: "0.5px solid #d8cec8", borderRadius: 12, padding: "10px 14px", fontSize: 13.5, fontFamily: "inherit", resize: "none", outline: "none", background: "#f4f0ec", color: "#3d3531", lineHeight: 1.55, minHeight: 42, maxHeight: 120 }} onFocus={(e) => (e.target.style.borderColor = "#c4948a")} onBlur={(e) => (e.target.style.borderColor = "#d8cec8")} />
          <button onClick={handleSend} disabled={isTyping} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: isTyping ? "#d8cec8" : "#c4948a", color: "white", cursor: isTyping ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 1, flexShrink: 0 }} aria-label="发送">↑</button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400&family=Noto+Sans+SC:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e0d5cf; border-radius: 4px; }
        @keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
      `}</style>
    </div>
  );
}
