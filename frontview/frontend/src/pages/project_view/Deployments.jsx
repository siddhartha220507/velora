import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import PageWrapper from "../../components/layout/PageWrapper";
import TopNav from "../../components/layout/TopNav";
import { 
  Rocket, History, PlayCircle, Plus, GitBranch, Globe, 
  ArrowUpRight, Activity, AlertCircle, Check, Box, X, Loader2
} from "lucide-react";
import DeployRow from "../../components/project/DeployRow";
import GlassButton from "../../components/ui/GlassButton";
import { PageShell, PageHeader, Card, Badge, EmptyState, AlertBanner } from "../../components/layout/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  listDeployments, triggerDeployment, getProject, getProjects, 
  getDeploymentsByProject, rollbackDeployment as apiRollback 
} from "../../api/api";
import { mapBackendStatusToUi, formatTimeAgo } from "../../utils/deploymentUi";

// Force-refreshing module for deployment history integration

export default function DeploymentsPage() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, [refreshKey]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-white font-sans">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />
      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />
        <div className="flex-1 p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex items-end justify-between mb-16 pb-12 border-b border-white/[0.04]">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#1e1e20] border border-white/[0.04] text-[8px] font-black text-[#52525b] uppercase tracking-[0.3em]">DEPLOYMENTS</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                </div>
                <h1 className="text-[22px] font-black tracking-tighter uppercase text-[#e4e4e7] leading-none">Deployment History</h1>
                <p className="text-[8px] text-[#3f3f46] font-black uppercase tracking-[0.4em] mt-3">View and manage all your project deployments</p>
             </div>
              <GlassButton 
                variant="primary" 
                className="h-12 px-8 gap-4 text-[9px] font-black uppercase tracking-[0.25em] shadow-elevation-2"
                onClick={() => navigate("/projects/new")}
              >
                <Plus size={16} /> DEPLOY PROJECT
              </GlassButton>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-[340px] bg-[#1e1e20] border border-white/[0.04] rounded-[24px] animate-pulse" />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[56px] p-24 text-center shadow-elevation-1">
                <div className="w-20 h-20 rounded-3xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center mx-auto mb-10 shadow-elevation-2">
                  <Rocket size={32} className="text-[#1e1e20]" />
                </div>
                <h3 className="text-[20px] font-black text-white uppercase tracking-tighter mb-4">NO DEPLOYMENTS</h3>
                <p className="text-[11px] text-[#3f3f46] font-black uppercase tracking-[0.3em] mb-12 max-w-[320px] mx-auto leading-relaxed">No deployment history found. Deploy your first project to see logs here.</p>
                <GlassButton 
                  variant="primary" 
                  className="h-14 px-12 text-[10px] font-black uppercase tracking-[0.3em]"
                  onClick={() => navigate("/projects/new")}
                >
                  CREATE PROJECT
                </GlassButton>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {projects.map((project, idx) => (
                  <ProjectPreviewCard key={project._id} project={project} index={idx} onRefresh={() => setRefreshKey(k => k + 1)} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

function ProjectPreviewCard({ project, index, onRefresh }) {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);

  const dep = project.latestDeployment;
  const status = dep?.status || 'idle';

  useEffect(() => {
    if (showHistory) fetchHistory();
  }, [showHistory]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
        const res = await getDeploymentsByProject(project._id);
        setHistory(res.data.data || []);
    } catch (err) {
        console.error("Failed history fetch", err);
    } finally {
        setHistoryLoading(false);
    }
  };

  const handleRollback = async (version) => {
    if (!window.confirm(`Are you sure you want to rollback to version ${version}?`)) return;
    setIsRollingBack(true);
    try {
        await apiRollback(project._id, version);
        setShowHistory(false);
        onRefresh();
        navigate(`/deploy?projectId=${project._id}`);
    } catch (err) {
        console.error("Rollback failed", err);
    } finally {
        setIsRollingBack(false);
    }
  };
  
  const getStatusColor = () => {
    switch(status.toLowerCase()) {
      case 'running': return '#22c55e';
      case 'failed': return '#ef4444';
      case 'building': return '#eab308';
      default: return '#52525b';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative flex flex-col bg-[#1e1e20] border border-white/[0.04] rounded-[24px] overflow-hidden hover:border-white/[0.08] transition-all shadow-elevation-1 hover:shadow-elevation-2"
   >
      {/* Preview Area */}
      <div className="h-36 relative bg-[#0d0d0f] overflow-hidden border-b border-white/[0.04]">
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, ${getStatusColor()} 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />

        <div className="absolute inset-0 flex items-center justify-center">
          {status === 'building' ? (
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-white/[0.02] border-t-[#eab308] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity size={24} className="text-[#eab308]" />
                </div>
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#eab308] animate-pulse">BUILDING PROJECT...</p>
            </div>
          ) : status === 'failed' ? (
            <div className="flex flex-col items-center gap-4 text-center px-10">
              <div className="w-16 h-16 rounded-[24px] bg-[#ef4444]/5 border border-[#ef4444]/10 flex items-center justify-center text-[#ef4444] shadow-elevation-1">
                <AlertCircle size={28} />
              </div>
              <p className="text-[14px] font-black text-[#ef4444] uppercase tracking-widest">DEPLOYMENT FAILED</p>
              <p className="text-[10px] text-[#ef4444]/40 font-black uppercase tracking-widest truncate max-w-full">{dep.errorMessage || 'Unknown Error'}</p>
            </div>
          ) : status === 'running' && dep.url ? (
            <div className="w-full h-full relative group/preview transition-all duration-700">
              <div className="absolute inset-0 pointer-events-none overflow-hidden bg-white">
                <iframe 
                  key={dep._id}
                  src={`${dep.url}?t=${new Date(dep.createdAt).getTime()}`}
                  className="w-[1200px] h-[800px] border-0 origin-top-left"
                  style={{ 
                    transform: 'scale(0.333)',
                    opacity: 0.95
                  }}
                  title={`Preview for ${project.name}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-transparent to-transparent opacity-80" />
              </div>

              {/* Central Badge Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0f]/60 backdrop-blur-[2px] opacity-0 group-hover/preview:opacity-100 transition-all duration-500">
                <div className="w-20 h-20 rounded-[32px] bg-white/[0.02] border border-white/10 flex items-center justify-center relative shadow-elevation-2">
                  <Globe size={32} className="text-white" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#22c55e] border-[6px] border-[#0d0d0f] shadow-elevation-1 flex items-center justify-center">
                    <Check size={14} className="text-white" strokeWidth={4} />
                  </div>
                </div>
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">STABLE</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#52525b]">V{dep.version} • {dep.branch}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
              <div className="w-16 h-16 rounded-[24px] bg-[#1e1e20] border border-white/[0.04] flex items-center justify-center mb-6">
                <Box size={32} className="text-[#3f3f46]" />
              </div>
              <p className="text-[10px] font-black text-[#3f3f46] uppercase tracking-[0.4em]">
                {status === 'running' ? "APP RUNNING" : "NO RECORD"}
              </p>
            </div>
          )}
        </div>

        {/* Status Overlay */}
        <div className="absolute top-6 left-6">
          <div className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] border backdrop-blur-xl shadow-elevation-1 flex items-center gap-3 ${
            status === 'running' ? 'bg-[#22c55e]/5 border-[#22c55e]/10 text-[#22c55e]' :
            status === 'building' ? 'bg-[#eab308]/5 border-[#eab308]/10 text-[#eab308]' :
            status === 'failed' ? 'bg-[#ef4444]/5 border-[#ef4444]/10 text-[#ef4444]' :
            'bg-[#1e1e20]/80 border-white/[0.04] text-[#52525b]'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              status === 'running' ? 'bg-[#22c55e] animate-pulse' :
              status === 'building' ? 'bg-[#eab308] animate-pulse' :
              status === 'failed' ? 'bg-[#ef4444]' :
              'bg-[#3f3f46]'
            }`} />
            {status}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col gap-4 bg-[#1e1e20]">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-black text-[13px] text-[#e4e4e7] uppercase tracking-tighter group-hover:text-[#22c55e] transition-colors leading-none mb-1.5">{project.name}</h3>
            <div className="flex items-center gap-2">
              <GitBranch size={10} className="text-[#3f3f46]" />
              <p className="text-[8px] text-[#52525b] font-black uppercase tracking-widest">{project.branch || 'main'}</p>
            </div>
          </div>
         <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowHistory(true)}
                className="w-9 h-9 rounded-xl bg-[#0d0d0f] border border-white/[0.04] text-[#3f3f46] hover:text-white hover:border-white/[0.08] transition-all flex items-center justify-center"
            >
                <History size={16} />
            </button>
            <button 
                onClick={() => navigate(`/deployment-progress/${project._id}`)}
                className="w-9 h-9 rounded-xl bg-[#0d0d0f] border border-white/[0.04] text-[#3f3f46] hover:text-white hover:border-white/[0.08] transition-all flex items-center justify-center"
            >
                <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-white/[0.04]" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1e1e20]" />
            <p className="text-[10px] text-[#52525b] font-black uppercase tracking-widest">LAST UPDATED {dep ? formatTimeAgo(dep.createdAt).toUpperCase() : 'NEVER'}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {status === 'running' && dep.url && (
              <GlassButton 
                variant="primary"
                className="h-8 px-4 text-[8px] font-black uppercase tracking-widest gap-1.5"
                onClick={() => window.open(dep.url, '_blank')}
              >
                ACCESS <Globe size={11} />
              </GlassButton>
            )}
            <button 
              onClick={() => navigate(`/deployment-progress/${project._id}`)}
              className="h-8 px-4 rounded-xl bg-[#0d0d0f] border border-white/[0.04] text-[8px] font-black uppercase tracking-widest text-[#52525b] hover:text-white transition-all"
            >
              VIEW STATS
            </button>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0d0d0f]/90 backdrop-blur-xl px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xl bg-[#1e1e20] border border-white/[0.04] rounded-[32px] overflow-hidden shadow-elevation-2"
            >
              <div className="px-12 py-10 border-b border-white/[0.04] flex items-center justify-between bg-[#161618]">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#52525b] shadow-elevation-1">
                        <History size={24} />
                    </div>
                    <div>
                        <h2 className="text-[18px] font-black text-white uppercase tracking-tighter mb-1">VERSION HISTORY</h2>
                        <p className="text-[10px] text-[#3f3f46] font-black uppercase tracking-[0.3em]">{project.name}</p>
                    </div>
                </div>
                <button onClick={() => setShowHistory(false)} className="w-12 h-12 rounded-2xl bg-[#0d0d0f] border border-white/[0.04] text-[#3f3f46] hover:text-white transition-all flex items-center justify-center">
                    <X size={20} />
                </button>
              </div>

              <div 
                data-lenis-prevent
                className="p-4 max-h-[480px] overflow-y-auto scrollbar-hide bg-[#0d0d0f]/40"
              >
                {historyLoading ? (
                    <div className="p-20 flex justify-center"><Loader2 size={32} className="animate-spin text-[#1e1e20]" /></div>
                ) : history.length === 0 ? (
                    <div className="p-32 text-center text-[#1e1e20] font-black uppercase text-[12px] tracking-[0.5em]">NO VERSIONS FOUND</div>
                ) : (
                    <div className="space-y-2">
                        {history.map((h) => (
                            <div key={h._id} className="flex items-center justify-between px-10 py-6 rounded-[32px] hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/[0.04] group">
                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="text-[10px] font-black text-[#1e1e20] group-hover:text-[#3f3f46] transition-colors">V{h.version}</span>
                                        <div className={`w-2 h-2 rounded-full ${h.status === 'running' ? 'bg-[#22c55e]' : (h.status === 'failed' ? 'bg-[#ef4444]' : 'bg-[#eab308]')}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-[14px] font-black text-white uppercase tracking-tight">{h.status}</p>
                                            {h.version === dep?.version && (
                                                <span className="px-3 py-1 rounded-lg bg-[#22c55e]/5 border border-[#22c55e]/10 text-[9px] font-black text-[#22c55e] uppercase tracking-[0.2em]">ACTIVE</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-[#3f3f46] font-black uppercase tracking-[0.2em] mt-2 group-hover:text-[#52525b] transition-colors">{h.branch} • {formatTimeAgo(h.createdAt).toUpperCase()}</p>
                                    </div>
                                </div>
                                
                                {h.version !== dep?.version && (
                                    <button 
                                        onClick={() => handleRollback(h.version)}
                                        disabled={isRollingBack}
                                        className="h-10 px-6 rounded-xl bg-[#0d0d0f] border border-white/[0.04] text-[9px] font-black text-[#52525b] hover:text-white hover:border-white/[0.1] transition-all flex items-center gap-3 uppercase tracking-widest shadow-elevation-1"
                                    >
                                        {isRollingBack ? '...' : 'ROLLBACK'} <PlayCircle size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
              </div>

              <div className="px-12 py-8 bg-[#161618] border-t border-white/[0.04] flex items-center gap-4">
                <AlertCircle size={16} className="text-[#eab308]" />
                <p className="text-[10px] text-[#3f3f46] font-black uppercase tracking-[0.2em] leading-relaxed">Note: Restore will generate a new deployment (V{history[0]?.version + 1 || '?'}) from the selected version.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
