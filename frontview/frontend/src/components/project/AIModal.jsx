import { useMemo, useState, useEffect, useRef } from "react";
import { X, Cpu, MessageSquare, Expand, Send, BrainCircuit, Loader2 } from "lucide-react";
import GlassButton from "../ui/GlassButton";

export default function AIModal({ deploymentId, isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState("cohere");

  const [streamedAnalysis, setStreamedAnalysis] = useState("");
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedAnalysis, chatMessages]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const runStreamingAnalysis = async () => {
      setIsLoading(true);
      setError("");
      setStreamedAnalysis("");
      setChatMessages([]);
      setIsChatExpanded(false);

      if (!deploymentId) {
        setError("No deployment selected.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:4000/api/deployments/${deploymentId}/analyze/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ provider })
        });

        if (!response.ok) throw new Error("Connection failed.");

        setIsLoading(false);
        setIsTyping(true);

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (let line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.substring(6);
                if (dataStr === '[DONE]') {
                  setIsTyping(false);
                  break;
                }
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.text && !cancelled) {
                    for (let char of parsed.text) {
                      if (cancelled) break;
                      setStreamedAnalysis((prev) => prev + char);
                      await new Promise(r => setTimeout(r, 15));
                    }
                  }
                } catch (e) { /* partial chunk */ }
              }
            }
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Failed to analyze.");
          setIsLoading(false);
        }
      } finally {
        if (!cancelled) setIsTyping(false);
      }
    };

    runStreamingAnalysis();
    return () => { cancelled = true; };
  }, [isOpen, deploymentId, provider]);

  const canChat = useMemo(() => Boolean(deploymentId), [deploymentId]);

  if (!isOpen) return null;

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || !deploymentId || isTyping) return;

    setChatInput("");
    setIsTyping(true);

    const userMsgId = `${Date.now()}-u`;
    setChatMessages((prev) => [...prev, { id: userMsgId, role: "user", text }]);

    const astMsgId = `${Date.now()}-a`;
    setChatMessages((prev) => [...prev, { id: astMsgId, role: "assistant", text: "" }]);

    try {
      const response = await fetch(`http://localhost:4000/api/deployments/${deploymentId}/analyze/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ provider, question: text })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (let line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6);
              if (dataStr === '[DONE]') break;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  for (let char of parsed.text) {
                    setChatMessages((prev) => prev.map(msg =>
                      msg.id === astMsgId ? { ...msg, text: msg.text + char } : msg
                    ));
                    await new Promise(r => setTimeout(r, 10));
                  }
                }
              } catch (e) { }
            }
          }
        }
      }
    } catch (e) {
      setChatMessages((prev) => [...prev, { id: `${Date.now()}-e`, role: "assistant", text: "Connection lost. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className={`relative w-full bg-[#1e1e20] border border-white/[0.06] rounded-xl flex flex-col max-h-[85vh] shadow-elevation-2 overflow-hidden transition-all duration-300 ${isChatExpanded ? "max-w-4xl" : "max-w-2xl"}`}>

        {/* Header - Clean & Professional */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0 bg-[#161618]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center border border-white/[0.06]">
              <BrainCircuit size={20} className="text-[#a1a1aa]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white tracking-tight uppercase">
                AI Diagnostics
              </h2>
              <p className="text-[12px] text-[#71717a] font-medium mt-0.5">Automated issue resolution</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canChat}
              onClick={() => setIsChatExpanded((v) => !v)}
              className="p-2 rounded-md text-[#71717a] hover:text-white hover:bg-white/[0.06] disabled:opacity-40 transition-colors"
              title={isChatExpanded ? "Collapse Chat" : "Expand Chat"}
            >
              <Expand size={16} />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 rounded-md text-[#71717a] hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 font-mono text-[13px]" style={{ scrollbarWidth: 'thin' }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-52 gap-4">
              <Loader2 size={24} className="text-[#a1a1aa] animate-spin" />
              <div className="text-center">
                <p className="text-[#d4d4d8] font-medium font-sans uppercase tracking-widest">
                  Analyzing deployment logs...
                </p>
                <p className="text-[#71717a] text-[12px] font-sans mt-1">
                  This usually takes a few seconds
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ef4444]/10 flex items-center justify-center">
                <X size={18} className="text-[#ef4444]" />
              </div>
              <p className="text-[#ef4444] font-medium font-sans text-[14px]">{error}</p>
              <button onClick={() => setError("")} className="text-[13px] text-[#71717a] hover:text-white underline font-sans">Try again</button>
            </div>
          ) : !isChatExpanded ? (
            <div className="space-y-4">
              <div className="bg-[#161618] border border-white/[0.06] rounded-xl p-5 shadow-elevation-1">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                  <Cpu size={14} className="text-[#3b82f6]" />
                  <span className="text-[12px] font-black text-[#3b82f6] tracking-widest font-sans uppercase">Analysis Result</span>
                </div>
                <div className="text-[13px] leading-relaxed text-[#d4d4d8] whitespace-pre-wrap">
                  {streamedAnalysis}
                  {isTyping && <span className="inline-block w-1.5 h-4 bg-[#a1a1aa] animate-pulse ml-1 align-middle"></span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 min-h-0 h-full">
              <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-2" style={{ scrollbarWidth: 'thin' }}>
                {/* Initial Analysis */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-[#161618] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 text-[13px] leading-relaxed text-[#d4d4d8] whitespace-pre-wrap shadow-elevation-1">
                    {streamedAnalysis}
                  </div>
                </div>

                {chatMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap shadow-elevation-1 ${m.role === "user"
                        ? "bg-white text-black font-semibold rounded-tr-sm shadow-xl"
                        : "bg-[#161618] border border-white/[0.06] text-[#d4d4d8] rounded-tl-sm shadow-lg"
                      }`}>
                      {m.text}
                      {(isTyping && m.id === chatMessages[chatMessages.length - 1].id && m.role === "assistant") && (
                        <span className="inline-block w-1.5 h-4 bg-[#a1a1aa] animate-pulse ml-1 align-middle"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex items-end gap-3 shrink-0">
                <div className="flex-1">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    rows={1}
                    placeholder="Ask a follow-up question..."
                    className="w-full bg-[#111113] border border-white/[0.06] text-white text-[13px] rounded-lg p-3 outline-none focus:border-white/[0.12] placeholder:text-[#71717a] resize-none transition-colors shadow-elevation-1 font-sans"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                  />
                </div>
                <GlassButton
                  variant="primary"
                  disabled={!chatInput.trim() || isTyping}
                  onClick={sendChat}
                  className="h-[46px] px-4 shrink-0"
                >
                  <Send size={16} />
                </GlassButton>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.06] bg-[#111113] shrink-0 flex justify-between items-center">
          <p className="text-[11px] text-[#71717a] font-medium font-sans">AI responses may be inaccurate. Verify with logs.</p>
          <div className="flex gap-2">
            {!isLoading && !error && !isChatExpanded && (
              <GlassButton
                variant="outline"
                onClick={() => setIsChatExpanded(true)}
                className="h-8 px-3 text-xs"
              >
                <MessageSquare size={12} className="mr-1.5" /> Ask Follow-up
              </GlassButton>
            )}
            <GlassButton
              variant="outline"
              onClick={onClose}
              className="h-8 px-3 text-xs"
            >
              Close
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}