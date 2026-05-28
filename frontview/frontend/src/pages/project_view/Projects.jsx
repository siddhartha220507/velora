import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import PageWrapper from "../../components/layout/PageWrapper";
import TopNav from "../../components/layout/TopNav";
import { PageShell, PageHeader, Card, EmptyState } from "../../components/layout/PageLayout";
import {
  Search, Plus, Globe, GitBranch, Terminal, Layers,
  Settings, Clock, Rocket, RotateCcw, History as HistoryIcon,
  CheckCircle2, AlertCircle, Loader2, ArrowLeft,
  Monitor, LayoutGrid, List
} from "lucide-react";
import { getProjects, getDeploymentsByProject, rollbackDeployment } from "../../api/api";
import GlassButton from "../../components/ui/GlassButton";
import StatusBadge from "../../components/ui/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { getFrameworkIcon } from "../../utils/frameworkIcons";

export default function Projects() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [rollingBack, setRollingBack] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // 'grid' or 'list'

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (projectId) => {
    setLoadingVersions(true);
    try {
      const { data } = await getDeploymentsByProject(projectId);
      setVersions(data?.data || []);
    } catch (err) {
      console.error("Fetch versions error:", err);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    fetchVersions(project._id);
  };

  const handleRollback = async (version) => {
    if (!window.confirm(`Are you sure you want to rollback to version ${version}?`)) return;

    setRollingBack(version);
    try {
      await rollbackDeployment(selectedProject._id, version);
      alert("Rollback triggered successfully! Check logs for progress.");
      fetchVersions(selectedProject._id);
    } catch (err) {
      console.error("Rollback error:", err);
      alert("Rollback failed. Please try again.");
    } finally {
      setRollingBack(null);
    }
  };

  const filtered = useMemo(() =>
    projects.filter((p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [projects, searchQuery]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-white font-sans">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />

      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />

        <div className="flex-1">
          <div className="p-6 lg:p-8 max-w-[1300px] mx-auto">

            <AnimatePresence mode="wait">
              {!selectedProject ? (
                /* ─── PROJECTS LIST VIEW ─── */
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/[0.04]">
                    <div>
                      <h1 className="text-[32px] font-black tracking-tighter text-white mb-2 uppercase">Management</h1>
                      <p className="text-[14px] text-[#52525b] font-black uppercase tracking-[0.2em]">Monitor and manage your applications</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex bg-[#0d0d0f] p-1 rounded-2xl border border-white/5 mr-4 shadow-elevation-1">
                        <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#1e1e20] text-white shadow-xl' : 'text-[#3f3f46]'}`}><List size={18} /></button>
                        <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#1e1e20] text-white shadow-xl' : 'text-[#3f3f46]'}`}><LayoutGrid size={18} /></button>
                      </div>
                      <GlassButton variant="primary" onClick={() => navigate("/projects/new")} className="h-12 px-6 text-[11px] font-black uppercase tracking-widest">
                        <Plus size={16} /> New Project
                      </GlassButton>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-8 max-w-md">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b]" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-12 pl-12 pr-6 bg-[#0d0d0f] border border-white/[0.04] rounded-2xl text-[14px] focus:outline-none focus:border-white/10 transition-all font-bold placeholder:text-[#3f3f46] shadow-elevation-1"
                    />
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 gap-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/[0.02] animate-pulse rounded-[24px]" />)}
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="py-32 text-center bg-[#1e1e20] border border-dashed border-white/10 rounded-[32px]">
                      <Rocket size={40} className="mx-auto text-[#3f3f46] mb-6" />
                      <h3 className="text-xl font-bold mb-2">No projects found</h3>
                      <p className="text-[#52525b] mb-8">Launch your first application to see it here.</p>
                      <GlassButton variant="primary" onClick={() => navigate("/projects/new")}>Create Project</GlassButton>
                    </div>
                  ) : (
                    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                      {filtered.map((project) => (
                        <motion.div
                          key={project._id}
                          onClick={() => handleProjectClick(project)}
                          className={`
                               bg-[#1e1e20] border border-white/[0.04] rounded-[24px] hover:border-white/[0.12] hover:bg-[#242427] cursor-pointer transition-all group shadow-elevation-1
                               ${viewMode === 'list' ? 'flex items-center p-6' : 'p-8'}
                             `}
                        >
                          <div className={`flex items-center gap-6 ${viewMode === 'list' ? 'flex-1' : 'flex-col items-start mb-8'}`}>
                            <div className="w-16 h-16 rounded-[20px] bg-[#0d0d0f] border border-white/5 flex items-center justify-center relative shadow-2xl transition-transform group-hover:scale-105">
                              {(() => {
                                const { Icon: FrameworkIcon } = getFrameworkIcon(project.framework || 'other');
                                return <FrameworkIcon size={32} className="text-[#a1a1aa] group-hover:text-white transition-colors" />;
                              })()}
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#1e1e20] bg-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-[20px] font-black text-white mb-1.5 truncate uppercase tracking-tighter">{project.name}</h3>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-2 text-[12px] text-[#52525b] font-black uppercase tracking-widest"><GitBranch size={12} /> {project.branch || 'main'}</span>
                                <span className="w-1 h-1 rounded-full bg-[#3f3f46]" />
                                <span className="text-[12px] text-[#52525b] font-black uppercase tracking-widest">{project.framework}</span>
                              </div>
                            </div>
                          </div>

                          {viewMode === 'list' && (
                            <div className="flex items-center gap-12">
                              <div className="hidden lg:block text-right">
                                <p className="text-[10px] font-black text-[#3f3f46] uppercase tracking-[0.2em] mb-1">Last Update</p>
                                <p className="text-[13px] font-black text-[#52525b] uppercase">{new Date(project.updatedAt).toLocaleDateString()}</p>
                              </div>
                              <div className="hidden md:block">
                                <StatusBadge status={project.lastDeploymentStatus || "RUNNING"} />
                              </div>
                              <button className="w-14 h-14 rounded-2xl bg-[#0d0d0f] border border-white/5 flex items-center justify-center text-[#3f3f46] group-hover:bg-white group-hover:text-black transition-all shadow-elevation-1">
                                <HistoryIcon size={20} />
                              </button>
                            </div>
                          )}

                          {viewMode === 'grid' && (
                            <div className="mt-auto flex items-center justify-between w-full pt-8 border-t border-white/[0.04]">
                              <StatusBadge status={project.lastDeploymentStatus || "RUNNING"} />
                              <button className="text-[10px] font-black text-white uppercase tracking-[0.2em] hover:text-[var(--accent-primary)] transition-colors flex items-center gap-2">
                                Inspect <RotateCcw size={12} />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                /* ─── PROJECT VERSION HISTORY ─── */
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6 group">
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="w-10 h-10 rounded-xl bg-[#0d0d0f] border border-white/5 flex items-center justify-center text-[#3f3f46] hover:text-white hover:border-white/10 transition-all shadow-elevation-1"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-1">
                        <h2 className="text-[24px] font-black text-white tracking-tighter uppercase">{selectedProject.name}</h2>
                        <StatusBadge status={selectedProject.lastDeploymentStatus || "RUNNING"} />
                      </div>
                      <p className="text-[10px] text-[#52525b] font-black uppercase tracking-[0.25em]">Version Control & Deployment History</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-8">
                      <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[32px] overflow-hidden shadow-elevation-2">
                        <div className="px-8 py-6 border-b border-white/[0.04] flex items-center justify-between bg-[#161618]">
                          <h3 className="text-[12px] font-black text-[#52525b] uppercase tracking-[0.25em]">Deployment History</h3>
                          <div className="flex items-center gap-3 text-[11px] text-[#3f3f46] font-black uppercase tracking-widest">
                            <HistoryIcon size={14} /> {versions.length} Versions Found
                          </div>
                        </div>

                        <div data-lenis-prevent className="divide-y divide-white/[0.02] max-h-[520px] overflow-y-auto scrollbar-hide">
                          {loadingVersions ? (
                            <div className="p-20 flex flex-col items-center justify-center text-[#52525b]">
                              <Loader2 className="animate-spin mb-4" size={32} />
                              <p className="font-bold uppercase tracking-widest text-[12px]">Fetching Build History...</p>
                            </div>
                          ) : versions.length === 0 ? (
                            <div className="p-20 text-center text-[#52525b]">No historical deployments found.</div>
                          ) : (
                            versions.map((v, i) => (
                              <div key={v._id} className="px-8 py-6 flex items-center justify-between group hover:bg-white/[0.01] transition-all">
                                <div className="flex items-center gap-6">
                                  <div className="w-10 h-10 rounded-xl bg-[#0d0d0d] border border-white/5 flex items-center justify-center text-white/50 font-mono text-[14px]">
                                    {versions.length - i}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3 mb-1">
                                      <p className="text-[16px] font-bold text-white">Build #{v.version || '1.0.0'}</p>
                                      {i === 0 && <span className="px-2 py-0.5 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-[10px] font-black uppercase tracking-widest">Active</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-[12px] text-[#8e8e93]">
                                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(v.createdAt).toLocaleString()}</span>
                                      <span className="w-1 h-1 rounded-full bg-[#3f3f46]" />
                                      <span className="flex items-center gap-1 font-mono"><GitBranch size={12} /> {v.commitId?.slice(0, 7) || 'HEAD'}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${v.status === 'success' || v.status === 'successful' || v.status === 'running' ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20' : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'}`}>
                                    <div className={`w-1 h-1 rounded-full ${v.status === 'success' || v.status === 'successful' || v.status === 'running' ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
                                    {v.status === 'success' || v.status === 'successful' || v.status === 'running' ? 'RUNNING' : 'FAILED'}
                                  </div>

                                  {i > 0 && v.status === 'success' && (
                                    <button
                                      disabled={rollingBack === v.version}
                                      onClick={() => handleRollback(v.version)}
                                      className="h-10 px-4 rounded-xl bg-[var(--accent-primary)] text-black font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                                    >
                                      {rollingBack === v.version ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                                      One-Click Rollback
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 space-y-6">
                      <div className="bg-[#1e1e20] border border-white/[0.04] p-8 rounded-[32px] bg-gradient-to-br from-[#1e1e20] to-[#161618] shadow-elevation-1">
                        <h3 className="text-[11px] font-black text-[#52525b] uppercase tracking-[0.25em] mb-6">Process Control</h3>
                        <div className="grid gap-3">
                          <button 
                            disabled={loadingVersions}
                            onClick={() => navigate(`/deployment-progress/${selectedProject._id}`)}
                            className="w-full h-12 rounded-xl bg-[#0d0d0f] border border-white/5 flex items-center gap-4 px-6 text-[11px] font-black uppercase tracking-widest text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-all shadow-elevation-1"
                          >
                            <Rocket size={16} className="text-[#52525b]" /> Redeploy Latest
                          </button>
                          <button 
                            disabled={loadingVersions || versions.length < 2}
                            onClick={() => {
                                // Find first successful deployment that is NOT the active one (index 0)
                                const prevStable = versions.slice(1).find(v => v.status === 'success' || v.status === 'successful' || v.status === 'running');
                                if (prevStable) handleRollback(prevStable.version);
                                else alert("No stable previous version found to rollback to.");
                            }}
                            className="w-full h-12 rounded-xl bg-[#0d0d0f] border border-white/5 flex items-center gap-4 px-6 text-[11px] font-black uppercase tracking-widest text-[#a1a1aa] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-all shadow-elevation-1 group"
                          >
                            <RotateCcw size={16} className="text-[#52525b] group-hover:text-[#ef4444]" /> Rollback Version
                          </button>
                          <button 
                            onClick={() => {
                                const activeDep = versions.find((v, i) => i === 0);
                                if (activeDep?.url) window.open(activeDep.url, '_blank');
                                else if (selectedProject.url) window.open(selectedProject.url, '_blank');
                                else alert("Project not live yet");
                            }}
                            className="w-full h-12 rounded-xl bg-[#0d0d0f] border border-white/5 flex items-center gap-4 px-6 text-[11px] font-black uppercase tracking-widest text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-all shadow-elevation-1"
                          >
                            <Monitor size={16} className="text-[#52525b]" /> Open Runtime
                          </button>
                          <button 
                            onClick={() => navigate(`/logs?projectId=${selectedProject._id}`)}
                            className="w-full h-12 rounded-xl bg-[#0d0d0f] border border-white/5 flex items-center gap-4 px-6 text-[11px] font-black uppercase tracking-widest text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-all shadow-elevation-1"
                          >
                            <Terminal size={16} className="text-[#52525b]" /> Inspect Logs
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#1e1e20] border border-white/[0.04] p-8 rounded-[32px] shadow-elevation-1">
                        <h3 className="text-[11px] font-black text-[#52525b] uppercase tracking-[0.25em] mb-6">Project Health</h3>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-[#3f3f46] font-black uppercase tracking-widest">App Status</span>
                            <span className="text-[11px] text-[#22c55e] font-black uppercase tracking-widest">Running</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-[#3f3f46] font-black uppercase tracking-widest">Network Score</span>
                            <span className="text-[11px] text-white font-black uppercase tracking-widest">98.4 / 100</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-[#3f3f46] font-black uppercase tracking-widest">SLA Uptime</span>
                            <span className="text-[11px] text-white font-black uppercase tracking-widest">99.998%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
