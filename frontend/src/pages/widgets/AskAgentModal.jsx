import { useEffect, useRef, useState } from "react";
import { X, Send, Bot, Sparkles, CheckCircle2 } from "lucide-react";
import { api } from "../../api/api.js";

export default function AskAgentModal({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingThread, setLoadingThread] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getChatMessages()
      .then((data) => {
        if (!cancelled) setMessages(data);
      })
      .finally(() => {
        if (!cancelled) setLoadingThread(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text }]);
    setSending(true);
    try {
      const reply = await api.sendChatMessage(text);
      setMessages((prev) => [...prev, reply]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 leading-tight">Ask AI</h3>
              <p className="text-[11px] text-slate-400 leading-tight">Enterprise Planner Agent</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[220px]">
          {loadingThread ? (
            <p className="text-sm text-slate-400">Loading conversation…</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-slate-400">
              Ask the Planner Agent anything — it coordinates across every domain agent for you.
            </p>
          ) : (
            messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="bg-brand-600 text-white text-sm px-4 py-2 rounded-2xl rounded-br-sm max-w-xs">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm p-4 max-w-sm">
                    <p className="text-sm font-medium text-slate-800">{m.agentName}</p>
                    {m.status && <p className="text-xs text-slate-400 mb-2">{m.status}</p>}
                    {m.summary && <p className="text-sm text-slate-700 mb-2">{m.summary}</p>}
                    {m.text && !m.summary && <p className="text-sm text-slate-700">{m.text}</p>}
                    {m.bullets && (
                      <ul className="space-y-1 mb-2">
                        {m.bullets.map((b, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                    {m.impact && (
                      <span className="badge bg-red-50 text-red-600">{m.impact}</span>
                    )}
                  </div>
                </div>
              )
            )
          )}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask the Planner Agent..."
            className="flex-1 text-sm border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-500 disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
