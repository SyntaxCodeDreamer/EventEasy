import React, { useState } from "react";
import { MessageSquare, X, Send, Sparkles, Bot, Loader2 } from "lucide-react";
import { api } from "../services/api";
import { useEvent } from "../context/EventContext";

export default function GlobalAIChat() {
  const { selectedEvent } = useEvent();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Namaste! I am your EventEase AI Copilot. Ask me about your budget, catering guest counts, weather contingency, or cultural recommendations."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedEvent) return;

    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await api.aiChat(selectedEvent.id, userText);
      setMessages(prev => [...prev, { role: "assistant", text: res.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "I encountered an error connecting to the orchestrator. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedEvent) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-96 h-[500px] glass-panel rounded-2xl flex flex-col shadow-2xl border border-purple-500/30 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 p-4 border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-600 rounded-lg text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  EventEase AI Copilot <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </h4>
                <p className="text-xs text-purple-300 truncate max-w-[200px]">
                  Event: {selectedEvent.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] p-3 rounded-2xl leading-relaxed ${
                    m.role === "user"
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-[#1E293B] text-slate-200 border border-slate-700/60 rounded-bl-none shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1E293B] text-slate-300 p-3 rounded-2xl rounded-bl-none border border-slate-700/60 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-xs">Agents analyzing event state...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-[#0B0F19]/80 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. My budget reduced by 2 lakh..."
              className="flex-1 bg-[#1E293B] text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-xl transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-200 border border-purple-400/30"
        >
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span className="font-semibold text-sm">Ask AI Copilot</span>
        </button>
      )}
    </div>
  );
}

