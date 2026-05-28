import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import PageWrapper from "../../components/layout/PageWrapper";
import TopNav from "../../components/layout/TopNav";
import { PageShell, PageHeader, Card, EmptyState } from "../../components/layout/PageLayout";
import { Search, Plus, Globe, GitBranch, Terminal, Layers, Settings, Clock, Rocket } from "lucide-react";
import { getProjects } from "../../api/api";
import GlassButton from "../../components/ui/GlassButton";
import StatusBadge from "../../components/ui/StatusBadge";
import { motion } from "framer-motion";

export default function Overview() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  const navigate = useNavigate();
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('cache_overview_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(!localStorage.getItem('cache_overview_projects'));
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getProjects();
        if (cancelled) return;
        const projectData = Array.isArray(data?.data) ? data.data : [];
        setProjects(projectData);
        localStorage.setItem('cache_overview_projects', JSON.stringify(projectData));
      } catch (err) { 
        console.error("Overview Fetch Error:", err);
      } finally { 
        if (!cancelled) setLoading(false); 
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() =>
    projects.filter((p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.repoUrl?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [projects, searchQuery]);

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-white font-sans overflow-hidden">
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
                  <span className="px-3 py-1 rounded-lg bg-[#1e1e20] border border-white/[0.04] text-[9px] font-black text-[#52525b] uppercase tracking-[0.3em]">PROJECT LIST</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                </div>
                <h1 className="text-[36px] font-black tracking-tighter uppercase text-white leading-none">All Projects</h1>
                <p className="text-[10px] text-[#3f3f46] font-black uppercase tracking-[0.4em] mt-5">View and manage your deployed applications</p>
              </div>
              <GlassButton 
                variant="primary" 
                className="h-14 px-10 gap-4 text-[10px] font-black uppercase tracking-[0.25em] shadow-elevation-2"
                onClick={() => navigate("/projects/new")}
              >
                <Plus size={18} /> DEPLOY PROJECT
              </GlassButton>
            </div>

            {/* Filter & Telemetry Row */}
            <div className="flex items-center justify-between mb-10">
              <div className="relative group">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#1e1e20] group-focus-within:text-[#52525b] transition-colors" />
                <input
                  type="text"
                  placeholder="SEARCH PROJECTS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-14 pr-8 text-[11px] w-[320px] bg-[#0d0d0f] border border-white/[0.04] rounded-[20px] text-white placeholder:text-[#1e1e20] focus:outline-none focus:border-white/[0.1] transition-all font-black uppercase tracking-[0.2em] shadow-inner"
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#0d0d0f] border border-white/[0.04]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  <span className="text-[9px] font-black text-[#52525b] uppercase tracking-[0.3em]">
                    {loading ? "FETCHING..." : `${filtered.length} PROJECTS`}
                  </span>
                </div>
              </div>
            </div>

            {/* Skeleton / Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-[#1e1e20] border border-white/[0.04] rounded-[48px] h-[320px] animate-pulse shadow-elevation-1" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filtered.length === 0 && (
              <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[56px] p-24 text-center shadow-elevation-1">
                <div className="w-20 h-20 rounded-3xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center mx-auto mb-10 shadow-elevation-2">
                  <Rocket size={32} className="text-[#1e1e20]" />
                </div>
                <h3 className="text-[20px] font-black text-white uppercase tracking-tighter mb-4">No Projects</h3>
                <p className="text-[11px] text-[#3f3f46] font-black uppercase tracking-[0.3em] mb-12 max-w-[320px] mx-auto leading-relaxed">You haven't created any projects yet. Start by deploying your first app.</p>
                <GlassButton 
                  variant="primary" 
                  className="h-14 px-12 text-[10px] font-black uppercase tracking-[0.3em]"
                  onClick={() => navigate("/projects/new")}
                >
                  CREATE PROJECT
                </GlassButton>
              </div>
            )}

            {/* Projects Grid */}
            {!loading && filtered.length > 0 && (
              <motion.div
                initial="hidden" animate="show"
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filtered.map((project) => (
                  <motion.div
                    key={project._id}
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    className="group"
                  >
                    <div 
                      className="bg-[#1e1e20] border border-white/[0.04] rounded-[48px] overflow-hidden flex flex-col h-[360px] shadow-elevation-1 hover:shadow-elevation-2 hover:border-white/[0.08] transition-all cursor-pointer relative"
                      onClick={() => navigate(`/deploy?projectId=${project._id}`)}
                    >
                      <div className="p-10 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-10">
                          <div className="w-16 h-16 rounded-[28px] bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center shadow-elevation-2 group-hover:border-[#22c55e]/30 transition-all">
                            <Globe size={24} className="text-[#3f3f46] group-hover:text-[#22c55e] transition-all" />
                          </div>
                          <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] ${
                            project.lastDeploymentStatus?.toUpperCase() === 'SUCCESSFUL' ? 'bg-[#22c55e]/5 border-[#22c55e]/10 text-[#22c55e]' :
                            project.lastDeploymentStatus?.toUpperCase() === 'FAILED' ? 'bg-[#ef4444]/5 border-[#ef4444]/10 text-[#ef4444]' :
                            'bg-white/5 border-white/10 text-white animate-pulse'
                          }`}>
                            {project.lastDeploymentStatus || "RUNNING"}
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-[22px] font-black text-white uppercase tracking-tighter mb-4 group-hover:text-[#22c55e] transition-colors truncate">
                            {project.name}
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <GitBranch size={14} className="text-[#1e1e20]" />
                              <span className="text-[11px] text-[#52525b] font-black uppercase tracking-widest">{project.branch || "main"}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <Clock size={14} className="text-[#1e1e20]" />
                              <span className="text-[11px] text-[#52525b] font-black uppercase tracking-widest">
                                {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Administrative Controls */}
                      <div className="flex border-t border-white/[0.04] bg-[#0d0d0f]/20">
                        {[
                          { icon: Terminal, label: "LOGS",     fn: () => navigate(`/deploy?projectId=${project._id}`) },
                          { icon: Layers,   label: "DEPLOYS",  fn: () => navigate(`/deploy?projectId=${project._id}`) },
                          { icon: Settings, label: "CONFIG",   fn: () => navigate(`/settings?projectId=${project._id}`) },
                        ].map(({ icon: Icon, label, fn }, i) => (
                          <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); fn(); }}
                            className="flex-1 flex flex-col items-center justify-center gap-3 py-6 text-[#1e1e20] hover:text-white hover:bg-white/[0.02] transition-all border-r border-white/[0.04] last:border-0"
                          >
                            <Icon size={16} strokeWidth={2} />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
  );
}
