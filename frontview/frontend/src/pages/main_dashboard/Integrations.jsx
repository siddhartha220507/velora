import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import PageWrapper from "../../components/layout/PageWrapper";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import TopNav from "../../components/layout/TopNav";
import GlassButton from "../../components/ui/GlassButton";
import { PageShell, PageHeader, Card } from "../../components/layout/PageLayout";
import { Database, MessageSquare, Zap, HardDrive, CheckCircle2, ArrowRight, Settings2, Trash2, X, Plug } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getIntegrations, connectIntegration, disconnectIntegration, getUserProjects } from "../../api/api";

export default function Integrations() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("projectId");

  const [loading, setLoading] = useState(true);
  const [activeIntegrations, setActiveIntegrations] = useState([]);
  const [modalConfig, setModalConfig] = useState(null); // { provider, name, inputLabel, type }
  const [configValue, setConfigValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const integrationOptions = [
    {
      id: "mongodb",
      name: "MongoDB Atlas",
      description: "Auto-provision a cloud database and inject MONGO_URI into your active projects.",
      icon: Database,
      accent: "#47A248",
      type: "Database",
      inputLabel: "Connection String (URI)",
      placeholder: "mongodb+srv://user:pass@cluster.mongodb.net/db",
      engineType: "database"
    },
    {
      id: "redis",
      name: "Upstash Redis",
      description: "Serverless Redis caching. Injects REDIS_URL directly into your build environment.",
      icon: HardDrive,
      accent: "#FF4438",
      type: "Cache",
      inputLabel: "Redis URI",
      placeholder: "redis://default:pass@endpoint.upstash.io:6379",
      engineType: "database"
    },
    {
      id: "slack",
      name: "Slack Alerts",
      description: "Send deployment success/failure notifications to your team channel.",
      icon: MessageSquare,
      accent: "#E01E5A",
      type: "Notifications",
      inputLabel: "Incoming Webhook URL",
      placeholder: "https://hooks.slack.com/services/...",
      engineType: "notification"
    },
    {
      id: "discord",
      name: "Discord Webhooks",
      description: "Stream live build logs and deployment status directly to Discord.",
      icon: Zap,
      accent: "#5865F2",
      type: "Notifications",
      inputLabel: "Discord Webhook URL",
      placeholder: "https://discord.com/api/webhooks/...",
      engineType: "notification"
    },
  ];

  useEffect(() => {
    if (projectId) {
      fetchIntegrations();
    } else {
      setLoading(false);
    }
  }, [projectId]);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await getIntegrations(projectId);
      setActiveIntegrations(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch integrations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (option) => {
    // If already connected, pre-fill config if possible (optional)
    const existing = activeIntegrations.find(i => i.provider === option.id);
    if (existing) {
      // In a real app, you might want to show masked value or allow editing
      const config = Object.fromEntries(existing.config);
      setConfigValue(config.uri || config.webhookUrl || "");
    } else {
      setConfigValue("");
    }
    setModalConfig(option);
  };

  const handleSaveIntegration = async () => {
    if (!configValue) return showToast("Please enter a value", "error");
    
    setIsSubmitting(true);
    try {
      const config = {};
      if (modalConfig.engineType === 'database') config.uri = configValue;
      else config.webhookUrl = configValue;

      await connectIntegration(projectId, {
        provider: modalConfig.id,
        type: modalConfig.engineType,
        config
      });

      showToast(`${modalConfig.name} connected successfully!`);
      setModalConfig(null);
      fetchIntegrations();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to connect", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIntegration = async (integrationId) => {
    if (!window.confirm("Are you sure you want to disconnect this integration?")) return;
    
    try {
      await disconnectIntegration(projectId, integrationId);
      showToast("Integration disconnected");
      fetchIntegrations();
    } catch (err) {
      showToast("Failed to disconnect", "error");
    }
  };

  const [userProjects, setUserProjects] = useState([]);

  useEffect(() => {
    if (!projectId) {
      const fetchProjects = async () => {
        try {
          const res = await getUserProjects();
          setUserProjects(res.data.data || []);
        } catch (e) { console.error(e); }
      };
      fetchProjects();
    }
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-main)] text-white">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
        <Dock navMode={navMode} toggleNavMode={toggleNavMode} />
        <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
          <TopNav />
          <div className="flex-1 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto pt-20">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-[40px] bg-[#1e1e20] border border-white/[0.04] flex items-center justify-center mb-12 shadow-elevation-2 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors" />
                  <Plug className="text-[#3f3f46] group-hover:text-white transition-colors" size={36} />
                </div>
                <h2 className="text-[40px] font-black text-white mb-4 uppercase tracking-tighter leading-none">Integrations</h2>
                <p className="text-[#52525b] text-[11px] font-black uppercase tracking-[0.4em] max-w-lg mb-20">
                  Choose a project to manage its connected services and tools.
                </p>
                
                <div className="w-full max-w-xl grid gap-5">
                  {userProjects.length > 0 ? userProjects.map(p => (
                    <button 
                      key={p._id}
                      onClick={() => window.location.href = `/integrations?projectId=${p._id}`}
                      className="w-full flex items-center justify-between p-8 bg-[#1e1e20] hover:bg-white/[0.01] border border-white/[0.04] rounded-[32px] transition-all group shadow-elevation-1"
                    >
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[24px] bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#3f3f46] group-hover:text-white transition-colors shadow-elevation-1">
                          <HardDrive size={24} />
                        </div>
                        <div className="text-left">
                          <span className="text-[18px] font-black text-white uppercase tracking-tighter block group-hover:text-[#22c55e] transition-colors">{p.name}</span>
                          <span className="text-[10px] text-[#3f3f46] font-black uppercase tracking-[0.2em] mt-1.5 block">Active Project</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#3f3f46] group-hover:text-white group-hover:translate-x-1 transition-all">
                         <ArrowRight size={22} />
                      </div>
                    </button>
                  )) : (
                    <div className="p-20 bg-[#1e1e20] border border-dashed border-white/[0.08] rounded-[48px] text-[#3f3f46] text-[12px] font-black uppercase tracking-[0.3em]">
                      No active nodes detected in the local registry.
                    </div>
                  )}
                </div>

                <div className="mt-20">
                  <GlassButton variant="secondary" onClick={() => window.location.href = '/dashboard'} className="h-14 px-10 text-[11px] font-black uppercase tracking-[0.25em] border-white/5">
                    BACK_TO_DASHBOARD
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        </PageWrapper>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-white font-sans">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />
      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />
        <div className="flex-1 p-8 lg:p-16">
          <div className="max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/[0.04]">
              <div>
                <h1 className="text-[32px] font-black tracking-tighter text-white mb-2 uppercase">Connected Services</h1>
                <p className="text-[11px] text-[#52525b] font-black uppercase tracking-[0.3em]">Enhance your project with databases, notifications, and more.</p>
              </div>
              <GlassButton 
                variant="secondary" 
                className="h-12 px-8 text-[10px] font-black uppercase tracking-[0.2em] border-white/5"
                onClick={() => window.location.href = '/integrations'}
              >
                SWITCH_PROJECT
              </GlassButton>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-[280px] bg-[#1e1e20] border border-white/[0.04] rounded-[48px] animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {integrationOptions.map((app, i) => {
                  const active = activeIntegrations.find(integ => integ.provider === app.id);
                  const isConnected = !!active;

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <div className="flex flex-col h-full group bg-[#1e1e20] border border-white/[0.04] rounded-[48px] shadow-elevation-1 overflow-hidden transition-all hover:border-white/[0.1]">
                        <div className="p-8 flex-1">
                          <div className="flex items-start justify-between gap-6 mb-8">
                            <div className="flex items-center gap-6">
                              <div
                                className="w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-elevation-1 border border-white/[0.04] bg-[#0d0d0f]"
                              >
                                <app.icon size={28} style={{ color: app.accent }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div>
                                <h3 className="text-[18px] font-black text-white uppercase tracking-tighter leading-tight group-hover:text-[#22c55e] transition-colors">{app.name}</h3>
                                <span className="text-[10px] font-black text-[#52525b] uppercase tracking-[0.2em] mt-1.5 block">
                                  {app.type.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                            {isConnected && (
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl text-[9px] font-black text-[#22c55e] bg-[#22c55e]/5 border border-[#22c55e]/10 uppercase tracking-widest shadow-elevation-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" /> ACTIVE
                                </span>
                                <button 
                                  onClick={() => handleDeleteIntegration(active._id)}
                                  className="w-10 h-10 rounded-xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#3f3f46] hover:text-[#ef4444] transition-all"
                                  title="Terminate Link"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>

                          <p className="text-[13px] text-[#52525b] font-medium leading-relaxed max-w-[90%]">
                            {app.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between px-8 py-4 border-t border-white/[0.04] bg-[#161618]/50">
                          <div className="flex items-center gap-3 text-[9px] font-black text-[#3f3f46] uppercase tracking-[0.25em]">
                            <Zap size={14} className={isConnected ? "text-[#22c55e]" : ""} />
                            {app.engineType === 'database' ? "CONNECTED" : "READY"}
                          </div>
                          <GlassButton
                            variant={isConnected ? "secondary" : "primary"}
                            onClick={() => handleOpenModal(app)}
                            className="h-11 px-6 text-[10px] font-black uppercase tracking-[0.2em] gap-3"
                          >
                            {isConnected ? (
                              <><Settings2 size={16} /> CONFIGURE</>
                            ) : (
                              <>CONNECT <ArrowRight size={16} /></>
                            )}
                          </GlassButton>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PageWrapper>

      {/* Connection Modal */}
      <AnimatePresence>
        {modalConfig && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#050505]/90 backdrop-blur-xl px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="w-full max-w-xl bg-[#161618] border border-white/[0.04] rounded-[56px] p-12 shadow-elevation-2 relative overflow-hidden"
            >
              <div 
                className="absolute -top-32 -right-32 w-64 h-64 blur-[120px] opacity-[0.03]"
                style={{ background: modalConfig.accent }}
              />

              <button 
                onClick={() => setModalConfig(null)}
                className="absolute top-10 right-10 w-12 h-12 rounded-2xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#3f3f46] hover:text-white transition-all shadow-elevation-1"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-6 mb-12">
                <div
                  className="w-20 h-20 rounded-[32px] flex items-center justify-center shrink-0 shadow-elevation-1 border border-white/[0.04] bg-[#0d0d0f]"
                >
                  <modalConfig.icon size={36} style={{ color: modalConfig.accent }} />
                </div>
                <div>
                  <h2 className="text-[28px] font-black text-white uppercase tracking-tighter leading-tight">Link {modalConfig.name}</h2>
                  <p className="text-[10px] text-[#52525b] font-black uppercase tracking-[0.25em] mt-2">Project Integration Sync</p>
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <label className="block text-[9px] font-black text-[#3f3f46] uppercase tracking-[0.35em] mb-5">
                    {modalConfig.inputLabel}
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={configValue}
                      onChange={(e) => setConfigValue(e.target.value)}
                      placeholder={modalConfig.placeholder}
                      className="w-full h-16 bg-[#0d0d0f] border border-white/[0.04] focus:border-white/10 rounded-2xl px-8 text-[13px] transition-all focus:outline-none font-mono text-white shadow-inner placeholder:text-[#2d2d33]"
                    />
                  </div>
                  <p className="text-[11px] text-[#3f3f46] mt-6 font-black uppercase tracking-widest leading-relaxed opacity-50">
                    This identifier will be isolated and {modalConfig.engineType === 'database' ? 'injected as an encrypted parameter' : 'used to bridge deployment event notifications'}.
                  </p>
                </div>

                <div className="flex gap-5">
                  <button
                    onClick={() => setModalConfig(null)}
                    className="flex-1 h-14 rounded-2xl bg-[#0d0d0f] border border-white/[0.04] text-white/40 text-[10px] font-black uppercase tracking-[0.25em] hover:text-white transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSaveIntegration}
                    disabled={isSubmitting}
                    className="flex-1 h-14 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.25em] hover:bg-white/90 transition-all shadow-elevation-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "SYNCING..." : "CONFIRM"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className={`px-10 py-5 rounded-2xl border backdrop-blur-3xl shadow-elevation-2 flex items-center gap-5 ${
              toast.type === "error" 
                ? "bg-[#ef4444]/5 border-[#ef4444]/10 text-[#ef4444]" 
                : "bg-[#22c55e]/5 border-[#22c55e]/10 text-[#22c55e]"
            }`}>
              {toast.type === "error" ? <X size={20} /> : <CheckCircle2 size={20} />}
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}