import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import PageWrapper from "../../components/layout/PageWrapper";
import TopNav from "../../components/layout/TopNav";
import GlassButton from "../../components/ui/GlassButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, History as HistoryIcon, ArrowUpRight, ArrowDownRight,
  Clock, Plus, GitBranch, Globe, Activity, TrendingUp,
  Shield, Check, Box, Cpu, HardDrive, BarChart3, Search
} from "lucide-react";
import {
  getProjects,
  getDashboardStats,
  deleteProject
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { getFrameworkIcon } from "../../utils/frameworkIcons";

/* ── Status dot ── */
const StatusDot = ({ status }) => {
  const colors = { RUNNING: "bg-[#22c55e]", FAILED: "bg-[#ef4444]", BUILDING: "bg-[#eab308]" };
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[status] || "bg-[#52525b]"}`} />;
};

/* ── Stat card ── */
const StatCard = ({ label, value, Icon, color }) => (
  <div className="bg-[#1e1e20] border border-white/[0.04] p-4 rounded-[20px] flex flex-col gap-3 shadow-elevation-1 hover:border-white/[0.08] transition-all">
    <div className="flex items-center justify-between">
      <div className={`w-8 h-8 rounded-[12px] flex items-center justify-center bg-[#0d0d0f] border border-white/[0.05] shadow-2xl ${color}`}>
        <Icon size={15} />
      </div>
      <ArrowUpRight size={11} className="text-[#3f3f46]" />
    </div>
    <div>
      <p className="text-[18px] font-black text-[#e4e4e7] tracking-tighter leading-none">{value}</p>
      <p className="text-[8px] text-[#52525b] font-black uppercase tracking-[0.2em] mt-1.5">{label}</p>
    </div>
  </div>
);

/* ── Uptime bar ── */
const UptimeBar = ({ activityData = [] }) => {
  // Use activityData from props, or fallback to zeros if empty
  const data = activityData.length > 0 ? activityData : new Array(30).fill(0);
  const max = Math.max(...data, 1); // Avoid division by zero
  
  return (
    <div className="flex items-end gap-[2px] h-12 w-full">
      {data.map((val, i) => (
        <div
          key={i}
          style={{ height: `${(val / max) * 100}%` }}
          className={`flex-1 rounded-[2px] transition-colors ${val === 0 ? "bg-white/[0.05]" : "bg-[#22c55e]/40 hover:bg-[#22c55e]/70"}`}
          title={`${val} Deployments`}
        />
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalProjects: 0, 
    totalDeployments: 0, 
    successRate: "0%", 
    avgBuildTime: "42s",
    activityBars: [] 
  });
  const [chartPeriod, setChartPeriod] = useState('Monthly');
  const [recentDeployments, setRecentDeployments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, statsRes] = await Promise.all([getProjects(), getDashboardStats()]);
      const projs = projRes.data.data || [];
      setProjects(projs);
      if (statsRes.data.stats) setStats(statsRes.data.stats);

      // Build recent deployments list from projects
      const deps = projs
        .filter(p => p.latestDeployment)
        .map(p => ({ project: p, dep: p.latestDeployment }))
        .sort((a, b) => new Date(b.dep.createdAt) - new Date(a.dep.createdAt))
        .slice(0, 5);
      setRecentDeployments(deps);
    } catch (err) {
      console.error("Dashboard error:", err);
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

        <div className="flex-1">
          <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
            
            {/* Header Area */}
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/[0.04]">
              <div>
                <h1 className="text-[20px] font-black tracking-tighter text-[#e4e4e7] mb-1 uppercase leading-none">Welcome, {user?.name || 'User'}</h1>
                <p className="text-[8px] text-[#52525b] font-black uppercase tracking-[0.4em] mt-1">Manage your projects and deployments</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3f3f46] group-focus-within:text-white transition-colors" />
                  <input 
                    type="text" 
                    placeholder="SEARCH PROJECTS..."
                    className="h-9 pl-10 pr-5 bg-[#161618] border border-white/[0.04] rounded-xl text-[9px] font-black uppercase tracking-[0.2em] w-56 focus:outline-none focus:border-white/10 transition-all shadow-elevation-1 placeholder:text-[#2d2d33]"
                  />
                </div>
                <GlassButton variant="primary" onClick={() => navigate("/projects/new")} className="h-9 px-5 text-[9px] font-black uppercase tracking-[0.2em] shadow-elevation-2">
                  <Plus size={13} /> DEPLOY PROJECT
                </GlassButton>
              </div>
            </div>

            {/* Top Row: Mini Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Projects" value={stats.totalProjects} Icon={Box} color="text-white" />
              <StatCard label="Deployments" value={stats.totalDeployments} Icon={Rocket} color="text-white" />
              <StatCard label="Success Rate" value={stats.successRate} Icon={Check} color="text-white" />
              <StatCard label="Avg Build Time" value={stats.avgBuildTime} Icon={Clock} color="text-white" />
            </div>

            {/* Middle Section: Projects & Analytics */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* Left: Projects List */}
              <div className="col-span-12 lg:col-span-8 space-y-5">
                <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[32px] overflow-hidden shadow-elevation-2">
                    <div className="px-8 py-6 border-b border-white/[0.04] flex items-center justify-between bg-[#161618]">
                        <h2 className="text-[10px] font-black text-[#52525b] uppercase tracking-[0.3em]">Project List</h2>
                        <button onClick={() => navigate("/projects")} className="text-[9px] font-black text-[#a1a1aa] hover:text-white transition-colors uppercase tracking-[0.2em] border-b border-white/5 pb-0.5">VIEW ALL PROJECTS</button>
                    </div>
                    <div className="divide-y divide-white/[0.02] bg-[#0d0d0f]/20">
                        {loading ? (
                            [1,2,3].map(i => <div key={i} className="h-28 bg-white/[0.01] animate-pulse m-6 rounded-2xl" />)
                        ) : projects.length === 0 ? (
                            <div className="p-24 text-center text-[#3f3f46] text-[12px] font-black uppercase tracking-[0.3em]">No projects found.</div>
                        ) : (
                            projects.slice(0, 5).map((p) => {
                                const lastDeploy = p.latestDeployment;
                                return (
                                    <div 
                                        key={p._id} 
                                        onClick={() => navigate(`/deploy?projectId=${p._id}`)}
                                        className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.01] cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-[18px] bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center relative shadow-elevation-1 transition-transform group-hover:scale-105">
                                                {(() => {
                                                    const { Icon: FrameworkIcon } = getFrameworkIcon(p.framework || 'other');
                                                    return <FrameworkIcon size={24} className="text-[#3f3f46] group-hover:text-white transition-colors" />;
                                                })()}
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[2.5px] border-[#1e1e20] shadow-elevation-1 ${lastDeploy?.status === 'running' ? 'bg-[#22c55e]' : 'bg-[#1e1e20] border-white/5'} `} />
                                            </div>
                                            <div>
                                                <p className="text-[15px] font-black text-[#e4e4e7] mb-1.5 uppercase tracking-tighter group-hover:text-[#22c55e] transition-colors">{p.name}</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-2 text-[10px] text-[#52525b] font-black uppercase tracking-widest"><GitBranch size={12} /> {p.branch || 'main'}</span>
                                                    <div className="w-1 h-1 rounded-full bg-[#1e1e20] border border-white/5" />
                                                    <span className="text-[10px] text-[#52525b] font-black uppercase tracking-widest">{p.framework}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[9px] font-black text-[#3f3f46] uppercase tracking-[0.2em] mb-1.5">Status: {lastDeploy?.status === 'running' ? 'RUNNING' : 'IDLE'}</p>
                                                <p className={`text-[11px] font-black uppercase tracking-widest ${lastDeploy?.status === 'running' ? 'text-[#22c55e]' : 'text-[#3f3f46]'}`}>{lastDeploy?.status === 'running' ? 'Stable' : 'Offline'}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-[18px] bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#3f3f46] group-hover:text-white group-hover:bg-[#1e1e20] transition-all shadow-elevation-1">
                                                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Operational Telemetry Chart — generated from real activityBars */}
                <div className="bg-[#1e1e20] border border-white/[0.04] p-5 rounded-[24px] shadow-elevation-1">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[10px] font-black text-[#52525b] uppercase tracking-[0.3em]">Deployment Activity</h2>
                        <div className="flex bg-[#0d0d0f] p-1 rounded-xl gap-1 border border-white/5">
                            {['Daily', 'Weekly', 'Monthly'].map(t => (
                                <button
                                  key={t}
                                  onClick={() => setChartPeriod(t)}
                                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                                    t === chartPeriod ? 'bg-[#1e1e20] text-white shadow-elevation-1 border border-white/5' : 'text-[#3f3f46] hover:text-[#52525b]'
                                  }`}
                                >{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="h-48 relative">
                      {(() => {
                        // Slice activityBars based on period
                        const bars = stats.activityBars || [];
                        const slice = chartPeriod === 'Daily' ? bars.slice(-7)
                          : chartPeriod === 'Weekly' ? bars.slice(-14)
                          : bars;
                        const data = slice.length > 0 ? slice : new Array(30).fill(0);
                        const max = Math.max(...data, 1);
                        const w = 800;
                        const h = 160;
                        const pts = data.map((v, i) => {
                          const x = (i / (data.length - 1)) * w;
                          const y = h - (v / max) * (h * 0.85) - 10;
                          return [x, y];
                        });
                        // Build smooth bezier path
                        let d = `M${pts[0][0]},${pts[0][1]}`;
                        for (let i = 1; i < pts.length; i++) {
                          const [x0, y0] = pts[i - 1];
                          const [x1, y1] = pts[i];
                          const cx = (x0 + x1) / 2;
                          d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
                        }
                        const fill = `${d} L${pts[pts.length-1][0]},${h} L0,${h} Z`;
                        const labels = chartPeriod === 'Daily'
                          ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
                          : chartPeriod === 'Weekly'
                          ? ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12','W13','W14']
                          : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        return (
                          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.12" />
                                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path d={d} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.6" className="drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                            <path d={fill} fill="url(#chartGrad)" />
                            {pts.map(([x, y], i) => (
                              <circle key={i} cx={x} cy={y} r="3" fill="#22c55e" opacity="0.5" />
                            ))}
                          </svg>
                        );
                      })()}
                      <div className="absolute bottom-0 inset-x-0 flex justify-between text-[8px] text-[#3f3f46] font-black uppercase tracking-[0.2em]">
                        {(chartPeriod === 'Daily'
                          ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
                          : chartPeriod === 'Weekly'
                          ? ['W1','','W3','','W5','','W7','','W9','','W11','','W13','']
                          : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                        ).map(m => <span key={m}>{m}</span>)}
                      </div>
                    </div>
                </div>
              </div>

              {/* Right Sidebar: Messages & Uptime */}
              <div className="col-span-12 lg:col-span-4 space-y-4">
                {/* Consultation Card */}
                <div className="bg-[#1e1e20] border border-white/[0.04] p-5 rounded-[24px] shadow-elevation-1">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[8px] font-black text-[#52525b] uppercase tracking-[0.3em]">User Profile</p>
                        <button onClick={() => navigate('/account')} className="text-[8px] font-black text-[#a1a1aa] hover:text-white transition-colors uppercase tracking-widest">Settings</button>
                    </div>
                    <div className="bg-[#0d0d0f] rounded-xl p-4 flex items-center gap-4 border border-white/[0.04] shadow-elevation-1">
                        <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Velora'}&background=1e1e20&color=fff`} className="w-9 h-9 rounded-xl border border-white/5 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-black text-[#e4e4e7] uppercase tracking-tighter leading-tight truncate">{user?.name || 'User'}</p>
                            <p className="text-[8px] text-[#52525b] font-black uppercase tracking-[0.2em] mt-1">Velora User</p>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 shrink-0"><Activity size={14} /></div>
                    </div>
                </div>

                {/* Uptime Monitoring */}
                <div className="bg-[#1e1e20] border border-white/[0.04] p-5 rounded-[24px] shadow-elevation-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[8px] font-black text-[#52525b] uppercase tracking-[0.3em]">Real-time Status</h3>
                        <span className="text-[8px] font-black text-[#22c55e] uppercase tracking-widest">{stats.successRate} Operational</span>
                    </div>
                    <div className="py-2">
                        <UptimeBar activityData={stats.activityBars} />
                    </div>
                    <div className="flex justify-between mt-4">
                        <span className="text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.25em]">30d ACTIVITY</span>
                        <span className="text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.25em]">LIVE MONITORING</span>
                    </div>
                </div>

                {/* Recent Deployments Log — real data */}
                <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[32px] overflow-hidden shadow-elevation-1">
                    <div className="px-8 py-6 border-b border-white/[0.04] bg-[#161618] flex items-center justify-between">
                        <h3 className="text-[9px] font-black text-[#52525b] uppercase tracking-[0.3em]">Deployment History</h3>
                        <button onClick={() => navigate('/deploy')} className="text-[9px] font-black text-[#a1a1aa] hover:text-white transition-colors uppercase tracking-widest">View All</button>
                    </div>
                    <div className="p-3 space-y-2 bg-[#0d0d0f]/20">
                        {loading ? (
                          [1,2,3].map(i => <div key={i} className="h-16 bg-white/[0.01] animate-pulse m-2 rounded-[18px]" />)
                        ) : recentDeployments.length === 0 ? (
                          <div className="px-5 py-8 text-center text-[9px] font-black text-[#3f3f46] uppercase tracking-[0.3em]">No recent activity</div>
                        ) : recentDeployments.map(({ project: p, dep }, i) => {
                          const statusColor = dep.status === 'running' ? 'text-[#22c55e]' : dep.status === 'failed' ? 'text-[#ef4444]' : dep.status === 'building' ? 'text-[#eab308]' : 'text-[#3f3f46]';
                          const timeAgo = dep.createdAt ? (() => {
                            const diff = Date.now() - new Date(dep.createdAt);
                            const m = Math.floor(diff / 60000);
                            const h = Math.floor(m / 60);
                            const d = Math.floor(h / 24);
                            return d > 0 ? `${d}d` : h > 0 ? `${h}h` : `${m}m`;
                          })() : '?';
                          const tag = (p.name || 'NODE').slice(0, 4).toUpperCase();
                          return (
                            <div
                              key={i}
                              onClick={() => navigate(`/deployment-progress/${dep._id}`)}
                              className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.01] rounded-[20px] transition-all group cursor-pointer"
                            >
                              <div className="w-10 h-10 rounded-[14px] bg-[#0d0d0f] flex items-center justify-center text-[#3f3f46] group-hover:text-white font-black text-[8px] border border-white/[0.04] uppercase tracking-widest transition-colors shadow-elevation-1 shrink-0">{tag}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-[#e4e4e7] uppercase tracking-tighter leading-tight truncate">{p.name}</p>
                                <p className={`text-[8px] font-black uppercase tracking-widest truncate mt-1 ${statusColor}`}>{dep.status?.toUpperCase() || 'UNKNOWN'}</p>
                              </div>
                              <span className="text-[8px] text-[#3f3f46] font-black uppercase tracking-widest whitespace-nowrap">{timeAgo} AGO</span>
                            </div>
                          );
                        })}
                    </div>
                    <div className="p-5 bg-[#0d0d0f]">
                        <button
                          onClick={() => navigate('/logs')}
                          className="w-full h-10 bg-[#1e1e20] border border-white/[0.04] rounded-xl text-[9px] font-black uppercase tracking-[0.25em] text-[#3f3f46] hover:text-white hover:border-white/[0.08] transition-all flex items-center justify-center gap-3"
                        >
                          <Activity size={12} /> VIEW_LIVE_LOGS
                        </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
