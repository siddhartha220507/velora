import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, ShieldCheck, ArrowDown } from "lucide-react";
import { io as socketIO } from "socket.io-client";
import { getDeployment, SOCKET_ORIGIN } from "../../api/api";

function parseStoredLogLine(line) {
  const str = String(line);
  const errMatch = str.match(/\[ERROR\]/i);
  const warnMatch = str.match(/\[WARN\]/i);
  let type = "info";
  if (errMatch) type = "error";
  else if (warnMatch) type = "warn";
  const timeMatch = str.match(/^\[([^\]]+)\]/);
  const time = timeMatch ? timeMatch[1].slice(11, 19) || timeMatch[1] : new Date().toLocaleTimeString();
  return { type, time, message: str };
}

function normalizeSocketLine(payload) {
  const level = (payload.level || "info").toLowerCase();
  const type =
    level === "error" ? "error" : level === "warn" ? "warn" : "info";
  const ts = payload.timestamp ? new Date(payload.timestamp) : new Date();
  return {
    type,
    time: ts.toLocaleTimeString(),
    message: payload.message || "",
  };
}

let sharedSocket = null;

const getSharedSocket = () => {
  if (!sharedSocket) {
    sharedSocket = socketIO(SOCKET_ORIGIN, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });
  }
  return sharedSocket;
};

export default function TerminalLogs({
  deploymentId,
  onErrorDetect,
  onComplete,
  onStatusChange,
}) {
  const [logs, setLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [loadError, setLoadError] = useState("");
  const messagesEndRef = useRef(null);
  const logsRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const appendAndMaybeSignalError = useCallback(
    (entry) => {
      setLogs((prev) => {
        const next = [...prev, entry];
        const msg = entry.message || "";
        if (
          entry.type === "error" ||
          msg.includes("ERR!") ||
          msg.includes("error") ||
          /\[ERROR\]/i.test(msg)
        ) {
          if (onErrorDetect) onErrorDetect();
        }
        return next;
      });
    },
    [onErrorDetect]
  );

  useEffect(() => {
    if (!deploymentId) return undefined;

    let cancelled = false;

    const socket = getSharedSocket();
    
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join:deployment", deploymentId);

    const handleLogLine = (payload) => {
      appendAndMaybeSignalError(normalizeSocketLine(payload));
    };

    const handleLogComplete = () => {
      setIsStreaming(false);
      if (onComplete) onComplete();
    };

    socket.on("log:line", handleLogLine);
    socket.on("log:complete", handleLogComplete);

    const handleConnectError = () => {};
    socket.on("connect_error", handleConnectError);

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoadError("");
      setLogs([]);
      setIsStreaming(true);
      try {
        const { data } = await getDeployment(deploymentId);
        const doc = data?.data;
        const raw = doc?.logs;
        if (cancelled) return;
        if (Array.isArray(raw) && raw.length > 0) {
          setLogs(raw.map(parseStoredLogLine));
        }
        const st = doc?.status;
        if (st && onStatusChange) onStatusChange(String(st).toLowerCase());
        if (
          st &&
          ["failed", "stopped", "rolling_back"].includes(
            String(st).toLowerCase()
          )
        ) {
          setIsStreaming(false);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e.response?.data?.message || e.message || "Failed to load logs"
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      socket.emit("leave:deployment", deploymentId);
      socket.off("log:line", handleLogLine);
      socket.off("log:complete", handleLogComplete);
      socket.off("connect_error", handleConnectError);
    };
  }, [deploymentId, appendAndMaybeSignalError, onComplete, onStatusChange]);

  const getLogColor = (type) => {
    switch (type) {
      case "error": return "text-[#ef4444]";
      case "warn": return "text-[#eab308]";
      case "success": return "text-[#22c55e]";
      default: return "text-[#a1a1aa]";
    }
  };

  const getLogPrefix = (type) => {
    switch (type) {
      case "error": return "ERR";
      case "warn": return "WRN";
      case "success": return "OK ";
      default: return "LOG";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0d0d0f] rounded-xl overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e20] border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <div className="w-3 h-3 rounded-full bg-[#eab308]" />
            <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
          </div>
          <span className="text-[13px] font-black uppercase tracking-widest text-[#52525b]">
            Build Console
          </span>
        </div>
        <div className="flex items-center gap-3">
          {loadError && (
            <span className="text-[12px] text-[#ef4444] max-w-[200px] truncate">
              {loadError}
            </span>
          )}
          {isStreaming ? (
            <span className="flex items-center gap-1.5 text-[#3b82f6] text-[12px] font-black uppercase tracking-widest">
              <RefreshCw size={12} className="animate-spin" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#22c55e] text-[12px] font-black uppercase tracking-widest">
              <ShieldCheck size={12} /> Finished
            </span>
          )}
        </div>
      </div>

      {/* Log Lines */}
      <div data-lenis-prevent className="flex-1 overflow-y-auto px-2 py-4 min-h-0 bg-black/40" style={{ scrollbarWidth: 'thin' }}>
        {logs.map((log, index) => (
          <div
            key={`${index}-${log.time}`}
            className="flex gap-4 mb-1 py-0.5 px-2 rounded-md hover:bg-white/[0.02] transition-colors group font-mono"
          >
            {/* Line Number */}
            <span className="text-[12px] text-[#3f3f46] min-w-[32px] text-right select-none tabular-nums">
              {index + 1}
            </span>

            {/* Timestamp */}
            <span className="text-[12px] text-[#52525b] min-w-[70px] tabular-nums font-bold">
              {log.time}
            </span>
            
            {/* Type badge */}
            <span className={`text-[12px] min-w-[32px] font-bold ${getLogColor(log.type)}`}>
              {getLogPrefix(log.type)}
            </span>

            {/* Message */}
            <span className={`flex-1 text-[14px] leading-relaxed break-all ${getLogColor(log.type)} ${log.type === 'error' ? 'font-medium text-[#ef4444]' : 'text-[#a1a1aa]'}`}>
              {log.message}
            </span>
          </div>
        ))}

        {isStreaming && (
          <div className="flex gap-4 px-2 py-1 items-center">
            <span className="text-[12px] text-[#3f3f46] min-w-[32px] text-right">{logs.length + 1}</span>
            <span className="text-[12px] text-[#52525b] min-w-[70px] font-bold">--:--:--</span>
            <span className="text-[12px] min-w-[32px] text-[#3b82f6] font-bold">...</span>
            <span className="inline-block w-2 h-3.5 bg-[#3b82f6] animate-pulse rounded-sm"></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer stats */}
      <div className="py-2 px-4 bg-[#1e1e20] border-t border-white/[0.06] flex justify-between items-center shrink-0">
        <span className="text-[12px] text-[#52525b] font-black uppercase tracking-widest">{logs.length} output lines</span>
        <button onClick={scrollToBottom} className="text-[12px] text-[#52525b] hover:text-white flex items-center gap-1.5 transition-colors font-black uppercase tracking-widest">
          <ArrowDown size={12} /> Auto-scroll
        </button>
      </div>
    </div>
  );
}
