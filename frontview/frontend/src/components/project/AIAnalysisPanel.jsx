import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import GlassButton from "../ui/GlassButton";
import { buildApiUrl } from "../../api/api";

const MODEL_OPTIONS = [
  { value: "mistral", label: "Mistral", hint: "Balanced for debugging" },
  { value: "cohere", label: "Cohere", hint: "Structured explanations" },
  { value: "gemini", label: "Gemini", hint: "Broad reasoning" },
];

const QUICK_PROMPTS = [
  "Summarize the deployment failure in simple words.",
  "List the exact steps I should try next.",
  "Point out environment variable issues in these logs.",
  "Explain whether this is a build error or a runtime error.",
];

function extractSseText(buffer, onText) {
  const segments = buffer.split("\n\n");
  const incomplete = segments.pop() || "";

  for (const segment of segments) {
    const line = segment
      .split("\n")
      .find((entry) => entry.startsWith("data: "));

    if (!line) continue;
    const dataStr = line.slice(6);

    if (dataStr === "[DONE]") {
      onText(null, true);
      continue;
    }

    try {
      const parsed = JSON.parse(dataStr);
      onText(parsed.text || "", false);
    } catch (error) {
      // Ignore partial event chunks.
    }
  }

  return incomplete;
}

async function streamAnalysis({ deploymentId, provider, question, onChunk }) {
  const response = await fetch(buildApiUrl(`/deployments/${deploymentId}/analyze/stream`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ provider, question }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Unable to start AI analysis.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let done = false;
  let buffer = "";

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;

    if (!value) continue;
    buffer += decoder.decode(value, { stream: true });
    buffer = extractSseText(buffer, onChunk);
  }

  if (buffer.trim()) {
    extractSseText(`${buffer}\n\n`, onChunk);
  }
}

