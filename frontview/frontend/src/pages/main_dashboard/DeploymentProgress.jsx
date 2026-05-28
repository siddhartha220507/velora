import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Terminal as TerminalIcon,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Send,
  AlertCircle,
  ArrowLeft,
  Activity,
  Globe,
  GitBranch,
  ExternalLink,
  X
} from "lucide-react";
import { getProjectById, getDeploymentsByProject, getDeployment, SOCKET_ORIGIN, triggerDeployment, getUserRepos } from "../../api/api";
import io from "socket.io-client";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import PageWrapper from "../../components/layout/PageWrapper";
import TopNav from "../../components/layout/TopNav";
import { useSidebar } from "../../hooks/useSidebar";

const STAGES = [
  { id: 'initializing', label: 'Initializing', description: 'Preparing build environment' },
  { id: 'cloning', label: 'Cloning Repository', description: 'Fetching source code from GitHub' },
  { id: 'building', label: 'Building Image', description: 'Optimizing assets and compiling' },
  { id: 'deploying', label: 'Pushing to Edge', description: 'Global distribution in progress' },
  { id: 'live', label: 'Go Live', description: 'Application is accessible' }
];

export default function DeploymentProgress() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  
  const [project, setProject] = useState(null);
  const [deployment, setDeployment] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [status, setStatus] = useState('building');
  const [liveUrl, setLiveUrl] = useState(null);
  const [latestCommit, setLatestCommit] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: 'Hello! I am Velora AI. I can help you analyze these logs if something goes wrong.' }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    fetchProjectData();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [projectId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);



  const handleRedeploy = async () => {
    setIsDeploying(true);
    setLogs([]);
    setStatus('building');
    setCurrentStage(0);
    setLiveUrl(null); 
    setImageLoaded(false); // Reset image state for new deployment
    try {
      const res = await triggerDeployment(project._id);
      if (res.data.success) {
        const dRes = await getDeploymentsByProject(project._id);
        const newDep = dRes.data.data?.[0];
        if (newDep) {
          connectSocket(newDep._id);
          setDeployment(newDep);
          if (newDep.url) setLiveUrl(newDep.url);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Deploy failed");
      setIsDeploying(false);
    }
  };

  const fetchProjectData = async () => {
    try {
      const pRes = await getProjectById(projectId);
      const proj = pRes.data.data;
      setProject(proj);

      // Latest commit from repo
      if (proj?.repoUrl) {
        try {
          const repoPath = proj.repoUrl.replace('https://github.com/', '').replace('.git', '');
          const commitRes = await fetch(`https://api.github.com/repos/${repoPath}/commits?per_page=1`);
          if (commitRes.ok) {
            const commits = await commitRes.json();
            if (commits[0]) setLatestCommit(commits[0]);
          }
        } catch (_) {}
      }
      
      const dRes = await getDeploymentsByProject(projectId);
      const latest = dRes.data.data[0];
      if (latest) {
        setDeployment(latest);
        setStatus(latest.status);
        setLogs(latest.buildLogs || []);
        if (latest.url) setLiveUrl(latest.url);
        
        if (latest.status === 'successful' || latest.status === 'running') setCurrentStage(4);
        else if (latest.status === 'failed') setCurrentStage(currentStage);
        
        if (['building', 'pending', 'queued'].includes(latest.status)) {
          connectSocket(latest._id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch project data", err);
    }
  };

  const connectSocket = (id) => {
    if (socketRef.current) {
      if (socketRef.current.deploymentId === id) return;
      socketRef.current.disconnect();
    }
    const socket = io(SOCKET_ORIGIN, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;
    socketRef.current.deploymentId = id; // Store ID to prevent loops

    socket.emit('join:deployment', id);

    socket.on('log:line', (log) => {
      const line = `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`;
      setLogs(prev => [...prev, line]);
      
      const msg = log.message.toLowerCase();
      // Heuristic stage detection from logs
      if (msg.includes('cloning') || msg.includes('repository cloned')) setCurrentStage(1);
      if (msg.includes('building') || msg.includes('npm install') || msg.includes('analyzing')) setCurrentStage(2);
      if (msg.includes('starting app') || msg.includes('start command') || msg.includes('pushing')) setCurrentStage(3);
      if (msg.includes('deployment live') || msg.includes('live at')) setCurrentStage(4);
    });

    socket.on('deployment:status', (data) => {
      console.log("📡 Deployment Status Update:", data);
      const s = data.status?.toLowerCase();
      if (s === 'running') {
        setCurrentStage(4);
        setStatus('running');
        setIsDeploying(false);
        if (data.url) setLiveUrl(data.url);
      } else if (s === 'successful') {
        setCurrentStage(4);
        setStatus('running');
        setIsDeploying(false);
        if (data.url) setLiveUrl(data.url);
      } else if (s === 'failed') {
        setStatus('failed');
        setIsDeploying(false);
      } else if (s === 'building') {
        setCurrentStage(2);
        setStatus('building');
      } else if (s === 'stopped') {
        setStatus('stopped');
        setIsDeploying(false);
      }
    });

    socket.on('deployment:screenshot', (data) => {
      console.log("📸 Deployment Screenshot Update:", data);
      if (data.screenshotUrl) {
        setImageLoaded(false); // Reset so img re-renders with new src
        setDeployment(prev => ({ ...prev, screenshotUrl: data.screenshotUrl }));
      }
    });
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const userText = userInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setUserInput("");
    setIsTyping(true);
    
    // Placeholder message for streaming
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
          context: logs.slice(-50)
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
                botText += data.text;
                setChatMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.isStreaming) {
                    updated[updated.length - 1] = { role: 'bot', text: botText, isStreaming: true };
                  }
                  return updated;
                });
              }
            } catch (e) { /* partial JSON skip */ }
          }
        }
      }
      
      // Finalize streaming
      setChatMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.isStreaming) {
          updated[updated.length - 1].isStreaming = false;
        }
        return updated;
      });

    } catch (err) {
      setChatMessages(prev => [...prev.slice(0, -1), { role: 'bot', text: "I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-white font-sans overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />
      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />
        <div className="flex-1 p-3 lg:p-4 overflow-hidden flex flex-col">
          <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.04] shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-8 h-8 rounded-lg bg-[#1e1e20] border border-white/[0.04] flex items-center justify-center hover:bg-[#161618] transition-all group shrink-0"
                >
                  <ArrowLeft size={14} className="text-[#3f3f46] group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className="px-2 py-0.5 rounded bg-[#0d0d0f] border border-white/[0.04] text-[7px] font-black text-[#52525b] uppercase tracking-[0.3em]">NODE_SEQUENCE</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  </div>
                  <h1 className="text-[15px] font-black tracking-tighter uppercase text-[#e4e4e7] leading-none">{project?.name || "INITIALIZING_NODE"}</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Redeploy Button — One click to trigger latest */}
                <button
                  disabled={isDeploying}
                  onClick={handleRedeploy}
                  className="flex items-center gap-2 h-8 px-3 rounded-lg bg-[#1e1e20] border border-white/[0.06] hover:border-white/[0.12] transition-all group disabled:opacity-50"
                >
                  {isDeploying ? (
                    <Loader2 size={11} className="text-[#22c55e] animate-spin" />
                  ) : (
                    <Rocket size={11} className="text-[#52525b] group-hover:text-white transition-colors" />
                  )}
                  <div className="text-left">
                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#52525b] group-hover:text-white transition-colors">
                      {isDeploying ? 'Deploying...' : 'Redeploy'}
                    </div>
                    {latestCommit && !isDeploying && (
                      <div className="text-[7px] text-[#3f3f46] font-mono truncate max-w-[120px]">
                        {latestCommit.sha?.slice(0,7)} · {latestCommit.commit?.message?.slice(0,18)}
                      </div>
                    )}
                  </div>
                </button>

                {/* LIVE button — opens URL in new tab */}
                {(status === 'running') && (
                  <button
                    onClick={() => window.open(liveUrl, '_blank')}
                    className="flex items-center gap-2 h-8 px-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 hover:bg-[#22c55e]/20 transition-all group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#22c55e]">Live</span>
                    <ExternalLink size={10} className="text-[#22c55e]" />
                  </button>
                )}

                {/* Status badge */}
                <div className={`h-8 px-3 rounded-lg border flex items-center font-black text-[8px] uppercase tracking-[0.2em] ${
                  status === 'running' ? 'bg-[#22c55e]/5 border-[#22c55e]/10 text-[#22c55e]' :
                  status === 'failed' ? 'bg-[#ef4444]/5 border-[#ef4444]/10 text-[#ef4444]' :
                  status === 'stopped' ? 'bg-[#52525b]/10 border-[#52525b]/20 text-[#52525b]' :
                  'bg-[#1e1e20] border-white/[0.04] text-[#52525b]'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                    status === 'running' ? 'bg-[#22c55e]' :
                    status === 'failed' ? 'bg-[#ef4444]' :
                    'bg-[#52525b] animate-pulse'
                  }`} />
                  {status === 'running' ? 'NOMINAL' : status === 'failed' ? 'FAULT' : status === 'stopped' ? 'STOPPED' : 'SYNCING'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
              {/* Left Panel — Site Preview Card */}
              <div className="flex flex-col gap-3 min-h-0">
                <div className="bg-[#1e1e20] border border-white/[0.04] rounded-2xl overflow-hidden shadow-elevation-1 flex flex-col flex-1">
                  
                  {/* Preview Area — clickable, opens live URL */}
                  <div
                    className={`relative bg-[#0d0d0f] flex-1 min-h-0 overflow-hidden ${liveUrl ? 'cursor-pointer' : ''}`}
                    onClick={() => liveUrl && window.open(liveUrl, '_blank')}
                  >
                    {deployment?.screenshotUrl ? (
                      <>
                        {/* Loader while image is fetching */}
                        {!imageLoaded && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0d0d0f] z-10">
                            <Loader2 size={16} className="text-[#52525b] animate-spin" />
                            <p className="text-[7px] font-black uppercase tracking-widest text-[#3f3f46]">Generating Preview...</p>
                          </div>
                        )}
                        <img
                          src={deployment?.screenshotUrl ? `${deployment.screenshotUrl}?t=${Date.now()}` : `https://api.microlink.io/?url=${encodeURIComponent(liveUrl)}&screenshot=true&meta=false&embed=screenshot.url`}
                          alt="Site preview"
                          className={`w-full h-full object-cover object-top transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                          onLoad={() => setImageLoaded(true)}
                          onError={(e) => {
                            // Prevent infinite error loop
                            if (e.target.dataset.fallbackTried) {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                                setImageLoaded(true);
                                return;
                            }
                            e.target.dataset.fallbackTried = 'true';
                            // If cloudinary fails, fall back to microlink
                            e.target.src = `https://api.microlink.io/?url=${encodeURIComponent(liveUrl)}&screenshot=true&meta=false&embed=screenshot.url`;
                          }}
                        />
                        {/* Fallback if both fail */}
                        <div className="hidden w-full h-full flex-col items-center justify-center gap-3 opacity-40">
                          <Globe size={28} />
                          <p className="text-[9px] font-black uppercase tracking-widest">Preview unavailable</p>
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20">
                            <ExternalLink size={13} className="text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Visit Site</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
                        {(status === 'building' || isDeploying) ? (
                          <>
                            <div className="relative">
                              <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center">
                                <Loader2 size={20} className="text-[#22c55e] animate-spin" />
                              </div>
                              <div className="absolute inset-0 rounded-2xl border border-[#22c55e]/20 animate-ping" />
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#52525b]">Building...</p>
                              <p className="text-[8px] text-[#3f3f46] mt-1">{STAGES[currentStage]?.label}</p>
                            </div>
                          </>
                        ) : (
                          <div className="text-center opacity-20">
                            <Globe size={32} className="mx-auto mb-3" />
                            <p className="text-[9px] font-black uppercase tracking-widest">No preview yet</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status overlay badge */}
                    <div className="absolute top-2 left-2 pointer-events-none">
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest backdrop-blur-sm ${
                        status === 'running' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30' :
                        status === 'failed' ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30' :
                        'bg-black/40 text-[#52525b] border border-white/10'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          status === 'running' ? 'bg-[#22c55e] animate-pulse' :
                          status === 'failed' ? 'bg-[#ef4444]' :
                          'bg-[#52525b] animate-pulse'
                        }`} />
                        {status === 'running' ? 'Live' : status === 'failed' ? 'Failed' : status === 'stopped' ? 'Stopped' : 'Building'}
                        </div>
                      </div>
                    </div>

                  {/* Card Footer — URL + info */}
                  <div className="p-3 border-t border-white/[0.04] bg-[#161618] shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#e4e4e7] truncate flex-1 mr-2">{project?.name}</span>
                      {liveUrl && (
                        <button
                          onClick={() => window.open(liveUrl, '_blank')}
                          className="flex items-center gap-1 text-[#22c55e] hover:text-white transition-colors shrink-0"
                        >
                          <Globe size={10} />
                          <span className="text-[8px] font-black uppercase tracking-widest">Open</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[8px] font-mono text-[#3f3f46] truncate">
                      {liveUrl || project?.repoUrl || 'Awaiting deployment...'}
                    </p>
                    {latestCommit && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.04]">
                        <div className="w-4 h-4 rounded bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center overflow-hidden shrink-0">
                          <img src={`https://github.com/${project?.repoUrl?.split('/')[3]}.png?size=32`} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[8px] font-mono text-[#3f3f46] truncate">
                            <span className="text-[#22c55e]">{latestCommit.sha?.slice(0,7)}</span> · {latestCommit.commit?.message?.slice(0,28)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {status === 'failed' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#ef4444]/5 border border-[#ef4444]/10 rounded-xl p-3 shadow-elevation-1 shrink-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#ef4444]">
                        <AlertCircle size={12} />
                        <span className="font-black text-[9px] uppercase tracking-widest">Build Failed</span>
                      </div>
                      <button 
                        onClick={() => setShowAIChat(true)}
                        className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-[#ef4444] text-white font-black text-[8px] uppercase tracking-[0.2em] hover:bg-[#ef4444]/90 transition-all"
                      >
                        <Sparkles size={10} /> AI Help
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Logs View */}
              <div className="lg:col-span-2 flex flex-col min-h-0">
                <div className="bg-[#1e1e20] border border-white/[0.04] rounded-2xl overflow-hidden flex flex-col h-full shadow-elevation-2">
                  <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between bg-[#161618] shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center text-[#52525b]">
                        <TerminalIcon size={14} />
                      </div>
                      <div>
                        <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white">Stream_Log</span>
                        <span className="text-[8px] text-[#3f3f46] font-black uppercase tracking-[0.2em] mt-0.5 block">LIVE TELEMETRY</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d0d0f] border border-white/[0.04]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                      <span className="text-[8px] font-black text-[#52525b] uppercase tracking-[0.2em]">LIVE</span>
                    </div>
                  </div>
                  
                  <div 
                    data-lenis-prevent
                    className="flex-1 overflow-y-auto p-4 font-mono text-[14px] leading-relaxed space-y-1.5 bg-[#0d0d0f]/60 overscroll-y-contain"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}
                  >
                    {logs.length > 0 ? logs.map((log, i) => {
                      const lowerLog = log.toLowerCase();
                      const isWarning = lowerLog.includes('warning') || lowerLog.includes('[warn]');
                      const isError = lowerLog.includes('error') || lowerLog.includes('[err]');
                      const isSuccess = lowerLog.includes('success') || lowerLog.includes('completed') || lowerLog.includes('live at');
                      const isHttp = lowerLog.includes('[http]') || lowerLog.includes('get ') || lowerLog.includes('post ');

                      let colorClass = 'text-[#3f3f46]';
                      if (isError) colorClass = 'text-[#ef4444]';
                      else if (isWarning) colorClass = 'text-[#f59e0b]';
                      else if (isSuccess) colorClass = 'text-[#22c55e]';
                      else if (isHttp) colorClass = 'text-[#a855f7]';

                      return (
                        <div key={i} className="flex gap-4 group">
                          <span className="text-[#2a2a2e] select-none min-w-[35px] group-hover:text-[#3f3f46] transition-colors text-[14px]">{String(i + 1).padStart(3, '0')}</span>
                          <span className={`whitespace-pre-wrap ${colorClass} transition-colors tracking-tight font-medium break-all text-[14px]`}>{log}</span>
                        </div>
                      );
                    }) : (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                        <Activity size={40} className="mb-4" />
                        <p className="font-black text-[11px] uppercase tracking-[0.4em]">AWAITING LOGS...</p>
                      </div>
                    )}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* AI Chat Widget */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <AnimatePresence>
          {showAIChat && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-16 right-0 w-[340px] h-[420px] bg-[#1e1e20] border border-white/[0.04] rounded-2xl shadow-elevation-2 overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-white/[0.04] bg-[#161618] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center">
                    <Sparkles size={15} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-tighter">Velora AI</h4>
                    <p className="text-[8px] text-[#22c55e] font-black uppercase tracking-[0.2em]">Log Analyst</p>
                  </div>
                </div>
                <button onClick={() => setShowAIChat(false)} className="w-7 h-7 rounded-lg bg-[#0d0d0f] border border-white/5 flex items-center justify-center text-[#3f3f46] hover:text-white transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
              
              <div 
                data-lenis-prevent
                className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide bg-[#0d0d0f]/20"
              >
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] px-3 py-2 rounded-xl text-[11px] leading-relaxed shadow-elevation-1 ${
                      msg.role === 'user' 
                        ? 'bg-white text-black font-black uppercase tracking-tight' 
                        : 'bg-[#161618] border border-white/[0.04] text-[#a1a1aa]'
                    }`}>
                      {msg.text}
                      {msg.isStreaming && <span className="inline-block w-1 h-3 bg-[#22c55e] ml-1 animate-pulse align-middle" />}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#161618] border border-white/[0.04] px-3 py-2 rounded-xl flex items-center gap-2">
                      <div className="flex gap-1">
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                      </div>
                      <span className="text-[9px] text-[#52525b] font-black uppercase tracking-widest">Processing...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-white/[0.04] bg-[#161618] shrink-0">
                <div className="relative">
                  <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about logs..."
                    className="w-full h-9 bg-[#0d0d0f] border border-white/[0.04] rounded-xl pl-4 pr-10 text-[10px] text-white focus:outline-none focus:border-white/10 transition-all shadow-inner placeholder:text-[#3f3f46]"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isTyping || !userInput.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                  >
                    <Send size={11} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setShowAIChat(!showAIChat)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-elevation-2 transition-all hover:scale-105 active:scale-95 z-[101] ${
            showAIChat ? 'bg-white text-black' : 'bg-[#1e1e20] border border-white/[0.08] text-white'
          }`}
        >
          {showAIChat ? <ArrowLeft size={18} /> : <Sparkles size={18} />}
        </button>
      </div>
    </div>
  );
}
