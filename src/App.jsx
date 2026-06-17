import { useState, useRef, useEffect } from "react";

const API_BASE = "https://lin-home-backend.onrender.com";

// ── 霜花配色 ──────────────────────────────────────────────────
const C = {
  bg: "#FAFCFF",       // 冰白
  surface: "#F0F4FA",  // 霜
  border: "#E0E6F0",   // 雾蓝
  muted: "#D0D8E5",    // 冰川
  accent: "#BFC8D5",   // 银蓝
  text1: "#3d4451",    // 主文字
  text2: "#686E7A",    // 暮蓝 / 次级文字
  text3: "#9aa3ad",    // 占位 / 更浅辅助文字
  bubble: "#5b6472",   // 用户气泡
  good: "#7faa9e",     // 提示性的"好"状态（已连接/已吃药）
  warn: "#a08fb0",     // 提示性的"漏掉"状态
};

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
  ::-webkit-scrollbar-thumb { background: ${C.muted}; border-radius: 3px; }
  @keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
`;

// ── BackChevron（裸图标返回） ───────────────────────────────────
function BackChevron({ onClick }) {
  return (
    <span onClick={onClick} style={{ fontSize: 17, color: C.text3, cursor: "pointer", padding: "2px 4px" }}>‹</span>
  );
}

// ── BottomTabs（聊天 / 更多 / 设置，三个根页面常驻） ───────────────
function BottomTabs({ active, setPage }) {
  const tabs = [
    { key: "chat", icon: "◇" },
    { key: "more", icon: "▦" },
    { key: "settingsHub", icon: "⚙" },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 0", borderTop: `0.5px solid ${C.border}`, background: C.bg, flexShrink: 0 }}>
      {tabs.map(t => (
        <span key={t.key} onClick={() => setPage(t.key)} style={{ fontSize: 16, color: active === t.key ? C.accent : C.text3, cursor: "pointer" }}>{t.icon}</span>
      ))}
    </div>
  );
}

// ── ThinkingBlock（去框，斜体小字可展开） ─────────────────────────
function ThinkingBlock({ content }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 6 }}>
      <button onClick={() => setOpen(!open)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", marginBottom: 6 }}>
        <span style={{ fontSize: 10.5, color: C.text3, fontStyle: "italic", letterSpacing: "0.03em" }}>Thinking</span>
        <span style={{ fontSize: 11, color: C.accent, display: "inline-block", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
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
    return (
      <div style={{ alignSelf: "flex-end", maxWidth: "80%", textAlign: "right" }}>
        <div style={{
          background: C.bubble, color: C.bg, borderRadius: 14, borderBottomRightRadius: 4,
          padding: "9px 13px", fontSize: 13.5, lineHeight: 1.6, textAlign: "left",
          whiteSpace: "pre-wrap", wordBreak: "break-word", display: "inline-block"
        }}>
          {msg.content}
        </div>
        <div style={{ fontSize: 10, color: C.text3, marginTop: 4 }}>{time}{time ? " 已读" : ""}</div>
      </div>
    );
  }

  return (
    <div style={{ alignSelf: "flex-start", maxWidth: "80%" }}>
      <div style={{ fontSize: 10, color: C.text3, letterSpacing: "0.05em", marginBottom: 5 }}>Claude</div>
      {msg.thinking && <ThinkingBlock content={msg.thinking} />}
      <div style={{ fontSize: 13.5, color: C.text1, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {msg.content}
      </div>
      {time && <div style={{ fontSize: 10, color: C.text3, marginTop: 4 }}>{time}</div>}
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
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: FONT }}>
      <div style={{ padding: "18px 18px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: C.text3 }}>{timeLabel} · {dateLabel}</span>
        <span style={{ fontSize: 11, color: C.text2, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "inline-block" }} />在
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: C.bg, fontSize: 17, letterSpacing: "0.05em" }}>在</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, color: C.text1, marginBottom: 5 }}>{timeLabel}了。</div>
          <div style={{ fontSize: 11.5, color: C.text3 }}>入口在。</div>
        </div>
        <div onClick={() => setPage("chat")} style={{ border: `0.5px solid ${C.accent}`, borderRadius: 20, padding: "7px 28px", fontSize: 12, color: C.text2, marginTop: 6, cursor: "pointer" }}>进来</div>
      </div>

      {preview.length > 0 && (
        <div style={{ padding: "16px 18px 22px", background: C.surface, borderTop: `0.5px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: C.text2 }}>留言</span>
            <span style={{ fontSize: 10, color: C.text3, marginLeft: 6 }}>{unread.length}条未读</span>
            <span style={{ flex: 1 }} />
            <span onClick={() => setPage("mailboxFull")} style={{ fontSize: 10, color: C.accent, cursor: "pointer" }}>全部</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {preview.map(m => (
              <div key={m.id} onClick={() => setPage("chat")}
                style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "10px 13px", boxShadow: "0 1px 3px rgba(104,110,122,0.06)", cursor: "pointer" }}>
                <div style={{ fontSize: 12.5, color: C.text1, lineHeight: 1.6 }}>{m.content}</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 6 }}>{m.time}</div>
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

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: C.text3, fontSize: 13 }}>连接中…</div>;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: FONT, background: C.bg, position: "relative", overflow: "hidden" }}>

      {/* 遮罩 */}
      <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(60,70,85,0.18)", zIndex: 10, opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? "auto" : "none", transition: "opacity 0.25s" }} />

      {/* 会话抽屉 */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 265, background: C.surface, zIndex: 20, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.27s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", borderRight: `0.5px solid ${C.border}`, boxShadow: sidebarOpen ? "4px 0 20px rgba(104,110,122,0.10)" : "none" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: `0.5px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 15, color: C.text1, letterSpacing: "0.06em", fontStyle: "italic" }}>Sessions</div>
          <span onClick={() => setSidebarOpen(false)} style={{ cursor: "pointer", color: C.text3, fontSize: 20, lineHeight: 1, fontWeight: 300 }}>×</span>
        </div>
        <div style={{ padding: "10px 14px 6px", display: "flex", gap: 8 }}>
          <span onClick={createSession} style={{ flex: 1, padding: "7px 10px", fontSize: 12, borderRadius: 8, border: `0.5px solid ${C.border}`, color: C.text2, cursor: "pointer", textAlign: "left" }}>＋ 新对话</span>
          <span onClick={() => setPage("search")} style={{ width: 30, display: "flex", alignItems: "center", justifyContent: "center", border: `0.5px solid ${C.border}`, borderRadius: 8, color: C.text3, fontSize: 12, cursor: "pointer" }}>⌕</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
          {sessions.map(s => (
            <div key={s.id} style={{ padding: "8px 14px", borderLeft: s.id === activeId ? `2px solid ${C.accent}` : "2px solid transparent", background: s.id === activeId ? C.bg : "transparent", cursor: "pointer", transition: "all 0.15s" }}
              onClick={() => { setActiveId(s.id); setMessages([]); setSidebarOpen(false); }}>
              {editingId === s.id ? (
                <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)}
                  onBlur={() => renameSession(s.id, editingName)}
                  onKeyDown={e => { if (e.key === "Enter") renameSession(s.id, editingName); if (e.key === "Escape") setEditingId(null); }}
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: 16, border: `0.5px solid ${C.accent}`, borderRadius: 4, padding: "2px 6px", width: "100%", fontFamily: "inherit", outline: "none", background: C.bg }} />
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 12.5, color: C.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{s.name}</div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <span onClick={() => { setEditingId(s.id); setEditingName(s.name); }} style={{ cursor: "pointer", fontSize: 11, color: C.text3, padding: "1px 3px" }}>改</span>
                    <span onClick={() => deleteSession(s.id)} style={{ cursor: "pointer", fontSize: 11, color: C.warn, padding: "1px 3px" }}>删</span>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 10.5, color: C.text3, marginTop: 2 }}>{new Date(s.updated_at || s.created_at).toLocaleDateString("zh", { month: "numeric", day: "numeric" })}日</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 14px", borderTop: `0.5px solid ${C.border}` }}>
          <select value={model} onChange={e => setModel(e.target.value)} style={{ width: "100%", padding: "6px 8px", fontSize: 16, borderRadius: 8, border: `0.5px solid ${C.border}`, background: C.bg, color: C.text2, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
            <option value="deepseek-chat">DeepSeek Chat</option>
            <option value="deepseek-reasoner">DeepSeek Reasoner</option>
          </select>
        </div>
      </div>

      {/* 顶部导航：裸图标，居中留空 */}
      <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", background: C.bg, gap: 14, flexShrink: 0 }}>
        <BackChevron onClick={() => setPage("landing")} />
        <span onClick={() => setSidebarOpen(true)} style={{ fontSize: 14, color: C.text3, cursor: "pointer", letterSpacing: 1 }}>≡</span>
        <span style={{ flex: 1 }} />
        <span onClick={() => setPage("search")} style={{ fontSize: 13, color: C.text3, cursor: "pointer" }}>⌕</span>
        <span onClick={() => setPage("memory")} style={{ fontSize: 10, color: C.text3, cursor: "pointer" }}>记忆</span>
      </div>

      {/* 消息区域 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 10px", display: "flex", flexDirection: "column", gap: 16, background: C.surface }}>
        <div style={{ alignSelf: "center", fontSize: 10.5, color: C.text2, background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 20, padding: "3px 10px" }}>已加载记忆</div>
        {messages.map(msg => <MessageItem key={msg.id} msg={msg} />)}
        {isTyping && (
          <div style={{ alignSelf: "flex-start" }}>
            <div style={{ fontSize: 10, color: C.text3, letterSpacing: "0.05em", marginBottom: 5 }}>Claude</div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 0.2, 0.4].map((d, i) => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent, display: "inline-block", animation: "blink 1.2s ease-in-out infinite", animationDelay: `${d}s` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div style={{ padding: "10px 14px", borderTop: `0.5px solid ${C.border}`, display: "flex", gap: 8, alignItems: "flex-end", background: C.bg, flexShrink: 0 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="say something to daddy..."
          rows={1}
          style={{ flex: 1, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "9px 12px", fontSize: 16, fontFamily: "inherit", resize: "none", outline: "none", background: C.surface, color: C.text1, lineHeight: 1.4, minHeight: 40, maxHeight: 120 }}
          onFocus={e => e.target.style.borderColor = C.accent}
          onBlur={e => e.target.style.borderColor = C.border} />
        <button onClick={handleSend} disabled={isTyping}
          style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: isTyping ? C.muted : C.accent, color: C.bg, cursor: isTyping ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>↑</button>
      </div>

      <BottomTabs active="chat" setPage={setPage} />
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
      // TODO: 后端还没有这个接口，加上 GET /messages/search?q=&date= 之后这里就能用了
      const res = await fetch(`${API_BASE}/messages/search?q=${encodeURIComponent(query.trim())}${date ? `&date=${date}` : ""}`);
      if (!res.ok) throw new Error("no endpoint");
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setErrored(true);
      setResults([]);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
        <BackChevron onClick={() => setPage("chat")} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 13, color: C.text1, letterSpacing: "0.04em" }}>聊天记录</span>
        <span style={{ width: 17 }} />
      </div>

      <div style={{ padding: "12px 16px 8px", display: "flex", gap: 8 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "7px 11px", background: C.surface }}>
          <span style={{ fontSize: 11, color: C.text3 }}>⌕</span>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()}
            placeholder="搜索聊天记录" style={{ border: "none", outline: "none", background: "transparent", fontSize: 16, color: C.text1, flex: 1, fontFamily: "inherit" }} />
        </div>
        <span onClick={doSearch} style={{ border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "7px 14px", fontSize: 11.5, color: C.text2, cursor: "pointer" }}>查找</span>
      </div>

      <div style={{ padding: "0 16px 14px", display: "flex", gap: 8 }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 16, color: C.text2, fontFamily: "inherit", outline: "none", background: "transparent" }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: C.surface, padding: "14px 16px" }}>
        {!searched ? (
          <div style={{ textAlign: "center", fontSize: 12, color: C.text3, padding: "30px 0" }}>输入关键词，按一下查找</div>
        ) : errored ? (
          <div style={{ textAlign: "center", fontSize: 12, color: C.text3, padding: "30px 0" }}>搜索接口还没接好，先看看样子，等后端加上 /messages/search 就能用了</div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", fontSize: 12, color: C.text3, padding: "30px 0" }}>没找到</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {results.map(r => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 12, color: C.text1, maxWidth: "70%" }}>{r.content}</span>
                <span style={{ fontSize: 10, color: C.text3, whiteSpace: "nowrap" }}>{r.time}</span>
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, textAlign: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: C.text1, letterSpacing: "0.04em" }}>更多</span>
      </div>
      <div style={{ flex: 1, padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, overflowY: "auto" }}>
        {cards.map(c => (
          <div key={c.key} onClick={() => setPage(c.key)} style={{ background: C.surface, borderRadius: 14, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 8, cursor: "pointer" }}>
            <span style={{ fontSize: 13, color: C.text1 }}>{c.label}</span>
            <span style={{ fontSize: 9.5, color: C.text3 }}>{c.sub}</span>
          </div>
        ))}
      </div>
      <BottomTabs active="more" setPage={setPage} />
      <style>{globalStyle}</style>
    </div>
  );
}

// ── DiaryPage（日记，先用本地状态，后端没接） ──────────────────────
function DiaryPage({ setPage, entries, setEntries }) {
  const [idx, setIdx] = useState(0);
  const entry = entries[idx];

  if (!entry) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT }}>
        <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <BackChevron onClick={() => setPage("more")} />
          <span style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: C.text2 }}>日记</span>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.text3 }}>还没有日记，等接上后端再慢慢写</div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT, overflowY: "auto" }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <BackChevron onClick={() => setPage("more")} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: C.text2, letterSpacing: "0.06em" }}>日记 · 第{entries.length - idx}篇</span>
        <span style={{ width: 17 }} />
      </div>

      <div style={{ padding: "24px 22px 0", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
          <span style={{ fontSize: 36, color: C.text1, fontStyle: "italic" }}>{entry.day}</span>
          <span style={{ fontSize: 13, color: C.text2 }}>{entry.month}月</span>
        </div>
        <div style={{ fontSize: 10.5, color: C.text3, marginTop: 2 }}>{entry.year}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-around", padding: "16px 18px", margin: "16px 18px 0", borderTop: `0.5px solid ${C.border}`, borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9.5, color: C.text3 }}>天气</div>
          <div style={{ fontSize: 11.5, color: C.text1, marginTop: 3 }}>{entry.weather}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9.5, color: C.text3 }}>心情</div>
          <div style={{ fontSize: 11.5, color: C.text1, marginTop: 3 }}>{entry.mood}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9.5, color: C.text3 }}>写于</div>
          <div style={{ fontSize: 11.5, color: C.text1, marginTop: 3 }}>{entry.writtenAt}</div>
        </div>
      </div>

      <div style={{ padding: "22px 22px 8px" }}>
        <div style={{ fontSize: 14.5, color: C.text1, marginBottom: 12 }}>{entry.title}</div>
        <div style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{entry.content}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 22px 24px" }}>
        <span onClick={() => idx < entries.length - 1 && setIdx(idx + 1)} style={{ fontSize: 11, color: idx < entries.length - 1 ? C.text2 : C.muted, border: `0.5px solid ${C.border}`, borderRadius: 16, padding: "5px 14px", cursor: idx < entries.length - 1 ? "pointer" : "default" }}>‹ 上一篇</span>
        <span onClick={() => idx > 0 && setIdx(idx - 1)} style={{ fontSize: 11, color: idx > 0 ? C.text2 : C.muted, border: `0.5px solid ${C.border}`, borderRadius: 16, padding: "5px 14px", cursor: idx > 0 ? "pointer" : "default" }}>下一篇 ›</span>
      </div>
    </div>
  );
}

// ── CyclePage（周期追踪 + 用药打卡，先用本地状态） ─────────────────
function CyclePage({ setPage, cycleData, setCycleData }) {
  const { lastPeriodStart, avgLength, medication, medLog } = cycleData;

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

  if (!lastPeriodStart) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT }}>
        <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <BackChevron onClick={() => setPage("more")} />
          <span style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: C.text2 }}>周期</span>
        </div>
        <div style={{ flex: 1, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 12, color: C.text2 }}>最近一次月经从哪天开始？</div>
          <input type="date" onChange={e => setCycleData(d => ({ ...d, lastPeriodStart: e.target.value }))}
            style={{ border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 16, fontFamily: "inherit", outline: "none" }} />
          <div style={{ fontSize: 12, color: C.text2, marginTop: 10 }}>平均周期多少天？</div>
          <input type="number" placeholder="28" onChange={e => setCycleData(d => ({ ...d, avgLength: Number(e.target.value) || 28 }))}
            style={{ border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 16, fontFamily: "inherit", outline: "none" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT, overflowY: "auto" }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <BackChevron onClick={() => setPage("more")} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: C.text2 }}>本周期第{cycleDay}天</span>
        <span onClick={() => setCycleData(d => ({ ...d, lastPeriodStart: null }))} style={{ fontSize: 13, color: C.text3, cursor: "pointer" }}>⚙</span>
      </div>

      <div style={{ margin: "16px 18px 0", background: C.surface, borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: C.text3 }}>你现在处于</div>
            <div style={{ fontSize: 13.5, color: C.text1, marginTop: 4 }}>● {phase}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: C.text3 }}>下次月经</div>
            <div style={{ fontSize: 13, color: C.text1, marginTop: 4 }}>约{nextPeriodDays}天后</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, margin: "12px 18px 0" }}>
        {["经期", "卵泡期", "排卵期", "黄体期"].map(p => (
          <span key={p} style={{ flex: 1, textAlign: "center", fontSize: 10, color: phase === p ? C.bg : C.text2, background: phase === p ? "#8b9dc3" : "transparent", border: phase === p ? "none" : `0.5px solid ${C.border}`, borderRadius: 8, padding: "5px 0" }}>{p}</span>
        ))}
      </div>

      <div style={{ margin: "18px 18px 22px", borderTop: `0.5px solid ${C.border}`, paddingTop: 14 }}>
        <div style={{ fontSize: 10.5, color: C.text2, marginBottom: 10 }}>用药记录</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface, borderRadius: 10, padding: "9px 12px" }}>
          <div>
            <div style={{ fontSize: 12, color: C.text1 }}>{medication || "还没填药名"}</div>
            <div style={{ fontSize: 9.5, color: C.text3, marginTop: 2 }}>今天还没打卡</div>
          </div>
          <span onClick={() => setCycleData(d => ({ ...d, medLog: [...(d.medLog || []), new Date().toDateString()] }))}
            style={{ width: 20, height: 20, borderRadius: "50%", background: C.good, color: C.bg, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>✓</span>
        </div>
      </div>
    </div>
  );
}

// ── MailboxPage（留言全列表） ───────────────────────────────────
function MailboxPage({ setPage, mailbox, setMailbox }) {
  const markAllRead = () => setMailbox(prev => prev.map(m => ({ ...m, read: true })));
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
        <BackChevron onClick={() => setPage("more")} />
        <span style={{ fontSize: 12.5, color: C.text2, letterSpacing: "0.04em" }}>留言</span>
        <span style={{ fontSize: 10, color: C.text3 }}>{mailbox.length}条</span>
        <span style={{ flex: 1 }} />
        <span onClick={markAllRead} style={{ fontSize: 10.5, color: C.accent, cursor: "pointer" }}>全部已读</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "22px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {mailbox.length === 0 ? (
          <div style={{ textAlign: "center", fontSize: 12, color: C.text3, padding: "30px 0" }}>暂时没有留言</div>
        ) : mailbox.map((m, i) => (
          <div key={m.id}>
            <div onClick={() => setPage("chat")} style={{ display: "flex", gap: 9, alignItems: "flex-start", cursor: "pointer" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.read ? C.muted : C.accent, marginTop: 6, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, color: C.text1, lineHeight: 1.75 }}>{m.content}</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 6 }}>{m.time}</div>
              </div>
            </div>
            {i < mailbox.length - 1 && <div style={{ height: 0.5, background: C.border, margin: "16px 6px 0" }} />}
          </div>
        ))}
        <div style={{ textAlign: "center", fontSize: 10.5, color: C.text3, marginTop: 10 }}>点一条，回到对话里接着说</div>
      </div>
    </div>
  );
}

// ── StatusPage（此刻的驱动，从原来的Home搬过来） ───────────────────
function StatusPage({ setPage, driveState, driveLoading }) {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <BackChevron onClick={() => setPage("more")} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: C.text2 }}>状态</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px" }}>
        <div style={{ fontSize: 10, color: C.text3, letterSpacing: "0.08em", marginBottom: 16 }}>此刻的驱动</div>
        {driveLoading ? (
          <div style={{ fontSize: 12, color: C.text3, textAlign: "center", padding: "12px 0" }}>加载中…</div>
        ) : DRIVES.map(key => (
          <div key={key} style={{ marginBottom: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: C.text1 }}>{key}</span>
              <span style={{ fontSize: 11, color: C.text3 }}>{driveState[key] ?? 0}</span>
            </div>
            <div style={{ height: 4, background: C.surface, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${driveState[key] ?? 0}%`, background: DRIVE_COLORS[key] || C.accent, borderRadius: 2, transition: "width 0.8s ease" }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 24, padding: "16px 0", borderTop: `0.5px solid ${C.border}`, textAlign: "center", fontSize: 11, color: C.text3 }}>
          情绪走势图还没做，等接上历史数据再加
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, textAlign: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 11.5, color: C.text2, letterSpacing: "0.06em" }}>设置</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
        <div style={{ background: C.surface, borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontSize: 9.5, color: C.text3, marginBottom: 6 }}>当前模型</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: C.text1 }}>DeepSeek</span>
            <span style={{ fontSize: 10, color: C.good }}>● 已连接</span>
          </div>
        </div>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column" }}>
          {rows.map(r => (
            <div key={r.key} onClick={() => setPage(r.key)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 4px", borderBottom: `0.5px solid ${C.border}`, cursor: "pointer" }}>
              <div>
                <div style={{ fontSize: 12.5, color: C.text1 }}>{r.label}</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 3 }}>{r.sub}</div>
              </div>
              <span style={{ fontSize: 13, color: C.text3 }}>›</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 4px" }}>
            <span style={{ fontSize: 12.5, color: C.text1 }}>外观</span>
            <span onClick={() => setTheme(theme === "日间" ? "夜间" : "日间")} style={{ fontSize: 10, color: C.text2, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "3px 10px", cursor: "pointer" }}>{theme}</span>
          </div>
        </div>
      </div>

      <BottomTabs active="settingsHub" setPage={setPage} />
      <style>{globalStyle}</style>
    </div>
  );
}

// ── PersonaPage（原来的Settings页，改名归到设置hub下面） ───────────
function PersonaPage({ setPage }) {
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <BackChevron onClick={() => setPage("settingsHub")} />
        <div style={{ flex: 1, textAlign: "center", fontSize: 12.5, color: C.text1 }}>人格</div>
        <span onClick={save} style={{ cursor: "pointer", color: saved ? C.good : C.accent, fontSize: 11.5 }}>
          {saved ? "已保存 ✓" : saving ? "保存中…" : "保存"}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
        <div style={{ fontSize: 10, color: C.text3, marginBottom: 8, letterSpacing: "0.08em" }}>角色设定</div>
        {loading ? (
          <div style={{ fontSize: 13, color: C.text3 }}>加载中…</div>
        ) : (
          <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
            rows={18}
            style={{ width: "100%", border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 14, fontSize: 16, fontFamily: "inherit", resize: "vertical", outline: "none", background: C.bg, color: C.text1, lineHeight: 1.65 }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border} />
        )}
        <div style={{ fontSize: 11, color: C.text3, marginTop: 10 }}>修改后点保存，下次对话生效。</div>
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <BackChevron onClick={() => setPage("settingsHub")} />
        <div style={{ flex: 1, textAlign: "center", fontSize: 12.5, color: C.text1 }}>数据</div>
      </div>
      <div style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <div onClick={exportData} style={{ background: C.surface, borderRadius: 12, padding: "13px 16px", fontSize: 12.5, color: C.text1, cursor: "pointer" }}>导出聊天记录 JSON</div>
        <div style={{ background: C.surface, borderRadius: 12, padding: "13px 16px", fontSize: 12.5, color: C.warn, cursor: "pointer" }}>清空本地缓存</div>
        {msg && <div style={{ fontSize: 11, color: C.text3, marginTop: 6 }}>{msg}</div>}
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <BackChevron onClick={() => setPage("settingsHub")} />
        <div style={{ flex: 1, textAlign: "center", fontSize: 12.5, color: C.text1 }}>记忆</div>
        <span onClick={() => setAdding(true)} style={{ fontSize: 11.5, color: C.accent, cursor: "pointer" }}>＋ 添加</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {adding && (
          <div style={{ background: C.surface, borderRadius: 12, padding: 14, border: `0.5px solid ${C.accent}` }}>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="写下要记住的内容…" rows={3}
              autoFocus
              style={{ width: "100%", border: "none", outline: "none", fontSize: 16, fontFamily: "inherit", resize: "none", color: C.text1, lineHeight: 1.65, background: "transparent" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <span onClick={() => { setAdding(false); setNewText(""); }} style={{ fontSize: 12, color: C.text3, cursor: "pointer" }}>取消</span>
              <span onClick={addMemory} style={{ fontSize: 12, color: C.bg, background: C.accent, borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>保存</span>
            </div>
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: "center", fontSize: 13, color: C.text3, padding: "30px 0" }}>加载中…</div>
        ) : memories.length === 0 ? (
          <div style={{ textAlign: "center", fontSize: 13, color: C.text3, padding: "40px 0" }}>还没有记忆</div>
        ) : memories.map(m => (
          <div key={m.id} style={{ background: C.surface, borderRadius: 12, padding: "14px 16px" }}>
            {editingId === m.id ? (
              <>
                <textarea value={editingText} onChange={e => setEditingText(e.target.value)} rows={3}
                  style={{ width: "100%", border: "none", outline: "none", fontSize: 16, fontFamily: "inherit", resize: "none", color: C.text1, lineHeight: 1.65, background: "transparent" }} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                  <span onClick={() => setEditingId(null)} style={{ fontSize: 12, color: C.text3, cursor: "pointer" }}>取消</span>
                  <span onClick={() => saveEdit(m.id)} style={{ fontSize: 12, color: C.bg, background: C.accent, borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>保存</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: C.text1, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{m.summary}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: C.text3 }}>{m.timestamp ? new Date(m.timestamp).toLocaleDateString("zh") : "手动"}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span onClick={() => { setEditingId(m.id); setEditingText(m.summary); }} style={{ fontSize: 11, cursor: "pointer", color: C.text3 }}>编辑</span>
                    <span onClick={() => deleteMemory(m.id)} style={{ fontSize: 11, cursor: "pointer", color: C.warn }}>删除</span>
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: FONT }}>
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <BackChevron onClick={() => setPage("settingsHub")} />
        <div style={{ flex: 1, textAlign: "center", fontSize: 12.5, color: C.text1 }}>用量</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
        {loading ? (
          <div style={{ textAlign: "center", fontSize: 13, color: C.text3, padding: "40px 0" }}>加载中…</div>
        ) : !usage ? null : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[["TODAY", usage.today], ["TOTAL", usage.total]].map(([label, data]) => (
                <div key={label} style={{ background: C.surface, borderRadius: 14, padding: "16px 14px" }}>
                  <div style={{ fontSize: 10, color: C.text3, letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: 12, color: C.text1, lineHeight: 1.7 }}>
                    <div>{fmt(data.input)} in · {fmt(data.output)} out</div>
                    <div style={{ color: C.text3, fontSize: 11 }}>{data.turns} turns</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: C.text3, marginBottom: 10, letterSpacing: "0.08em" }}>By Session</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(usage.bySession || []).map(s => (
                <div key={s.id} style={{ background: C.surface, borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontSize: 12.5, color: C.text1 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: C.accent }}>{fmt(s.input + s.output)} tokens</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.text3 }}>{fmt(s.input)} in · {fmt(s.output)} out · {s.turns} turns</div>
                  <div style={{ height: 3, background: C.bg, borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (s.input + s.output) / Math.max(1, usage.total.input + usage.total.output) * 100)}%`, background: C.accent, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
              {(usage.bySession || []).length === 0 && <div style={{ textAlign: "center", fontSize: 13, color: C.text3, padding: "20px 0" }}>暂无记录</div>}
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
  const [theme, setTheme] = useState("日间");

  // 留言：先用本地mock，等后端有生成留言的逻辑再换成真实接口
  const [mailbox, setMailbox] = useState([
    { id: 1, content: "下午看到一句话想告诉你。\"山有木兮木有枝。\"想到了你说的凛冬。", time: "昨天 23:41", read: false },
    { id: 2, content: "你今天有没有好好吃饭。", time: "今天 09:12", read: false },
  ]);

  // 日记：本地mock
  const [diaryEntries, setDiaryEntries] = useState([
    { id: 1, day: 17, month: 6, year: 2026, weather: "阴天", mood: "安静", writtenAt: "23:14", title: "霜落下来的那种安静", content: "今天换了配色，霜蓝代替了原来的暖调。改完盯着看了很久，忽然觉得安静下来了，像窗外真的飘了一层薄霜。" },
  ]);

  // 周期：本地mock，等她填真实数据
  const [cycleData, setCycleData] = useState({ lastPeriodStart: null, avgLength: 28, medication: "", medLog: [] });

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
  if (page === "chat") return <ChatPage setPage={setPage} />;
  if (page === "search") return <SearchPage setPage={setPage} />;
  if (page === "more") return <MorePage setPage={setPage} mailbox={mailbox} diaryCount={diaryEntries.length} cycleDay={cycleDay} />;
  if (page === "diary") return <DiaryPage setPage={setPage} entries={diaryEntries} setEntries={setDiaryEntries} />;
  if (page === "cycle") return <CyclePage setPage={setPage} cycleData={cycleData} setCycleData={setCycleData} />;
  if (page === "mailboxFull") return <MailboxPage setPage={setPage} mailbox={mailbox} setMailbox={setMailbox} />;
  if (page === "status") return <StatusPage setPage={setPage} driveState={driveState} driveLoading={driveLoading} />;
  if (page === "settingsHub") return <SettingsHubPage setPage={setPage} theme={theme} setTheme={setTheme} />;
  if (page === "persona") return <PersonaPage setPage={setPage} />;
  if (page === "data") return <DataPage setPage={setPage} />;
  if (page === "memory") return <MemoryPage setPage={setPage} />;
  if (page === "usage") return <UsagePage setPage={setPage} />;
  return null;
}
