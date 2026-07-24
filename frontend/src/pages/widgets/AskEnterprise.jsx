import { useEffect, useRef, useState } from "react";
import { Send, Bot, CheckCircle2 } from "lucide-react";
import { api } from "../../api/api.js";

export default function AskEnterprise() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.getChatMessages().then(setMessages);
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
    <div className="card p-5">
      <h3 className="font-semibold text-slate-900">Ask the Enterprise</h3>
      <p className="text-xs text-slate-400 mb-4">Chat with your enterprise AI agents</p>

      <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
        {messages.map((m) =>
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
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm p-4 max-w-md">
                <p className="text-sm font-medium text-slate-800">{m.agentName}</p>
                <p className="text-xs text-slate-400 mb-2">{m.status}</p>
                <p className="text-sm text-slate-700 mb-2">{m.summary}</p>
                <ul className="space-y-1 mb-2">
                  {m.bullets?.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                {m.impact && (
                  <span className="badge bg-red-50 text-red-600">{m.impact}</span>
                )}
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 mt-4 border-t border-slate-100 pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a follow-up question..."
          className="flex-1 text-sm border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-500 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
