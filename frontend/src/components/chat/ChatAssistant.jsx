import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../../services/chatService";

const QUICK_QUESTIONS = [
  "Why is this route recommended?",
  "Which route has the lowest AQI?",
  "Which route is fastest?",
  "How is the traffic?",
  "What does my AQI mean?",
  "Explain the weather",
  "Compare my routes",
  "Why is the AQI forecast changing?",
];

const WELCOME_MESSAGE =
  "Hi! I'm your AeroMobility Assistant. I can help you understand your routes, AQI, weather, traffic, and travel conditions.";

export default function ChatAssistant({
  origin,
  originText,
  destination,
  destinationText,
  healthProfile,
  routesData,
  activeTab = "home",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      content: WELCOME_MESSAGE,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Build telemetry context from live application state
  const buildContext = () => {
    const context = {
      activeTab,
      healthProfile: healthProfile || "general",
    };

    if (origin?.latitude || originText) {
      context.origin = {
        station_name: origin?.station_name || originText || "Origin",
        latitude: origin?.latitude,
        longitude: origin?.longitude,
      };
    }

    if (destination?.latitude || destinationText) {
      context.destination = {
        station_name: destination?.station_name || destinationText || "Destination",
        latitude: destination?.latitude,
        longitude: destination?.longitude,
      };
    }

    if (routesData?.routes && Array.isArray(routesData.routes)) {
      context.routes = routesData.routes.map((r) => ({
        route_id: r.route_id,
        travel_time_minutes: r.travel_time_minutes,
        distance_km: r.distance_km,
        aqi: r.aqi,
        peak_aqi: r.peak_aqi,
        traffic_delay_minutes: r.traffic_delay_minutes,
        score: r.score,
        is_recommended: r.route_id === routesData.recommended_route_id,
        has_tolls: r.has_tolls,
        has_highways: r.has_highways,
      }));
    }

    return context;
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: query,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    setLoading(true);

    // Prepare short conversation history for context
    const historyPayload = newMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    const contextPayload = buildContext();

    const response = await sendChatMessage(query, contextPayload, historyPayload);

    const assistantMsg = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: response.reply,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* ── FLOATING LAUNCHER BUTTON ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close AeroMobility Assistant" : "Open AeroMobility Assistant"}
        className="fixed z-40 bottom-20 right-4 sm:bottom-6 sm:right-6 flex items-center gap-2.5 bg-[#168b62] hover:bg-[#127250] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-[#1cd494]/30 focus:outline-none focus:ring-2 focus:ring-[#168b62] focus:ring-offset-2"
      >
        <div className="relative flex items-center justify-center">
          {/* Lucide Bot / Message Icon (No robot emoji) */}
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#34d399] rounded-full ring-2 ring-[#168b62] animate-pulse" />
        </div>
        <span className="text-xs font-bold tracking-tight hidden sm:inline">AeroMobility Assistant</span>
      </button>

      {/* ── CHAT PANEL WINDOW ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AeroMobility Assistant Chat"
          className="fixed z-50 bottom-20 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-20 w-auto sm:w-[380px] max-w-[calc(100vw-1.5rem)] h-[520px] max-h-[calc(100vh-6.5rem)] bg-white rounded-3xl border border-[#cbe4d5] shadow-2xl flex flex-col overflow-hidden animate-fadeIn"
        >
          {/* ── HEADER ── */}
          <div className="bg-[#168b62] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#147a56] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                  <path d="M2 14h2" />
                  <path d="M20 14h2" />
                  <path d="M15 13v2" />
                  <path d="M9 13v2" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-sm font-bold leading-tight">AeroMobility Assistant</h3>
                <p className="text-[11px] text-[#b3eed2] leading-tight">Your journey & air-quality guide</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Assistant"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold transition focus:outline-none"
            >
              ✕
            </button>
          </div>

          {/* ── CONVERSATION STREAM ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fbfdfb]">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isUser
                        ? "bg-[#168b62] text-white rounded-br-sm shadow-sm"
                        : "bg-white text-[#17352b] border border-[#dce9e1] rounded-bl-sm shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  </div>
                </div>
              );
            })}

            {/* ── THINKING STATE ── */}
            {loading && (
              <div className="flex items-center gap-2 text-[#60776c] text-xs py-1.5 px-3 bg-[#edf7f2] rounded-xl border border-[#d2eadc] w-fit">
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-[#168b62] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#168b62] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#168b62] rounded-full animate-bounce" />
                </span>
                <span className="font-medium text-[11px]">AeroMobility is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── QUICK QUESTIONS (WHEN NO ACTIVE USER MESSAGES YET) ── */}
          {messages.length <= 1 && !loading && (
            <div className="px-3 py-2 bg-[#f4faf6] border-t border-[#e2efe7] shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#60776c] mb-1.5 px-1">
                Suggested Questions
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="text-[11px] text-left font-medium bg-white hover:bg-[#eaf5ee] text-[#168b62] border border-[#cbe4d5] hover:border-[#168b62] px-2.5 py-1 rounded-lg transition shadow-2xs"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── INPUT FORM ── */}
          <div className="p-3 bg-white border-t border-[#e2efe7] shrink-0 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about routes, AQI, weather..."
              disabled={loading}
              className="flex-1 text-xs bg-[#f4f7f4] border border-[#d8e6dc] rounded-xl px-3 py-2 text-[#17352b] placeholder-[#8ea49a] focus:outline-none focus:border-[#168b62] focus:bg-white transition"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || loading}
              aria-label="Send message"
              className="w-9 h-9 rounded-xl bg-[#168b62] hover:bg-[#127250] disabled:bg-[#d0dfd6] disabled:text-[#8ea49a] text-white flex items-center justify-center transition focus:outline-none shrink-0"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
