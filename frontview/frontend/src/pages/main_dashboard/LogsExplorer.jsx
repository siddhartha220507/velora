import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import PageWrapper from "../../components/layout/PageWrapper";
import TopNav from "../../components/layout/TopNav";
import GlassButton from "../../components/ui/GlassButton";
import { PageShell, PageHeader, Card } from "../../components/layout/PageLayout";
import { 
  Search, 
  Terminal as TerminalIcon, 
  Cpu, 
  Box, 
  MessageSquare, 
  ChevronRight, 
  ChevronDown,
  Activity,
  Maximize2,
  Trash2,
  Sparkles,
  Send,
  User,
  Bot,
  Rocket,
  ArrowLeft,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProjects, getDeploymentsByProject, getDeployment, aiChat, triggerDeployment, SOCKET_ORIGIN } from "../../api/api";
import io from "socket.io-client";

export default function LogsExplorer() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [buildLogs, setBuildLogs] = useState([]);
  const [runtimeLogs, setRuntimeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: 'Hello! I am Velora AI. How can I help you debug your logs today?' }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef(null);
  const buildLogsEndRef = useRef(null);
  const runtimeLogsEndRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    fetchProjects();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Auto-select project from URL ?projectId= param
  useEffect(() => {
    if (projects.length === 0) return;
    const params = new URLSearchParams(location.search);
    const pid = params.get('projectId');
    if (pid && !selectedProject) {
      const found = projects.find(p => p._id === pid);
      if (found) handleSelectProject(found);
    }
  }, [projects, location.search]);

  useEffect(() => {
    buildLogsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [buildLogs]);

  useEffect(() => {
    runtimeLogsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [runtimeLogs]);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    setLoading(true);
    try {
      const res = await getDeploymentsByProject(project._id);
      const deps = res.data.data || [];
      setDeployments(deps);
      if (deps.length > 0) {
        handleSelectDeployment(deps[0]);
      }
    } catch (err) {
      console.error("Failed to fetch deployments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDeployment = (deployment) => {
    setSelectedDeployment(deployment);
    setBuildLogs(deployment.buildLogs || []);
    setRuntimeLogs(deployment.runtimeLogs || []);
    
    // Connect to socket for live logs if active (queued/building/running)
    const activeStatuses = ['queued', 'building', 'running'];
    if (activeStatuses.includes(deployment.status?.toLowerCase())) {
      connectSocket(deployment._id);
    } else {
      if (socketRef.current) socketRef.current.disconnect();
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

    socket.emit('join:deployment', id);

    socket.on('log:line', (log) => {
      const line = `[${new Date(log.timestamp).toLocaleTimeString()}] [${log.level.toUpperCase()}] ${log.message}`;
      if (log.logType === 'runtime') {
        setRuntimeLogs(prev => [...prev, line]);
      } else {
        setBuildLogs(prev => [...prev, line]);
      }
    });

    socket.on('deployment:status', (data) => {
      setSelectedDeployment(prev => prev ? { ...prev, status: data.status, url: data.url || prev.url } : null);
      if (data.status === 'running' || data.status === 'failed') {
        setIsDeploying(false);
      }
    });
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const userText = userInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setUserInput("");
    setIsTyping(true);
    
    // Add temporary bot message for streaming
    setChatMessages(prev => [...prev, { role: 'bot', text: "", isStreaming: true }]);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: userText,
          context: [...buildLogs, ...runtimeLogs].slice(-50)
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                setIsTyping(false); // Stop typing when first chunk arrives
                botText += data.text;
                setChatMessages(prev => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (updated[lastIndex] && updated[lastIndex].role === 'bot') {
                    updated[lastIndex] = { ...updated[lastIndex], text: botText, isStreaming: true };
                  }
                  return updated;
                });
              }
            } catch (e) { /* ignore parse errors */ }
          }
        }
      }
      
      // Clear streaming flag
      setChatMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex]) {
          updated[lastIndex].isStreaming = false;
        }
        return updated;
      });
    } catch (err) {
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'bot', text: "Sorry, I encountered an error.", isStreaming: false };
        return updated;
      });
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-white font-sans overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />
      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />
        <div data-lenis-prevent className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-5xl mx-auto p-6 lg:p-10">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/[0.04]">
              <div>
                <h1 className="text-[22px] font-black tracking-tighter text-[#e4e4e7] mb-2 uppercase">Telemetric Streams</h1>
                <p className="text-[9px] text-[#52525b] font-black uppercase tracking-[0.4em] mt-2">Real-time infrastructure observation node</p>
              </div>
              <div className="flex items-center gap-6">
                {!selectedProject && (
                  <div className="relative group">
                    <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#3f3f46] group-focus-within:text-white transition-colors" />
                    <input 
                      type="text" 
                      placeholder="SCAN_NODES..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 w-80 bg-[#1e1e20] border border-white/[0.04] rounded-2xl pl-14 pr-6 text-[11px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-white/10 transition-all shadow-elevation-1 placeholder:text-[#2d2d33]"
                    />
                  </div>
                )}
              </div>
            </div>

            {!selectedProject ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <button 
                    key={project._id}
                    onClick={() => handleSelectProject(project)}
                    className="flex flex-col p-8 bg-[#1e1e20] border border-white/[0.04] rounded-[32px] hover:border-white/[0.1] transition-all group text-left shadow-elevation-1 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/[0.03] transition-colors" />
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center text-[#3f3f46] group-hover:text-white transition-colors shadow-elevation-1">
                        <Box size={20} />
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-[#0d0d0f] border border-white/5 flex items-center justify-center text-[#3f3f46] group-hover:text-white group-hover:translate-x-0.5 transition-all">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                    <h3 className="font-black text-[18px] mb-2 text-white uppercase tracking-tighter group-hover:text-[#22c55e] transition-colors">{project.name}</h3>
                    <p className="text-[9px] text-[#52525b] font-black uppercase tracking-[0.25em]">{project.repoUrl ? project.repoUrl.split('/').pop() : 'INTERNAL_ARCHIVE'}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                 {/* Project Control Bar */}
                 <div className="flex items-center justify-between p-5 bg-[#1e1e20] border border-white/[0.04] rounded-[24px] shadow-elevation-1">
                   <div className="flex items-center gap-5">
                     <button onClick={() => setSelectedProject(null)} className="w-10 h-10 rounded-xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#3f3f46] hover:text-white transition-all shadow-elevation-1 group">
                       <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                     </button>
                     <div>
                       <h3 className="font-black text-[16px] text-white uppercase tracking-tighter leading-tight">{selectedProject.name}</h3>
                       <div className="flex items-center gap-3 mt-1">
                         <div className="w-1 h-1 rounded-full bg-[#3f3f46]" />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#52525b]">Instance: Authority_Node_{selectedDeployment?.version || '0'}</span>
                       </div>
                     </div>
                     <div className="h-10 w-px bg-white/[0.04] mx-4" />
                     <div className="relative group">
                       <select 
                         className="appearance-none bg-[#0d0d0f] border border-white/[0.04] pl-6 pr-12 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-[#52525b] focus:text-white focus:outline-none cursor-pointer transition-colors shadow-inner"
                         value={selectedDeployment?._id}
                         onChange={(e) => handleSelectDeployment(deployments.find(d => d._id === e.target.value))}
                       >
                         {deployments.map(d => (
                           <option key={d._id} value={d._id} className="bg-[#111113]">V{d.version} — {new Date(d.createdAt).toLocaleDateString()}</option>
                         ))}
                       </select>
                       <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3f3f46] pointer-events-none" />
                     </div>
                   </div>
                   <div className="flex items-center gap-5">
                     <StatusBadge status={selectedDeployment?.status} />
                     <GlassButton 
                       variant="primary" 
                       className="h-10 px-5 text-[9px] font-black uppercase tracking-[0.2em] gap-3 shadow-elevation-2"
                       disabled={isDeploying || selectedDeployment?.status === 'building'}
                       onClick={async () => {
                         if (isDeploying || selectedDeployment?.status === 'building') return;
                         setIsDeploying(true);
                         setBuildLogs([]);
                         setRuntimeLogs([]);
                         try {
                           const res = await triggerDeployment(selectedProject._id);
                           if (res.data.success) {
                             const newId = res.data.deploymentId;
                             // Connect socket immediately so we don't miss early logs
                             connectSocket(newId);
                             setSelectedDeployment(prev => prev ? { ...prev, _id: newId, status: 'queued' } : { _id: newId, status: 'queued' });
                             // Also refresh deployment list
                             const listRes = await getDeploymentsByProject(selectedProject._id);
                             const deps = listRes.data.data || [];
                             setDeployments(deps);
                             const fresh = deps.find(d => d._id === newId);
                             if (fresh) setSelectedDeployment(fresh);
                           }
                         } catch (err) { 
                           const msg = err.response?.data?.message || "Deployment sequence failure";
                           alert(msg); 
                           setIsDeploying(false);
                         }
                       }}
                     >
                       <Rocket size={14} className={isDeploying ? "animate-bounce" : ""} /> {isDeploying ? "DEPLOYING..." : "DEPLOY NODE"}
                     </GlassButton>
                   </div>
                 </div>

                {/* Split Logs View */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{minHeight:'460px'}}>
                  {/* Runtime Logs (Left) */}
                  <div className="flex flex-col h-[460px] bg-[#1e1e20] border border-white/[0.04] rounded-[24px] overflow-hidden shadow-elevation-1">
                    <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between bg-[#161618]">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center text-[#3b82f6] shadow-elevation-1">
                          <Activity size={14} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#52525b]">Runtime Telemetry</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {selectedDeployment?.status === 'running' && selectedDeployment?.url && (
                          <a 
                            href={selectedDeployment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[8px] font-black text-[#22c55e] hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2 border-b border-[#22c55e]/20 pb-0.5"
                          >
                            <Globe size={10} /> {selectedDeployment.url.replace('https://', '')}
                          </a>
                        )}
                        <button className="text-[8px] font-black text-[#3f3f46] hover:text-white transition-colors uppercase tracking-[0.2em]" onClick={() => setRuntimeLogs([])}>CLEAR_STREAM</button>
                      </div>
                    </div>
                    <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 font-mono text-[14px] space-y-1.5 bg-[#0d0d0f]/40 shadow-inner overscroll-y-contain" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}>
                      {runtimeLogs.length > 0 ? runtimeLogs.map((log, i) => {
                        const lowerLog = log.toLowerCase();
                        const isWarning = lowerLog.includes('warning') || lowerLog.includes('[warn]');
                        const isError = lowerLog.includes('error') || lowerLog.includes('[err]');
                        const isSuccess = lowerLog.includes('success') || lowerLog.includes('live at') || lowerLog.includes('completed');
                        const isInfo = lowerLog.includes('[info]');
                        const isHttp = lowerLog.includes('[http]') || lowerLog.includes('get ') || lowerLog.includes('post ');
                        
                        let colorClass = 'text-[#3f3f46]';
                        if (isError) colorClass = 'text-[#ef4444] font-bold';
                        else if (isWarning) colorClass = 'text-[#f59e0b] font-bold';
                        else if (isSuccess) colorClass = 'text-[#22c55e] font-bold';
                        else if (isHttp) colorClass = 'text-[#a855f7]';
                        else if (isInfo) colorClass = 'text-[#3b82f6]';

                        return (
                          <div key={i} className="whitespace-pre-wrap leading-relaxed flex gap-6 group">
                            <span className="text-[#1e1e20] select-none min-w-[35px] group-hover:text-[#3f3f46] transition-colors">{String(i + 1).padStart(3, '0')}</span>
                            <span className={`${colorClass} uppercase tracking-tight`}>{log}</span>
                          </div>
                        );
                      }) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                          <Activity size={56} className="mb-6" />
                          <p className="font-black text-[14px] uppercase tracking-widest">Awaiting runtime packet...</p>
                        </div>
                      )}
                      <div ref={runtimeLogsEndRef} />
                    </div>
                  </div>

                  {/* Build Logs (Right) */}
                  <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[24px] overflow-hidden flex flex-col h-[460px] shadow-elevation-1">
                    <div className="px-8 py-6 border-b border-white/[0.04] flex items-center justify-between bg-[#161618]">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-xl bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center text-[#52525b] shadow-elevation-1">
                          <TerminalIcon size={18} />
                        </div>
                        <div>
                          <span className="font-black text-[11px] uppercase tracking-[0.4em] text-[#e4e4e7]">Live_Sequence_Log</span>
                          <span className="text-[8px] text-[#3f3f46] font-black uppercase tracking-[0.25em] mt-1 block">ASSET_NOMINAL_TELEMETRY</span>
                        </div>
                      </div>
                      <button className="text-[8px] font-black text-[#3f3f46] hover:text-white transition-colors uppercase tracking-[0.2em]" onClick={() => setBuildLogs([])}>CLEAR_STREAM</button>
                    </div>
                    <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 font-mono text-[14px] space-y-1.5 bg-[#0d0d0f]/40 shadow-inner overscroll-y-contain" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}>
                      {buildLogs.length > 0 ? buildLogs.map((log, i) => {
                        const lowerLog = log.toLowerCase();
                        const isWarning = lowerLog.includes('warning') || lowerLog.includes('[warn]');
                        const isError = lowerLog.includes('error') || lowerLog.includes('[err]');
                        const isSuccess = lowerLog.includes('success') || lowerLog.includes('completed') || lowerLog.includes('ready');
                        const isInfo = lowerLog.includes('[info]');

                        let colorClass = 'text-[#3f3f46]';
                        if (isError) colorClass = 'text-[#ef4444] font-bold';
                        else if (isWarning) colorClass = 'text-[#f59e0b] font-bold';
                        else if (isSuccess) colorClass = 'text-[#22c55e] font-bold';
                        else if (isInfo) colorClass = 'text-[#3b82f6]';

                        return (
                          <div key={i} className="whitespace-pre-wrap leading-relaxed flex gap-6 group">
                            <span className="text-[#1e1e20] select-none min-w-[35px] group-hover:text-[#3f3f46] transition-colors">{String(i + 1).padStart(3, '0')}</span>
                            <span className={`${colorClass} uppercase tracking-tight`}>{log}</span>
                          </div>
                        );
                      }) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                          <TerminalIcon size={56} className="mb-6" />
                          <p className="font-black text-[14px] uppercase tracking-widest">Awaiting build packet...</p>
                        </div>
                      )}
                      <div ref={buildLogsEndRef} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>

      {/* AI Chat Widget */}
      <div className="fixed bottom-8 right-6 z-[100]">
        <AnimatePresence>
          {showAIChat && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-20 right-0 w-[340px] h-[480px] bg-[#1e1e20] border border-white/[0.04] rounded-[32px] shadow-elevation-2 overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-white/[0.04] bg-[#161618] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-elevation-2">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-[#e4e4e7] uppercase tracking-tighter">Velora Analyst</h4>
                    <p className="text-[8px] text-[#22c55e] font-black uppercase tracking-[0.2em] mt-0.5">Neural Log Processor</p>
                  </div>
                </div>
                <button onClick={() => setShowAIChat(false)} className="w-9 h-9 rounded-xl bg-[#0d0d0f] border border-white/5 flex items-center justify-center text-[#3f3f46] hover:text-white transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
              
              <div data-lenis-prevent className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide bg-[#0d0d0f]/20">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] px-4 py-3 rounded-[16px] text-[11px] leading-relaxed relative font-medium shadow-elevation-1 ${
                      msg.role === 'user' 
                        ? 'bg-white text-black font-black uppercase tracking-tight' 
                        : 'bg-[#161618] border border-white/[0.04] text-[#a1a1aa] shadow-inner'
                    }`}>
                      {msg.text}
                      {msg.isStreaming && <span className="inline-block w-1 h-3.5 bg-[#22c55e] ml-1 animate-pulse align-middle" />}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#161618] border border-white/[0.04] px-4 py-3 rounded-[16px] flex items-center gap-3 shadow-inner">
                      <div className="flex gap-1.5">
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                      </div>
                      <span className="text-[9px] text-[#52525b] font-black uppercase tracking-widest">Processing...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-white/[0.04] bg-[#161618]">
                <div className="relative">
                  <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="QUERY NEURAL ENGINE..."
                    className="w-full h-11 bg-[#0d0d0f] border border-white/[0.04] rounded-xl pl-5 pr-12 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-white/10 transition-all shadow-inner placeholder:text-[#2d2d33]"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isTyping || !userInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-elevation-1"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setShowAIChat(!showAIChat)}
          className={`w-13 h-13 rounded-full flex items-center justify-center shadow-elevation-2 transition-all hover:scale-110 active:scale-95 z-[101] ${
            showAIChat ? 'bg-white text-black' : 'bg-[#1e1e20] border border-white/[0.08] text-white'
          }`}
          style={{width:'52px', height:'52px'}}
        >
          {showAIChat ? <X size={22} /> : <MessageSquare size={22} />}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    running: "bg-[#22c55e]/5 border-[#22c55e]/10 text-[#22c55e]",
    building: "bg-[#eab308]/5 border-[#eab308]/10 text-[#eab308]",
    failed: "bg-[#ef4444]/5 border-[#ef4444]/10 text-[#ef4444]",
    stopped: "bg-[#3f3f46]/5 border-white/5 text-[#3f3f46]",
  };
  
  return (
    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-elevation-1 ${styles[status?.toLowerCase()] || styles.stopped}`}>
      {status || 'UNKNOWN_STATE'}
    </span>
  );
}

function X({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