function ModelPill({ option, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(option.value)}
      className={`rounded-xl border px-3 py-2 text-left transition-all ${
        selected
          ? "border-[#22c55e]/40 bg-[#22c55e]/10 text-white shadow-[0_0_0_1px_rgba(34,197,94,0.15)]"
          : "border-white/[0.08] bg-white/[0.02] text-[#a1a1aa] hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <div className="text-[12px] font-semibold">{option.label}</div>
      <div className="mt-0.5 text-[11px] text-[#71717a]">{option.hint}</div>
    </button>
  );
}

function PanelSection({ icon: Icon, title, subtitle, children, actions, className = "" }) {
  return (
    <section className={`rounded-2xl border border-white/[0.08] bg-[#101114] shadow-elevation-1 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#22c55e]">
            <Icon size={16} />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-white">{title}</h3>
            {subtitle ? <p className="mt-0.5 text-[12px] text-[#71717a]">{subtitle}</p> : null}
          </div>
        </div>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function AIAnalysisPanel({
  deploymentId,
  isOpen,
  onClose,
}) {
  const [provider, setProvider] = useState("mistral");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const [analysisText, setAnalysisText] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState("");
  const analysisScrollRef = useRef(null);
  const chatScrollRef = useRef(null);

  const selectedModel = useMemo(
    () => MODEL_OPTIONS.find((option) => option.value === provider) || MODEL_OPTIONS[0],
    [provider]
  );

  useEffect(() => {
    if (!analysisScrollRef.current) return;
    analysisScrollRef.current.scrollTop = analysisScrollRef.current.scrollHeight;
  }, [analysisText, isStreaming]);

  useEffect(() => {
    if (!chatScrollRef.current) return;
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages, isStreaming]);

  const runAnalysis = async (question = "") => {
    if (!deploymentId) return;

    const isFollowUp = Boolean(question.trim());
    setError("");
    setIsLoading(!isFollowUp);
    setIsStreaming(true);
    setActiveQuestion(question);

    if (!isFollowUp) {
      setAnalysisText("");
      setChatMessages([]);
    } else {
      const userMessageId = `${Date.now()}-user`;
      const assistantMessageId = `${Date.now()}-assistant`;
      setChatMessages((prev) => [
        ...prev,
        { id: userMessageId, role: "user", text: question },
        { id: assistantMessageId, role: "assistant", text: "" },
      ]);

      try {
        await streamAnalysis({
          deploymentId,
          provider,
          question,
          onChunk: (text, finished) => {
            if (finished) {
              setIsStreaming(false);
              return;
            }

            if (!text) return;
            setChatMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessageId
                  ? { ...message, text: message.text + text }
                  : message
              )
            );
          },
        });
      } catch (streamError) {
        setError(streamError.message || "Failed to continue the AI conversation.");
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }

      return;
    }

    try {
      await streamAnalysis({
        deploymentId,
        provider,
        question: "",
        onChunk: (text, finished) => {
          if (finished) {
            setIsStreaming(false);
            return;
          }

          if (!text) return;
          setAnalysisText((prev) => prev + text);
        },
      });
    } catch (streamError) {
      setError(streamError.message || "Failed to analyze deployment logs.");
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !deploymentId) return;
    void runAnalysis();
  }, [isOpen, deploymentId, provider]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative z-10 flex h-full w-full items-center justify-center p-0 md:p-4 lg:p-5">
        <div className="flex h-full w-full flex-col overflow-hidden border border-white/[0.08] bg-[#070809] text-white shadow-2xl md:h-[min(88vh,900px)] md:max-w-[1320px] md:rounded-[28px]">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] bg-[#0d0f10] px-5 py-4 md:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-[#22c55e]">
                <BrainCircuit size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-[15px] font-semibold tracking-tight text-white">
                  AI Deployment Analysis
                </h2>
                <p className="mt-0.5 text-[12px] text-[#71717a]">
                  Analyze logs, compare models, and continue the debugging conversation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GlassButton
                variant="outline"
                onClick={() => void runAnalysis(activeQuestion)}
                disabled={isStreaming}
                className="hidden sm:inline-flex h-9 px-3 text-xs"
              >
                {isStreaming ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                Re-run
              </GlassButton>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#71717a] transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto bg-[#070809] p-4 md:p-5" style={{ scrollbarWidth: "thin" }}>
            <div className="grid min-h-full grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)_380px]">
            <div className="space-y-4 2xl:sticky 2xl:top-0">
              <PanelSection
                icon={Cpu}
                title="Model Selection"
                subtitle="Switch providers anytime and rerun the analysis with the same logs."
              >
                <div className="grid gap-2">
                  {MODEL_OPTIONS.map((option) => (
                    <ModelPill
                      key={option.value}
                      option={option}
                      selected={option.value === provider}
                      onClick={setProvider}
                    />
                  ))}
                </div>
              </PanelSection>

              <PanelSection
                icon={Wand2}
                title="Quick Prompts"
                subtitle="Start follow-up questions without typing from scratch."
              >
                <div className="space-y-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setChatInput(prompt);
                        void runAnalysis(prompt);
                      }}
                      className="flex w-full items-start gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-3 text-left text-[12px] text-[#d4d4d8] transition-colors hover:border-white/[0.14] hover:bg-white/[0.04]"
                    >
                      <ChevronRight size={14} className="mt-0.5 shrink-0 text-[#22c55e]" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              </PanelSection>

              <PanelSection
                icon={selectedModel.value === "mistral" ? CheckCircle2 : AlertCircle}
                title="Current Session"
                subtitle="This panel follows the dashboard theme and keeps the selected model active."
              >
                <div className="space-y-3 text-[12px] text-[#a1a1aa]">
                  <div className="rounded-xl border border-white/[0.08] bg-[#0b0c0f] px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#52525b]">Active Model</p>
                    <p className="mt-1 text-[14px] font-semibold text-white">{selectedModel.label}</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-[#0b0c0f] px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#52525b]">Deployment</p>
                    <p className="mt-1 break-all font-mono text-[11.5px] text-[#d4d4d8]">{deploymentId}</p>
                  </div>
                </div>
              </PanelSection>
            </div>

            <PanelSection
              icon={Sparkles}
              title="Analysis Output"
              subtitle="Streaming explanation generated from the deployment logs."
              actions={
                <span className="rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-2.5 py-1 text-[11px] font-semibold text-[#86efac]">
                  {selectedModel.label}
                </span>
              }
            >
              <div
                ref={analysisScrollRef}
                className="h-[320px] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0b0c0f] px-4 py-4 font-mono text-[13px] leading-7 text-[#d4d4d8] lg:h-[420px] 2xl:h-[calc(min(88vh,900px)-210px)]"
                style={{ scrollbarWidth: "thin" }}
              >
                {isLoading ? (
                  <div className="flex h-full min-h-[240px] items-center justify-center gap-3 text-[#71717a]">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Analyzing deployment logs with {selectedModel.label}...</span>
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-4 text-[#fca5a5]">
                    {error}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">
                    {analysisText || "Waiting for AI output..."}
                    {isStreaming && (
                      <span className="ml-1 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-[#22c55e] align-middle" />
                    )}
                  </div>
                )}
              </div>
            </PanelSection>

            <PanelSection
              icon={MessageSquare}
              title="Ask Follow-up"
              subtitle="Continue the conversation with the same deployment context."
              className="xl:col-span-2 2xl:col-span-1"
            >
              <div className="flex h-[360px] flex-col lg:h-[420px] 2xl:h-[calc(min(88vh,900px)-210px)]">
                <div
                  ref={chatScrollRef}
                  className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0b0c0f] px-4 py-4"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {chatMessages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-5 text-[12px] text-[#71717a]">
                      Start with one of the quick prompts, or ask your own question about the failure, environment, build step, or runtime.
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[90%] rounded-2xl px-4 py-3 text-[12.5px] leading-6 whitespace-pre-wrap ${
                            message.role === "user"
                              ? "rounded-tr-sm border border-[#22c55e]/20 bg-[#22c55e]/10 text-white"
                              : "rounded-tl-sm border border-white/[0.08] bg-[#111317] text-[#d4d4d8]"
                          }`}
                        >
                          {message.text || (isStreaming ? "Thinking..." : "")}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 flex items-end gap-3">
                  <textarea
                    rows={2}
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        const nextQuestion = chatInput.trim();
                        if (!nextQuestion || isStreaming) return;
                        setChatInput("");
                        void runAnalysis(nextQuestion);
                      }
                    }}
                    placeholder="Ask what failed, what to change, or how to fix the deployment..."
                    className="min-h-[88px] flex-1 resize-none rounded-2xl border border-white/[0.08] bg-[#0b0c0f] px-4 py-3 text-[13px] text-white outline-none transition-colors placeholder:text-[#52525b] focus:border-[#22c55e]/30"
                  />
                  <GlassButton
                    variant="primary"
                    disabled={!chatInput.trim() || isStreaming}
                    onClick={() => {
                      const nextQuestion = chatInput.trim();
                      if (!nextQuestion) return;
                      setChatInput("");
                      void runAnalysis(nextQuestion);
                    }}
                    className="h-12 px-4 shrink-0"
                  >
                    {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </GlassButton>
                </div>
              </div>
            </PanelSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
