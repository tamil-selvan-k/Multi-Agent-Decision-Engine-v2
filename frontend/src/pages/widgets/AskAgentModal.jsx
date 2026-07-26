import { useEffect, useRef, useState } from "react";
import { X, Send, Bot, Sparkles, CheckCircle2, Cpu, AlertTriangle } from "lucide-react";
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

  async function handleSend(overrideText) {
    const textToSubmit = overrideText || input.trim();
    if (!textToSubmit || sending) return;
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: textToSubmit }]);
    setSending(true);
    try {
      const reply = await api.sendChatMessage(textToSubmit);
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          agentName: "Decision Engine Error",
          isError: true,
          queryText: textToSubmit,
          text: err.message || "An error occurred while communicating with the decision engine. Please retry."
        }
      ]);
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
                <div key={m.id} className="flex justify-end animate-fadeIn">
                  <div className="bg-brand-600 text-white text-sm px-4 py-2 rounded-2xl rounded-br-sm max-w-xs">
                    {m.text}
                  </div>
                </div>
              ) : m.isError ? (
                <div key={m.id} className="flex gap-3 animate-fadeIn">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                  <div className="bg-red-50/70 border border-red-200 rounded-2xl rounded-tl-sm p-4 w-full max-w-md text-red-800">
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      {m.agentName || "Orchestration Error"}
                    </p>
                    <p className="text-xs text-red-600/90 mt-1.5 leading-relaxed font-mono bg-red-100/50 p-2.5 rounded-lg border border-red-200/50 overflow-x-auto whitespace-pre-wrap">{m.text}</p>
                    <button 
                      onClick={() => handleSend(m.queryText)}
                      className="mt-3 text-xs font-semibold text-red-700 hover:underline flex items-center gap-1"
                    >
                      Retry request
                    </button>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3 animate-fadeIn">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm p-4 w-full max-w-md">
                    <p className="text-sm font-medium text-slate-800">{m.agentName}</p>
                    {m.status && <p className="text-xs text-slate-400 mb-2">{m.status}</p>}
                    {m.summary && <p className="text-sm text-slate-700 mb-3">{m.summary}</p>}
                    {m.text && !m.summary && <p className="text-sm text-slate-700">{m.text}</p>}
                    
                    {m.bullets && (
                      <div className="space-y-2 mt-2">
                        {m.bullets.map((b, i) => {
                          if (b.startsWith("[Planner Plan]")) {
                            return (
                              <div key={i} className="flex items-start gap-2 bg-indigo-50/50 border border-indigo-100/50 rounded-lg p-2 text-xs text-indigo-900">
                                <Cpu className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold block text-[10px] uppercase tracking-wider text-indigo-500">Planner Agent</span>
                                  {b.replace("[Planner Plan] ", "")}
                                </div>
                              </div>
                            );
                          }
                          if (b.startsWith("[Agent Output]")) {
                            return (
                              <div key={i} className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100/50 rounded-lg p-2 text-xs text-emerald-900">
                                <Bot className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold block text-[10px] uppercase tracking-wider text-emerald-600">Domain Agent Output</span>
                                  {b.replace("[Agent Output] ", "")}
                                </div>
                              </div>
                            );
                          }
                          if (b.startsWith("[Risk Alert]")) {
                            return (
                              <div key={i} className="flex items-start gap-2 bg-red-50/50 border border-red-100/50 rounded-lg p-2 text-xs text-red-900">
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold block text-[10px] uppercase tracking-wider text-red-600">Decision Risk</span>
                                  {b.replace("[Risk Alert] ", "")}
                                </div>
                              </div>
                            );
                          }
                          if (b.startsWith("[Consensus Recommendation]")) {
                            return (
                              <div key={i} className="flex items-start gap-2 bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 shadow-sm">
                                <Sparkles className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-700">Consensus Action Item</span>
                                  <p className="font-medium text-[13px] leading-snug mt-0.5">{b.replace("[Consensus Recommendation] ", "")}</p>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-600 pl-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{b}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {m.reasoning && (
                      <div className="mt-3 bg-brand-50 border border-brand-100 rounded-xl p-3 text-xs text-brand-950">
                        <span className="font-semibold block text-[10px] uppercase tracking-wider text-brand-500">Strategic Rationale</span>
                        <p className="mt-1 leading-relaxed text-slate-700">{m.reasoning}</p>
                      </div>
                    )}
                    {m.impact && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-950">
                        <span className="font-semibold block text-[10px] uppercase tracking-wider text-emerald-600">Business Impact Analysis</span>
                        <p className="mt-1 leading-relaxed text-slate-700">{m.impact}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            )
          )}
          {sending && (
            <div className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm p-4 w-full max-w-md">
                <p className="text-sm font-medium text-slate-800">Enterprise Decision Engine</p>
                <p className="text-xs text-slate-400 mt-1">Coordinating planner and domain agents...</p>
                <div className="flex gap-1.5 mt-3 pl-1">
                  <span className="w-2.5 h-2.5 bg-brand-500/80 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2.5 h-2.5 bg-brand-500/80 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2.5 h-2.5 bg-brand-500/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
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
