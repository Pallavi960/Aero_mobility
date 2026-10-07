import React, { useEffect, useRef, useState, useCallback } from "react";

const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// Quick questions based on available context
function getQuickQuestions(context) {
  const hasRoutes = context?.routes?.length > 0;
  const hasJourney = context?.origin && context?.destination;
  if (hasRoutes) {
    return [
      "Why is this route recommended?",
      "Which route has the lowest AQI?",
      "Which route is fastest?",
      "How is the traffic?",
      "Compare these routes.",
    ];
  }
  if (hasJourney) {
    return [
      "What does my AQI mean?",
      "How is the weather?",
      "Explain the air quality.",
    ];
  }
  return [
    "What is AeroMobility?",
    "How does route comparison work?",
    "How does AQI affect route selection?",
    "What health profiles are available?",
  ];
}

// Strip markdown bold/italic for cleaner display
function parseReply(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .trim();
}

function TypingDots() {
  return (
    <div className="aero-chat-typing" aria-label="AeroMobility is thinking">
      <span /><span /><span />
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`aero-chat-msg ${isUser ? "aero-chat-msg-user" : "aero-chat-msg-bot"}`}>
      {!isUser && (
        <span className="aero-chat-avatar" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v1a4 4 0 0 1-8 0v-1H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/></svg>
        </span>
      )}
      <p className="aero-chat-bubble">{parseReply(msg.content)}</p>
    </div>
  );
}

export default function AeroChat({ context }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  const quickQuestions = getQuickQuestions(context);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading, open]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setError("");
    const newHistory = [...history, { role: "user", content: msg }];
    setHistory(newHistory);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          context: context || {},
          history: history.slice(-10),
        }),
      });
      if (!res.ok) {
        throw new Error("Sorry, I couldn't connect to the assistant right now. Please try again.");
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("application/json")) {
        throw new Error("Sorry, I couldn't connect to the assistant right now. Please try again.");
      }
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Sorry, I couldn't connect to the assistant right now. Please try again.");
      }
      if (data.error || typeof data.reply !== "string") {
        throw new Error("Sorry, I couldn't connect to the assistant right now. Please try again.");
      }
      setHistory([...newHistory, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message || "Sorry, I couldn't connect to the assistant right now. Please try again.");
      setHistory(newHistory); // keep user message visible
    } finally {
      setLoading(false);
    }
  }, [input, history, loading, context]);

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(); };

  const hasJourney = context?.origin && context?.destination;
  const hasRoutes = context?.routes?.length > 0;

  const greeting = hasRoutes
    ? "Your journey is ready. I can help you compare routes, AQI, traffic and weather."
    : hasJourney
    ? "I can help you understand AQI, weather and conditions for your journey."
    : "Hi! I'm the AeroMobility Assistant. I can help you understand AQI, traffic, weather and route comparisons. Plan a journey to get route-specific answers.";

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        className="aero-chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AeroMobility Assistant" : "Open AeroMobility Assistant"}
        aria-expanded={open}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        <span className="aero-chat-fab-label">Assistant</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="aero-chat-panel" ref={panelRef} role="dialog" aria-label="AeroMobility Assistant">
          {/* Header */}
          <div className="aero-chat-header">
            <div className="aero-chat-header-info">
              <span className="aero-chat-header-icon" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </span>
              <div>
                <p className="aero-chat-title">AeroMobility Assistant</p>
                <p className="aero-chat-subtitle">Your journey &amp; air-quality guide</p>
              </div>
            </div>
            <button type="button" className="aero-chat-close" onClick={() => setOpen(false)} aria-label="Close assistant">×</button>
          </div>

          {/* Messages */}
          <div className="aero-chat-messages">
            {/* Greeting */}
            {history.length === 0 && (
              <div className="aero-chat-msg aero-chat-msg-bot">
                <span className="aero-chat-avatar" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v1a4 4 0 0 1-8 0v-1H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/></svg>
                </span>
                <p className="aero-chat-bubble">{greeting}</p>
              </div>
            )}

            {history.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            {loading && (
              <div className="aero-chat-msg aero-chat-msg-bot">
                <span className="aero-chat-avatar" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v1a4 4 0 0 1-8 0v-1H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/></svg>
                </span>
                <TypingDots />
              </div>
            )}
            {error && <p className="aero-chat-error">{error}</p>}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {history.length === 0 && (
            <div className="aero-chat-quick">
              {quickQuestions.map((q) => (
                <button key={q} type="button" className="aero-chat-quick-btn" onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form className="aero-chat-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="aero-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something…"
              disabled={loading}
              maxLength={400}
              aria-label="Message to AeroMobility Assistant"
            />
            <button
              type="submit"
              className="aero-chat-send"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z"/></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
