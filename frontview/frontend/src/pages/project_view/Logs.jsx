import React, { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import TopNav from "../../components/layout/TopNav";
import PageWrapper from "../../components/layout/PageWrapper";
import { Terminal, RefreshCw, Filter, Search, Download, ChevronDown, Activity, Shield } from 'lucide-react';
import { useSidebar } from "../../hooks/useSidebar";
import { PageShell, PageHeader, Card, TableHead } from "../../components/layout/PageLayout";
import { motion } from "framer-motion";
import GlassButton from "../../components/ui/GlassButton";
import { getProjects, SOCKET_ORIGIN } from "../../api/api";
import io from "socket.io-client";

export default function Logs() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  const [searchParams] = useSearchParams();
  const [projectId, setProjectId] = useState(searchParams.get("projectId") || "");
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = React.useRef(null);
  const logsEndRef = React.useRef(null);

  useEffect(() => {
    fetchProjects();
    return () => {
        if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (projectId) {
        connectSocket(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      const projectData = res.data.data || [];
      setProjects(projectData);
      if (!projectId && projectData.length > 0) {
        setProjectId(projectData[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  const connectSocket = (id) => {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(SOCKET_ORIGIN, {
      transports: ["websocket"],       // Direct WebSocket — HTTP polling skip
      reconnection: true,              // Auto-reconnect enable
      reconnectionAttempts: 10,        // 10 baar try karega
      reconnectionDelay: 2000,         // Har attempt ke beech 2 sec ka gap
    });
    socketRef.current = socket;

    socket.emit('join:project_logs', id);

    socket.on('log:project', (log) => {
      const line = {
        time: new Date(log.timestamp).toLocaleTimeString(),
        status: log.type || 'INFO',
        message: log.message
      };
      setLogs(prev => [...prev.slice(-100), line]);
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-white font-sans">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />
      
      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />
        <div data-lenis-prevent className="flex-1 p-10 lg:p-16 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex items-end justify-between mb-16 pb-12 border-b border-white/[0.04]">
              <div>
                <div className="flex items-center gap-4 mb-4">
                   <span className="px-3 py-1 rounded-lg bg-[#1e1e20] border border-white/[0.04] text-[9px] font-black text-[#52525b] uppercase tracking-[0.3em]">LOG STREAM</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                </div>
                 <h1 className="text-[36px] font-black tracking-tighter uppercase text-white leading-none">Console Logs</h1>
                <p className="text-[10px] text-[#3f3f46] font-black uppercase tracking-[0.4em] mt-5">Monitor your application logs in real-time</p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Project Selector */}
                <div className="relative group">
                  <select 
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="appearance-none h-14 pl-8 pr-16 bg-[#0d0d0f] border border-white/[0.04] rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-white/[0.1] transition-all cursor-pointer shadow-inner"
                  >
                    {projects.map(p => (
                      <option key={p._id} value={p._id} className="bg-[#1e1e20]">{p.name.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#1e1e20] pointer-events-none group-hover:text-[#52525b] transition-colors" />
                </div>

                <GlassButton 
                  variant="secondary" 
                  className="h-14 px-8 text-[10px] font-black uppercase tracking-[0.25em] gap-4"
                  onClick={() => {}}
                >
                   <Download size={18} /> EXPORT LOGS
                </GlassButton>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:w-[480px] group">
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1e1e20] group-focus-within:text-[#52525b] transition-colors" />
                  <input 
                    type="text"                     
                    placeholder="SEARCH LOGS..."
                    className="w-full h-14 pl-16 pr-8 bg-[#0d0d0f] border border-white/[0.04] rounded-[20px] text-[11px] text-white focus:outline-none focus:border-white/[0.1] transition-all placeholder:text-[#1e1e20] font-black uppercase tracking-[0.2em] shadow-inner"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#22c55e]/5 border border-[#22c55e]/10 shadow-elevation-1">
                    <Activity size={14} className="text-[#22c55e] animate-pulse" />
                     <span className="text-[9px] font-black text-[#22c55e] uppercase tracking-[0.3em]">CONNECTED TO LOG SERVER</span>
                  </div>
                  <button className="w-14 h-14 rounded-[20px] bg-[#0d0d0f] border border-white/[0.04] text-[#1e1e20] hover:text-white hover:border-white/[0.08] transition-all shadow-elevation-1 flex items-center justify-center">
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>

              {/* Terminal View */}
              <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[56px] overflow-hidden shadow-elevation-2">
                <div className="bg-[#0d0d0f]/40 px-10 py-8 border-b border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#22c55e] shadow-elevation-1">
                      <Terminal size={22} />
                    </div>
                    <div>
                       <span className="text-[14px] font-black uppercase tracking-tighter text-white block">Application Logs</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#3f3f46]">Source: stdout</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#1e1e20]" />
                    <div className="w-2 h-2 rounded-full bg-[#1e1e20]" />
                    <div className="w-2 h-2 rounded-full bg-[#1e1e20]" />
                  </div>
                </div>
                
                <div className="p-12 min-h-[640px] font-mono text-[12px] leading-relaxed bg-[#0d0d0f]/20">
                  {logs.length === 0 ? (
                    <div className="h-full min-h-[480px] flex flex-col items-center justify-center opacity-[0.03]">
                      <Shield size={96} className="mb-10" />
                       <p className="uppercase tracking-[0.6em] font-black text-lg">AWAITING LOGS</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log, i) => (
                        <div key={i} className="flex gap-10 py-2 hover:bg-white/[0.02] rounded-[12px] px-6 -mx-6 group transition-all">
                          <span className="text-[#1e1e20] shrink-0 w-24 font-black tracking-widest tabular-nums group-hover:text-[#3f3f46] transition-colors">{log.time}</span>
                          <span className={`shrink-0 w-20 font-black tracking-[0.2em] text-[10px] mt-0.5 ${
                            log.status === 'ERROR' ? 'text-[#ef4444]' : 
                            log.status === 'WARN' ? 'text-[#eab308]' : 
                            'text-[#22c55e]'
                          }`}>
                            [{log.status.toUpperCase()}]
                          </span>
                          <span className="text-[#52525b] group-hover:text-[#a1a1aa] transition-colors break-all leading-normal font-medium tracking-tight">
                            {log.message}
                          </span>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}